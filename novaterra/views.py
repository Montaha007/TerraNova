from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.gis.geos import GEOSGeometry
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
import json
import traceback
from django.conf import settings

from .services.weather_service import WeatherService

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Location, Field

# ========================
# Authentication API Views
# ========================

# novaterra/views.py

from django.contrib.gis.geos import Point
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Location, UserProfile


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # Account data
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    phone_number = request.data.get('phone_number', '')
    
    # Farm data
    farm_name = request.data.get('farm_name', 'My Farm')
    city = request.data.get('city')  # e.g., "Nabeul"
    
    # Validation
    if not username or not password:
        return Response(
            {'error': 'Username and password required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not city:
        return Response(
            {'error': 'City/location is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )
    
    # Update profile
    profile = user.profile
    profile.farm_name = farm_name
    profile.phone_number = phone_number
    profile.save()
    
    # Coordinate mapping for Tunisian cities
    city_coordinates = {
        'nabeul': (36.4516, 10.7358),
        'tunis': (36.8065, 10.1815),
        'sousse': (35.8256, 10.6411),
        'sfax': (34.7400, 10.7600),
        'bizerte': (37.2744, 9.8739),
        'gabes': (33.8815, 10.0982),
        'kairouan': (35.6781, 10.0963),
        'monastir': (35.7772, 10.8264),
        'beja': (36.7256, 9.1817),
        'ariana': (36.8625, 10.1956),
    }
    
    # Get coordinates
    coords = city_coordinates.get(city.lower(), (36.8, 10.2))  # Default to Tunisia center
    
    # Create main farm location with GeoDjango Point
    farm_location = Location.objects.create(
        user=user,
        name=farm_name,
        location_type='farm',
        city=city.title(),
        point=Point(coords[1], coords[0]),  # Point(longitude, latitude)
    )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'message': 'Registration successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        },
        'farm': {
            'name': farm_name,
            'city': city.title(),
            'location_id': farm_location.id,
            'latitude': farm_location.latitude,
            'longitude': farm_location.longitude,
        },
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_user_farm_data(request):
    """Get all user's farm data including locations, fields, cameras, stock"""
    user = request.user
    
    # Get main farm location
    farm_location = Location.objects.filter(
        user=user, 
        location_type='farm'
    ).first()
    
    # Get all fields with polygon data
    fields = []
    for field in user.fields.all():
        field_data = {
            'id': field.id,
            'name': field.location.name,
            'crop_type': field.crop_type,
            'status': field.status,
            'area_size': float(field.area_size) if field.area_size else None,
            'planting_date': field.planting_date,
            'latitude': field.location.latitude,
            'longitude': field.location.longitude,
        }
        
        # Add polygon coordinates if shape exists
        if field.location.shape and field.location.shape.geom_type == 'Polygon':
            coords = list(field.location.shape.coords[0])
            # Convert from (lng, lat) to [lat, lng] for Leaflet
            polygon = [[lat, lng] for lng, lat in coords]
            field_data['polygon'] = polygon
        
        fields.append(field_data)
    
    # Get all cameras
    from .models import Camera
    cameras = []
    for camera in user.novaterra_cameras.all():
        cameras.append({
            'id': camera.id,
            'name': camera.name,
            'latitude': camera.location.latitude,
            'longitude': camera.location.longitude,
            'stream_url': camera.get_stream_url(),  # Call the method to generate go2rtc URL
            'hls_url': camera.get_hls_url(),
            'is_active': camera.is_active,
        })
    
    # Get stock
    stock = []
    for item in user.stock.all():
        stock.append({
            'id': item.id,
            'name': item.item_name,
            'category': item.category,
            'quantity': float(item.quantity),
            'unit': item.unit,
        })
    
    return Response({
        'farm': {
            'name': user.profile.farm_name,
            'city': farm_location.city if farm_location else None,
            'latitude': farm_location.latitude if farm_location else None,
            'longitude': farm_location.longitude if farm_location else None,
        },
        'fields': fields,
        'cameras': cameras,
        'stock': stock,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_field(request):
    """Create a new field with polygon boundary"""
    user = request.user
    
    try:
        field_name = request.data.get('name')
        crop_type = request.data.get('crop_type')
        planting_date = request.data.get('planting_date')
        notes = request.data.get('notes', '')
        polygon = request.data.get('polygon')  # Array of [lat, lng] coordinates
        area_size = request.data.get('area_size')
        
        if not all([field_name, crop_type, polygon]):
            return Response(
                {'error': 'Field name, crop type, and polygon are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert polygon coordinates to GEOSGeometry
        # Polygon format: [[[lng, lat], [lng, lat], ...]]
        # Need to convert from [[lat, lng], ...] to [[[lng, lat], ...]]
        from django.contrib.gis.geos import GEOSGeometry, Point, Polygon as GeoPolygon
        import json
        
        # Convert coordinates from [lat, lng] to [lng, lat]
        polygon_coords = [[coord[1], coord[0]] for coord in polygon]
        
        # Ensure polygon is closed (first and last point must be the same)
        if polygon_coords[0] != polygon_coords[-1]:
            polygon_coords.append(polygon_coords[0])
        
        # Wrap in array for GeoJSON Polygon format
        polygon_coords = [polygon_coords]
        
        # Create Polygon geometry
        geom_polygon = GEOSGeometry(json.dumps({
            'type': 'Polygon',
            'coordinates': polygon_coords
        }))
        
        # Calculate center point for marker
        centroid = geom_polygon.centroid
        center_point = Point(centroid.x, centroid.y)
        
        # Create location for field
        field_location = Location.objects.create(
            user=user,
            name=field_name,
            location_type='field',
            point=center_point,
            shape=geom_polygon
        )
        
        # Create field
        from .models import Field
        field = Field.objects.create(
            owner=user,
            location=field_location,
            crop_type=crop_type,
            planting_date=planting_date if planting_date else None,
            notes=notes,
            area_size=area_size
        )
        
        return Response({
            'message': 'Field created successfully',
            'field': {
                'id': field.id,
                'name': field_location.name,
                'crop_type': field.crop_type,
                'area_size': float(field.area_size) if field.area_size else None,
                'latitude': field_location.latitude,
                'longitude': field_location.longitude,
                'polygon': polygon
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        traceback.print_exc()
        return Response(
            {'error': f'Failed to create field: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_camera(request):
    """Create a new camera at specified location"""
    user = request.user
    
    try:
        camera_name = request.data.get('name')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        stream_url = request.data.get('stream_url', '')
        notes = request.data.get('notes', '')
        
        if not all([camera_name, latitude, longitude]):
            return Response(
                {'error': 'Camera name, latitude, and longitude are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create location for camera
        from django.contrib.gis.geos import Point
        camera_location = Location.objects.create(
            user=user,
            name=camera_name,
            location_type='other',
            point=Point(float(longitude), float(latitude))
        )
        
        # Create camera
        from .models import Camera
        camera = Camera.objects.create(
            owner=user,
            location=camera_location,
            name=camera_name,
            stream_url=stream_url,
            is_active=True
        )
        
        return Response({
            'message': 'Camera created successfully',
            'camera': {
                'id': camera.id,
                'name': camera.name,
                'latitude': camera_location.latitude,
                'longitude': camera_location.longitude,
                'stream_url': camera.stream_url,
                'is_active': camera.is_active
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        traceback.print_exc()
        return Response(
            {'error': f'Failed to create camera: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_field(request, field_id):
    """Delete a field and its location"""
    user = request.user
    
    try:
        from .models import Field
        field = get_object_or_404(Field, id=field_id, owner=user)
        location = field.location
        
        # Delete field and location
        field.delete()
        location.delete()
        
        return Response({
            'message': 'Field deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        traceback.print_exc()
        return Response(
            {'error': f'Failed to delete field: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_camera(request, camera_id):
    """Delete a camera and its location"""
    user = request.user
    
    try:
        from .models import Camera
        camera = get_object_or_404(Camera, id=camera_id, owner=user)
        location = camera.location
        
        # Delete camera and location
        camera.delete()
        location.delete()
        
        return Response({
            'message': 'Camera deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        traceback.print_exc()
        return Response(
            {'error': f'Failed to delete camera: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def add_field(request):
    """DEPRECATED: Use create_field instead. Legacy endpoint for compatibility"""
    user = request.user
    
    field_name = request.data.get('name')
    crop_type = request.data.get('crop_type')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    
    if not all([field_name, crop_type]):
        return Response(
            {'error': 'Field name and crop type are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create location for field
    field_location = Location.objects.create(
        user=user,
        name=field_name,
        location_type='field',
        point=Point(float(longitude), float(latitude)) if latitude and longitude else None
    )
    
    # Create field
    from .models import Field
    field = Field.objects.create(
        owner=user,
        location=field_location,
        crop_type=crop_type,
    )
    
    return Response({
        'message': 'Field added successfully',
        'field': {
            'id': field.id,
            'name': field_location.name,
            'crop_type': field.crop_type,
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    User Login Endpoint
    POST /api/login/
    Body: {"username": "user", "password": "pass123"}
    """
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful',
            'user': {
                'username': user.username,
                'email': user.email,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        traceback.print_exc()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    User Logout Endpoint
    POST /api/logout/
    Headers: Authorization: Bearer <access_token>
    Body: {"refresh": "refresh_token"}
    """
    try:
        refresh_token = request.data.get('refresh')
        
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': 'Invalid token or logout failed'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get Current User Information
    GET /api/user/
    Headers: Authorization: Bearer <access_token>
    """
    try:
        user = request.user
        profile = UserProfile.objects.filter(user=user).first()
        
        # Count user's fields and total area
        user_fields = Field.objects.filter(owner=user)
        total_fields = user_fields.count()
        total_area = sum([float(field.area_size) for field in user_fields if field.area_size])
        
        # Get city from first location if available
        first_location = Location.objects.filter(user=user).first()
        city = first_location.city if first_location else ''
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone_number': profile.phone_number if profile else '',
            'farm_name': profile.farm_name if profile else '',
            'city': city,
            'date_joined': user.date_joined.isoformat(),
            'total_fields': total_fields,
            'total_area': round(total_area, 2) if total_area else 0,
            'total_scans': 0,  # Placeholder - can be updated when disease scans tracking is implemented
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update User Profile Information
    PUT /api/user/update/
    Headers: Authorization: Bearer <access_token>
    Body: {
        "email": "user@example.com",
        "phone_number": "+21620123456",
        "farm_name": "My Farm",
        "city": "Tunis"
    }
    """
    try:
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update user email if provided
        if 'email' in request.data:
            user.email = request.data.get('email', '')
            user.save()
        
        # Update profile fields
        if 'phone_number' in request.data:
            profile.phone_number = request.data.get('phone_number', '')
        if 'farm_name' in request.data:
            profile.farm_name = request.data.get('farm_name', '')
        
        profile.save()
        
        # Update city in first location if provided
        if 'city' in request.data:
            first_location = Location.objects.filter(user=user).first()
            if first_location:
                first_location.city = request.data.get('city', '')
                first_location.save()
        
        # Return updated user data
        user_fields = Field.objects.filter(owner=user)
        total_fields = user_fields.count()
        total_area = sum([float(field.area_size) for field in user_fields if field.area_size])
        
        # Get city from first location
        first_location = Location.objects.filter(user=user).first()
        city = first_location.city if first_location else ''
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone_number': profile.phone_number,
            'farm_name': profile.farm_name,
            'city': city,
            'date_joined': user.date_joined.isoformat(),
            'total_fields': total_fields,
            'total_area': round(total_area, 2) if total_area else 0,
            'total_scans': 0,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change User Password
    POST /api/user/change-password/
    Headers: Authorization: Bearer <access_token>
    Body: {
        "old_password": "current_password",
        "new_password": "new_password"
    }
    """
    try:
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response(
                {'error': 'Both old and new passwords are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if old password is correct
        if not user.check_password(old_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new password length
        if len(new_password) < 6:
            return Response(
                {'error': 'New password must be at least 6 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ========================
# Legacy Views
# ========================

@api_view(["GET"])
def test_api(request):
    data = {"message": "API is working!"}
    return Response(data)

def index(request):
    return render(request, 'novaterra/home.html')


@login_required
def locations_map(request):
    return render(request, 'novaterra/locations_map.html')

def save_location(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            point_data = data.get('point')
            shape_data = data.get('shape')
            user = request.user

            point = GEOSGeometry(json.dumps(point_data)) if point_data else None
            shape = GEOSGeometry(json.dumps(shape_data)) if shape_data else None

            location = Location.objects.create(
                name=name,
                point=point,
                shape=shape,
                user=user
            )
            return JsonResponse({'status': 'success', 'location_id': location.id})
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_weather(request):
    """Get current weather for user's farm location"""
    user = request.user
    
    # Get user's main farm location
    farm_location = Location.objects.filter(
        user=user,
        location_type='farm'
    ).first()
    
    if not farm_location or not farm_location.point:
        return Response(
            {'error': 'Farm location not set'},
            status=400
        )
    
    # Get weather data
    print(f"Fetching weather for: {farm_location.latitude}, {farm_location.longitude}")
    print(f"API Key set: {bool(settings.OPENWEATHER_API_KEY)}")
    
    weather_data = WeatherService.get_current_weather(
        latitude=farm_location.latitude,
        longitude=farm_location.longitude
    )
    
    if not weather_data:
        print("Using mock weather data (API key not yet active)")
        weather_data = WeatherService.get_mock_weather()
    
    return Response({
        'weather': weather_data,
        'location': {
            'name': farm_location.name,
            'city': farm_location.city,
            'latitude': farm_location.latitude,
            'longitude': farm_location.longitude,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_forecast(request):
    """Get 5-day weather forecast"""
    user = request.user
    
    farm_location = Location.objects.filter(
        user=user,
        location_type='farm'
    ).first()
    
    if not farm_location or not farm_location.point:
        return Response({'error': 'Farm location not set'}, status=400)
    
    forecast_data = WeatherService.get_5day_forecast(
        latitude=farm_location.latitude,
        longitude=farm_location.longitude
    )
    
    if not forecast_data:
        return Response({'error': 'Unable to fetch forecast'}, status=503)
    
    return Response({'forecast': forecast_data})


# ========================
# IoT Monitoring API Views
# ========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_iot_sensors(request):
    """
    Get all IoT sensors for user's fields
    
    GET /api/iot/sensors/
    """
    try:
        # Placeholder for future IoT sensor implementation
        # Will return mock data until sensors are deployed
        
        sensors = [
            {
                'id': 1,
                'field_id': 1,
                'field_name': 'North Field',
                'sensor_type': 'temperature',
                'current_value': 24.5,
                'unit': '°C',
                'status': 'active',
                'last_reading': timezone.now().isoformat(),
                'battery_level': 85
            },
            {
                'id': 2,
                'field_id': 1,
                'field_name': 'North Field',
                'sensor_type': 'soil_moisture',
                'current_value': 65.2,
                'unit': '%',
                'status': 'active',
                'last_reading': timezone.now().isoformat(),
                'battery_level': 78
            },
            {
                'id': 3,
                'field_id': 1,
                'field_name': 'North Field',
                'sensor_type': 'humidity',
                'current_value': 72.0,
                'unit': '%',
                'status': 'active',
                'last_reading': timezone.now().isoformat(),
                'battery_level': 92
            }
        ]
        
        return Response({
            'sensors': sensors,
            'total': len(sensors),
            'active': len([s for s in sensors if s['status'] == 'active'])
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sensor_data(request, field_id):
    """
    Get sensor data for specific field
    
    GET /api/iot/sensor-data/<field_id>/
    Query params:
        - sensor_type: temperature, soil_moisture, humidity, ph
        - hours: number of hours of history (default 24)
    """
    try:
        sensor_type = request.query_params.get('sensor_type', 'all')
        hours = int(request.query_params.get('hours', 24))
        
        # Verify field ownership
        try:
            field = Field.objects.get(id=field_id, location__farm__user=request.user)
        except Field.DoesNotExist:
            return Response({
                'error': 'Field not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Mock sensor data for now
        # In production, this will query MongoDB time-series data
        from datetime import timedelta
        import random
        
        now = timezone.now()
        readings = []
        
        for i in range(hours):
            timestamp = now - timedelta(hours=hours-i)
            
            if sensor_type in ['temperature', 'all']:
                readings.append({
                    'sensor_type': 'temperature',
                    'value': round(20 + random.uniform(-3, 8), 1),
                    'unit': '°C',
                    'timestamp': timestamp.isoformat()
                })
            
            if sensor_type in ['soil_moisture', 'all']:
                readings.append({
                    'sensor_type': 'soil_moisture',
                    'value': round(60 + random.uniform(-10, 15), 1),
                    'unit': '%',
                    'timestamp': timestamp.isoformat()
                })
            
            if sensor_type in ['humidity', 'all']:
                readings.append({
                    'sensor_type': 'humidity',
                    'value': round(65 + random.uniform(-10, 20), 1),
                    'unit': '%',
                    'timestamp': timestamp.isoformat()
                })
        
        return Response({
            'field_id': field_id,
            'field_name': field.name,
            'sensor_type': sensor_type,
            'readings': readings,
            'total_readings': len(readings)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========================
# AI Advisor API Views
# ========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ai_recommendations(request):
    """
    Get AI-powered farming recommendations
    
    GET /api/advisor/recommendations/
    """
    try:
        # Mock recommendations for now
        # In production, this will use ML models based on:
        # - Current weather conditions
        # - Soil sensor data
        # - Historical yield data
        # - Disease patterns
        
        recommendations = [
            {
                'id': 1,
                'category': 'irrigation',
                'priority': 'high',
                'title': 'Irrigation Recommended',
                'description': 'Soil moisture levels are below optimal. Consider irrigating within the next 24 hours.',
                'field_ids': [1, 2],
                'confidence': 0.87,
                'created_at': timezone.now().isoformat()
            },
            {
                'id': 2,
                'category': 'disease_prevention',
                'priority': 'medium',
                'title': 'Apply Preventive Fungicide',
                'description': 'Weather conditions favorable for fungal diseases. Preventive application recommended.',
                'field_ids': [1],
                'confidence': 0.72,
                'created_at': timezone.now().isoformat()
            },
            {
                'id': 3,
                'category': 'harvest',
                'priority': 'low',
                'title': 'Optimal Harvest Window',
                'description': 'Weather forecast shows 5 days of dry conditions. Good window for harvesting.',
                'field_ids': [3],
                'confidence': 0.91,
                'created_at': timezone.now().isoformat()
            }
        ]
        
        return Response({
            'recommendations': recommendations,
            'total': len(recommendations)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_crop_suggestions(request):
    """
    Get AI crop suggestions based on field conditions
    
    POST /api/advisor/crop-suggestions/
    Body:
        - field_id: ID of field
        - soil_type: (optional) sandy, clay, loam
        - season: (optional) spring, summer, fall, winter
    """
    try:
        field_id = request.data.get('field_id')
        soil_type = request.data.get('soil_type', 'loam')
        season = request.data.get('season', 'spring')
        
        # Verify field ownership if provided
        if field_id:
            try:
                field = Field.objects.get(id=field_id, location__farm__user=request.user)
            except Field.DoesNotExist:
                return Response({
                    'error': 'Field not found or access denied'
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Mock crop suggestions
        # In production, this will use ML model trained on:
        # - Soil analysis data
        # - Climate conditions
        # - Historical yields
        # - Market prices
        
        suggestions = [
            {
                'crop': 'Tomato',
                'suitability_score': 0.92,
                'estimated_yield': '45-55 tons/hectare',
                'growing_season': '90-120 days',
                'water_requirements': 'Medium-High',
                'market_price': 'High',
                'reasons': [
                    'Excellent soil conditions',
                    'Optimal temperature range',
                    'High market demand',
                    'Good disease resistance varieties available'
                ]
            },
            {
                'crop': 'Wheat',
                'suitability_score': 0.78,
                'estimated_yield': '3-4 tons/hectare',
                'growing_season': '120-150 days',
                'water_requirements': 'Low-Medium',
                'market_price': 'Stable',
                'reasons': [
                    'Good for crop rotation',
                    'Low water requirements',
                    'Stable market prices'
                ]
            },
            {
                'crop': 'Olives',
                'suitability_score': 0.85,
                'estimated_yield': '2-3 tons/hectare',
                'growing_season': 'Perennial',
                'water_requirements': 'Low',
                'market_price': 'High',
                'reasons': [
                    'Well-suited to local climate',
                    'Drought resistant',
                    'High value crop',
                    'Long-term investment'
                ]
            }
        ]
        
        return Response({
            'field_id': field_id,
            'soil_type': soil_type,
            'season': season,
            'suggestions': suggestions,
            'total': len(suggestions)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)