import requests
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import DiseaseDetection, TreatmentRecommendation
from novaterra.models import Field

AI_SERVICE_URL = "http://localhost:5000"


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_disease(request):
    """
    Detect plant diseases in uploaded image
    
    POST /api/detect-disease/
    Form data:
        - image: Image file
        - field_id: (optional) ID of field where photo was taken
    """
    try:
        if 'image' not in request.FILES:
            return Response({
                'error': 'No image provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        field_id = request.data.get('field_id')
        
        # Validate field ownership if provided
        field = None
        if field_id:
            try:
                field = Field.objects.get(id=field_id, location__farm__user=request.user)
            except Field.DoesNotExist:
                return Response({
                    'error': 'Field not found or access denied'
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Send image to AI service
        image_file.seek(0)  # Reset file pointer
        files = {'file': (image_file.name, image_file.read(), image_file.content_type)}
        
        try:
            response = requests.post(
                f"{AI_SERVICE_URL}/detect",
                files=files,
                timeout=30
            )
            response.raise_for_status()
        except requests.exceptions.ConnectionError:
            return Response({
                'error': 'AI service is not running',
                'details': 'Please start the AI service on port 5000'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except requests.exceptions.Timeout:
            return Response({
                'error': 'AI service timeout',
                'details': 'The request took too long to process'
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        
        if response.status_code != 200:
            return Response({
                'error': 'AI service error',
                'details': response.text
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        detection_result = response.json()
        
        # Save detections to database
        saved_detections = []
        if detection_result.get('detected'):
            # Reset file pointer to save the image
            image_file.seek(0)
            
            for disease in detection_result.get('diseases', []):
                detection = DiseaseDetection.objects.create(
                    user=request.user,
                    field=field,
                    disease_name=disease['class'],
                    confidence=disease['confidence'],
                    severity='high' if disease['confidence'] > 0.8 else 'medium' if disease['confidence'] > 0.5 else 'low',
                    image=image_file,
                    bbox=disease.get('bbox')
                )
                saved_detections.append({
                    'id': detection.id,
                    'disease_name': detection.disease_name,
                    'confidence': detection.confidence,
                    'severity': detection.severity
                })
        
        return Response({
            'success': True,
            'detection': detection_result,
            'saved_detections': saved_detections,
            'total_saved': len(saved_detections)
        }, status=status.HTTP_200_OK)
        
    except requests.exceptions.RequestException as e:
        return Response({
            'error': 'Failed to connect to AI service',
            'details': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_disease_history(request):
    """Get disease detection history for user"""
    try:
        field_id = request.query_params.get('field_id')
        limit = int(request.query_params.get('limit', 50))
        
        # Base query
        detections = DiseaseDetection.objects.filter(user=request.user)
        
        # Filter by field if provided
        if field_id:
            detections = detections.filter(field_id=field_id)
        
        # Get recent detections
        detections = detections[:limit]
        
        detection_list = []
        for detection in detections:
            detection_list.append({
                'id': detection.id,
                'disease_name': detection.disease_name,
                'confidence': detection.confidence,
                'severity': detection.severity,
                'status': detection.status,
                'detection_date': detection.detection_date.isoformat(),
                'field': {
                    'id': detection.field.id,
                    'name': detection.field.name
                } if detection.field else None,
                'image_url': detection.image.url if detection.image else None,
                'has_treatment': bool(detection.treatment_notes)
            })
        
        return Response({
            'detections': detection_list,
            'total': len(detection_list)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_detection_detail(request, detection_id):
    """Get detailed information about a specific detection"""
    try:
        detection = DiseaseDetection.objects.get(id=detection_id, user=request.user)
        
        # Get treatment recommendation if available
        try:
            treatment = TreatmentRecommendation.objects.get(disease_name=detection.disease_name)
            treatment_data = {
                'description': treatment.description,
                'symptoms': treatment.symptoms,
                'treatment_steps': treatment.treatment_steps,
                'prevention_tips': treatment.prevention_tips,
                'organic_treatment': treatment.organic_treatment,
                'chemical_treatment': treatment.chemical_treatment,
                'estimated_recovery_days': treatment.estimated_recovery_days
            }
        except TreatmentRecommendation.DoesNotExist:
            treatment_data = None
        
        return Response({
            'detection': {
                'id': detection.id,
                'disease_name': detection.disease_name,
                'confidence': detection.confidence,
                'severity': detection.severity,
                'status': detection.status,
                'detection_date': detection.detection_date.isoformat(),
                'field': {
                    'id': detection.field.id,
                    'name': detection.field.name,
                    'crop_type': detection.field.crop_type
                } if detection.field else None,
                'image_url': detection.image.url if detection.image else None,
                'bbox': detection.bbox,
                'treatment_notes': detection.treatment_notes,
                'treatment_date': detection.treatment_date.isoformat() if detection.treatment_date else None,
                'resolved_date': detection.resolved_date.isoformat() if detection.resolved_date else None
            },
            'treatment_recommendation': treatment_data
        }, status=status.HTTP_200_OK)
        
    except DiseaseDetection.DoesNotExist:
        return Response({
            'error': 'Detection not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_detection_status(request, detection_id):
    """Update detection status and treatment notes"""
    try:
        detection = DiseaseDetection.objects.get(id=detection_id, user=request.user)
        
        new_status = request.data.get('status')
        treatment_notes = request.data.get('treatment_notes')
        
        if new_status:
            detection.status = new_status
            if new_status == 'treating' and not detection.treatment_date:
                detection.treatment_date = timezone.now()
            elif new_status == 'resolved' and not detection.resolved_date:
                detection.resolved_date = timezone.now()
        
        if treatment_notes is not None:
            detection.treatment_notes = treatment_notes
        
        detection.save()
        
        return Response({
            'message': 'Detection updated successfully',
            'detection': {
                'id': detection.id,
                'status': detection.status,
                'treatment_notes': detection.treatment_notes,
                'treatment_date': detection.treatment_date.isoformat() if detection.treatment_date else None,
                'resolved_date': detection.resolved_date.isoformat() if detection.resolved_date else None
            }
        }, status=status.HTTP_200_OK)
        
    except DiseaseDetection.DoesNotExist:
        return Response({
            'error': 'Detection not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_disease_statistics(request):
    """Get statistics about disease detections"""
    try:
        detections = DiseaseDetection.objects.filter(user=request.user)
        
        # Count by status
        stats = {
            'total_detections': detections.count(),
            'by_status': {
                'detected': detections.filter(status='detected').count(),
                'treating': detections.filter(status='treating').count(),
                'resolved': detections.filter(status='resolved').count(),
                'ignored': detections.filter(status='ignored').count()
            },
            'by_severity': {
                'low': detections.filter(severity='low').count(),
                'medium': detections.filter(severity='medium').count(),
                'high': detections.filter(severity='high').count(),
                'critical': detections.filter(severity='critical').count()
            },
            'recent_detections': detections.filter(
                detection_date__gte=timezone.now() - timezone.timedelta(days=7)
            ).count()
        }
        
        # Most common diseases
        from django.db.models import Count
        common_diseases = detections.values('disease_name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        stats['most_common_diseases'] = list(common_diseases)
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
