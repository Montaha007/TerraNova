from django.urls import path
from . import views

urlpatterns = [
    # Disease detection
    path('detect/', views.detect_disease, name='detect-disease'),
    path('history/', views.get_disease_history, name='disease-history'),
    path('statistics/', views.get_disease_statistics, name='disease-statistics'),
    
    # Detection detail and management
    path('<int:detection_id>/', views.get_detection_detail, name='detection-detail'),
    path('<int:detection_id>/update/', views.update_detection_status, name='update-detection'),
]
