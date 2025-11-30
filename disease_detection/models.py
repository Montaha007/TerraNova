from django.db import models
from django.contrib.auth.models import User
from novaterra.models import Field


class DiseaseDetection(models.Model):
    """Store disease detection results"""
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('detected', 'Detected'),
        ('treating', 'Under Treatment'),
        ('resolved', 'Resolved'),
        ('ignored', 'Ignored'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disease_detections')
    field = models.ForeignKey(Field, on_delete=models.SET_NULL, null=True, blank=True, related_name='disease_detections')
    
    # Detection details
    disease_name = models.CharField(max_length=200)
    confidence = models.FloatField(help_text="AI confidence score (0-1)")
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='detected')
    
    # Image and metadata
    image = models.ImageField(upload_to='disease_detections/%Y/%m/%d/')
    detection_date = models.DateTimeField(auto_now_add=True)
    bbox = models.JSONField(null=True, blank=True, help_text="Bounding box coordinates [x1, y1, x2, y2]")
    
    # Treatment tracking
    treatment_notes = models.TextField(blank=True)
    treatment_date = models.DateTimeField(null=True, blank=True)
    resolved_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-detection_date']
        verbose_name = 'Disease Detection'
        verbose_name_plural = 'Disease Detections'
    
    def __str__(self):
        return f"{self.disease_name} - {self.user.username} ({self.detection_date.strftime('%Y-%m-%d')})"


class TreatmentRecommendation(models.Model):
    """Store treatment recommendations for different diseases"""
    disease_name = models.CharField(max_length=200, unique=True)
    description = models.TextField()
    symptoms = models.TextField()
    treatment_steps = models.JSONField(help_text="List of treatment steps")
    prevention_tips = models.JSONField(help_text="List of prevention tips")
    organic_treatment = models.TextField(blank=True)
    chemical_treatment = models.TextField(blank=True)
    estimated_recovery_days = models.IntegerField(default=14)
    
    class Meta:
        ordering = ['disease_name']
        verbose_name = 'Treatment Recommendation'
        verbose_name_plural = 'Treatment Recommendations'
    
    def __str__(self):
        return self.disease_name
