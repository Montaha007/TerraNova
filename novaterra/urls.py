from django.urls import path
from . import views

urlpatterns = [
    # Legacy views
    path('', views.index, name='index'),
    path('locations-map/', views.locations_map, name='locations_map'),
    path('save-location/', views.save_location, name='save_location'),
    
    # API endpoints
    path('api/test/', views.test_api, name='test_api'),
    
    # Authentication endpoints
    path('api/register/', views.register, name='register_user'),
    path('api/login/', views.login_user, name='login_user'),
    path('api/logout/', views.logout_user, name='logout_user'),
    path('api/user/', views.get_current_user, name='get_current_user'),
    
    
    # Farm data endpoints
    path('api/farm-data/', views.get_user_farm_data, name='get_user_farm_data'),
    
    # Field management endpoints
    path('api/fields/add/', views.add_field, name='add_field'),  # Legacy
    path('api/fields/create/', views.create_field, name='create_field'),
    path('api/fields/<int:field_id>/delete/', views.delete_field, name='delete_field'),
    
    # Camera management endpoints
    path('api/cameras/create/', views.create_camera, name='create_camera'),
    path('api/cameras/<int:camera_id>/delete/', views.delete_camera, name='delete_camera'),
    path('api/weather/', views.get_weather, name='weather'),
    path('api/weather/forecast/', views.get_forecast, name='forecast'),

]
