from django.contrib import admin
from .models import DiseaseDetection, TreatmentRecommendation


@admin.register(DiseaseDetection)
class DiseaseDetectionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'disease_name', 'confidence', 'severity', 'status', 'field', 'detection_date']
    list_filter = ['severity', 'status', 'detection_date']
    search_fields = ['disease_name', 'user__username', 'field__name']
    readonly_fields = ['detection_date', 'confidence', 'bbox']
    
    fieldsets = (
        ('Detection Info', {
            'fields': ('user', 'field', 'disease_name', 'confidence', 'severity', 'detection_date')
        }),
        ('Image & Location', {
            'fields': ('image', 'bbox')
        }),
        ('Status & Treatment', {
            'fields': ('status', 'treatment_notes', 'treatment_date', 'resolved_date')
        }),
    )


@admin.register(TreatmentRecommendation)
class TreatmentRecommendationAdmin(admin.ModelAdmin):
    list_display = ['disease_name', 'estimated_recovery_days']
    search_fields = ['disease_name', 'description']
    
    fieldsets = (
        ('Disease Info', {
            'fields': ('disease_name', 'description', 'symptoms')
        }),
        ('Treatment', {
            'fields': ('treatment_steps', 'organic_treatment', 'chemical_treatment', 'estimated_recovery_days')
        }),
        ('Prevention', {
            'fields': ('prevention_tips',)
        }),
    )
