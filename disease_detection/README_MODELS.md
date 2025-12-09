# Disease Detection Models Documentation

This document describes the data models for the AI-powered plant disease detection system. These models handle disease detection results from the YOLO AI microservice and provide treatment recommendations.

## Table of Contents

1. [DiseaseDetection](#diseasedetection)
2. [TreatmentRecommendation](#treatmentrecommendation)

---

## DiseaseDetection

**Purpose**: Stores results from AI disease detection scans, including images, confidence scores, severity levels, and treatment tracking.

**Relationship**: 
- ForeignKey to User (who performed the scan)
- ForeignKey to Field (which field was scanned)
- Related to TreatmentRecommendation (via disease_name lookup)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `user` | ForeignKey(User) | CASCADE, related_name='disease_detections' | User who performed the scan |
| `field` | ForeignKey(Field) | CASCADE, null=True, blank=True, related_name='disease_detections' | Associated agricultural field |
| `disease_name` | CharField | max_length=200 | Name of detected disease (from AI model) |
| `confidence` | FloatField | min=0.0, max=1.0 | AI confidence score (0-1) |
| `severity` | CharField | max_length=20, choices, default='medium' | Disease severity level (see choices) |
| `status` | CharField | max_length=20, choices, default='detected' | Treatment status (see choices) |
| `image` | ImageField | upload_to='disease_detections/%Y/%m/%d/' | Original uploaded image |
| `detection_date` | DateTimeField | auto_now_add=True | When scan was performed |
| `bbox` | JSONField | null=True, blank=True | Bounding box coordinates [x, y, width, height] |
| `treatment_notes` | TextField | blank=True | User notes about treatment applied |
| `treatment_date` | DateTimeField | null=True, blank=True | When treatment was started |
| `resolved_date` | DateTimeField | null=True, blank=True | When issue was resolved |

### Severity Choices

| Value | Display | Description |
|-------|---------|-------------|
| `low` | Low | Minor issue, minimal impact |
| `medium` | Medium | Moderate concern, requires attention |
| `high` | High | Serious problem, immediate action needed |
| `critical` | Critical | Severe threat, urgent intervention required |

### Status Choices

| Value | Display | Description |
|-------|---------|-------------|
| `detected` | Detected | Disease identified, not yet treated |
| `treating` | Treating | Treatment in progress |
| `resolved` | Resolved | Successfully treated |
| `ignored` | Ignored | User chose not to treat |

### Meta Options

- **Ordering**: `['-detection_date']` (newest first)
- **Verbose Names**: "Disease Detection" / "Disease Detections"

### Data Flow

```
1. User uploads image via React UI
2. Django API sends image to FastAPI AI service
3. YOLO model detects disease and returns:
   - disease_name
   - confidence score
   - bbox coordinates
4. Django creates DiseaseDetection record
5. User receives treatment recommendations
6. User updates status as treatment progresses
```

### Usage Example

```python
from django.core.files.base import ContentFile
import requests

# Create detection after AI analysis
detection = DiseaseDetection.objects.create(
    user=request.user,
    field=field_instance,
    disease_name="Late Blight",
    confidence=0.87,
    severity='high',
    status='detected',
    image=uploaded_image,
    bbox=[120, 85, 300, 250]  # x, y, width, height
)

# Update when treatment starts
detection.status = 'treating'
detection.treatment_date = timezone.now()
detection.treatment_notes = "Applied copper fungicide spray"
detection.save()

# Mark as resolved
detection.status = 'resolved'
detection.resolved_date = timezone.now()
detection.save()

# Query user's detection history
recent_detections = DiseaseDetection.objects.filter(
    user=request.user
).order_by('-detection_date')[:10]

# Get active issues
active_diseases = DiseaseDetection.objects.filter(
    user=request.user,
    status__in=['detected', 'treating']
)

# Statistics
from django.db.models import Count
stats = DiseaseDetection.objects.filter(
    user=request.user
).values('status').annotate(count=Count('id'))
```

---

## TreatmentRecommendation

**Purpose**: Database of treatment information for plant diseases. Pre-populated with expert knowledge to provide actionable guidance when diseases are detected.

**Relationship**: Linked to DiseaseDetection via `disease_name` field (not a ForeignKey, but conceptual relationship)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `disease_name` | CharField | max_length=200, unique | Disease identifier (must match AI model output) |
| `description` | TextField | | Overview of the disease |
| `symptoms` | TextField | | Visual symptoms to identify disease |
| `treatment_steps` | JSONField | | Ordered list of treatment actions |
| `prevention_tips` | JSONField | | List of preventive measures |
| `organic_treatment` | TextField | blank=True | Organic/natural treatment methods |
| `chemical_treatment` | TextField | blank=True | Chemical treatment options |
| `estimated_recovery_days` | IntegerField | null=True, blank=True | Expected recovery time |

### JSON Field Formats

**treatment_steps** (array of strings):
```json
[
  "Remove and destroy infected plant parts",
  "Apply copper-based fungicide every 7-10 days",
  "Improve air circulation around plants",
  "Reduce overhead watering",
  "Monitor for spread to adjacent plants"
]
```

**prevention_tips** (array of strings):
```json
[
  "Use disease-resistant varieties",
  "Maintain proper plant spacing",
  "Water at base of plants, not overhead",
  "Apply preventive fungicide sprays",
  "Remove plant debris regularly"
]
```

### Meta Options

- **Verbose Names**: "Treatment Recommendation" / "Treatment Recommendations"

### Data Entry

This model should be populated by administrators with expert knowledge. Each disease detected by the AI model should have a corresponding treatment recommendation.

### Usage Example

```python
# Create treatment recommendation (admin/data seeding)
treatment = TreatmentRecommendation.objects.create(
    disease_name="Late Blight",
    description="A devastating disease caused by Phytophthora infestans that affects tomatoes and potatoes, especially in humid conditions.",
    symptoms="Dark brown to black lesions on leaves, stems, and fruit. White fuzzy growth on leaf undersides during humid conditions.",
    treatment_steps=[
        "Remove and destroy infected plant parts immediately",
        "Apply copper-based fungicide every 7-10 days",
        "Improve air circulation around plants",
        "Reduce overhead watering to minimize leaf wetness",
        "Monitor adjacent plants for signs of infection"
    ],
    prevention_tips=[
        "Use certified disease-free seeds and transplants",
        "Choose resistant varieties when available",
        "Maintain proper plant spacing (18-24 inches)",
        "Water at the base of plants early in the day",
        "Apply preventive fungicide sprays before disease appears",
        "Remove volunteer plants and crop debris"
    ],
    organic_treatment="Copper-based fungicides (Bordeaux mixture), Bacillus subtilis biological fungicide, Neem oil spray",
    chemical_treatment="Chlorothalonil, Mancozeb, or Metalaxyl-based fungicides. Rotate products to prevent resistance.",
    estimated_recovery_days=14
)

# Retrieve recommendation after detection
detection = DiseaseDetection.objects.get(pk=detection_id)
try:
    recommendation = TreatmentRecommendation.objects.get(
        disease_name=detection.disease_name
    )
    print(f"Treatment steps: {recommendation.treatment_steps}")
    print(f"Recovery time: {recommendation.estimated_recovery_days} days")
except TreatmentRecommendation.DoesNotExist:
    print("No treatment recommendation available for this disease")

# Update recommendation
recommendation.organic_treatment += "\nBaking soda solution (1 tbsp per gallon water)"
recommendation.save()
```

---

## API Integration

### Detection Workflow

1. **Image Upload**:
   ```
   POST /api/disease/detect/
   {
     "image": <file>,
     "field_id": 123
   }
   ```

2. **AI Service Call**:
   ```python
   response = requests.post(
       'http://localhost:5000/detect',
       files={'file': image_file}
   )
   ai_result = response.json()
   ```

3. **Create Detection**:
   ```python
   detection = DiseaseDetection.objects.create(
       user=request.user,
       field_id=field_id,
       disease_name=ai_result['disease_name'],
       confidence=ai_result['confidence'],
       bbox=ai_result.get('bbox'),
       image=uploaded_image
   )
   ```

4. **Fetch Treatment**:
   ```python
   recommendation = TreatmentRecommendation.objects.get(
       disease_name=detection.disease_name
   )
   ```

5. **Return Response**:
   ```json
   {
     "detection_id": 456,
     "disease_name": "Late Blight",
     "confidence": 0.87,
     "severity": "high",
     "treatment": {
       "description": "...",
       "symptoms": "...",
       "treatment_steps": [...],
       "prevention_tips": [...],
       "organic_treatment": "...",
       "chemical_treatment": "...",
       "estimated_recovery_days": 14
     }
   }
   ```

---

## Model Relationships Diagram

```
User
└── DiseaseDetection (1:N)
    ├── Field (N:1)
    └── disease_name (lookup)
        └── TreatmentRecommendation (1:1 via disease_name string match)
```

---

## Image Storage

**Path Structure**: `disease_detections/YYYY/MM/DD/`

**Example**: `disease_detections/2025/11/30/scan_abc123.jpg`

**Settings Required**:
```python
# settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

**URL Configuration**:
```python
# urls.py (development)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your patterns
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## Statistics Queries

### Useful Aggregations

```python
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta

# Count by status
status_counts = DiseaseDetection.objects.filter(
    user=user
).values('status').annotate(count=Count('id'))

# Count by severity
severity_counts = DiseaseDetection.objects.filter(
    user=user
).values('severity').annotate(count=Count('id'))

# Average confidence by disease
avg_confidence = DiseaseDetection.objects.values(
    'disease_name'
).annotate(
    avg_conf=Avg('confidence'),
    count=Count('id')
)

# Recent detections (last 7 days)
week_ago = timezone.now() - timedelta(days=7)
recent = DiseaseDetection.objects.filter(
    user=user,
    detection_date__gte=week_ago
).count()

# Active vs resolved
active = DiseaseDetection.objects.filter(
    user=user,
    status__in=['detected', 'treating']
).count()

resolved = DiseaseDetection.objects.filter(
    user=user,
    status='resolved'
).count()

# Most common diseases
top_diseases = DiseaseDetection.objects.filter(
    user=user
).values('disease_name').annotate(
    count=Count('id')
).order_by('-count')[:5]
```

---

## Admin Interface

Both models are registered in Django Admin with:

**DiseaseDetection**:
- List display: user, field, disease_name, confidence, severity, status, detection_date
- List filters: severity, status, detection_date
- Search fields: disease_name, user__username, field__location__name
- Readonly fields: confidence, bbox, detection_date
- Fieldsets: Detection Info, Field & Location, Treatment Tracking

**TreatmentRecommendation**:
- List display: disease_name, estimated_recovery_days
- Search fields: disease_name, description
- Organized fieldsets for better data entry

---

## Testing Considerations

### Sample Test Cases

```python
from django.test import TestCase
from django.contrib.auth.models import User
from novaterra.models import Field, Location
from .models import DiseaseDetection, TreatmentRecommendation

class DiseaseDetectionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('test', 'test@test.com', 'pass')
        self.location = Location.objects.create(user=self.user, name="Test Field", ...)
        self.field = Field.objects.create(owner=self.user, location=self.location, ...)
    
    def test_detection_creation(self):
        detection = DiseaseDetection.objects.create(
            user=self.user,
            field=self.field,
            disease_name="Test Disease",
            confidence=0.85,
            severity='medium'
        )
        self.assertEqual(detection.status, 'detected')
        self.assertIsNotNone(detection.detection_date)
    
    def test_treatment_recommendation(self):
        recommendation = TreatmentRecommendation.objects.create(
            disease_name="Test Disease",
            description="Test description",
            symptoms="Test symptoms",
            treatment_steps=["Step 1", "Step 2"],
            prevention_tips=["Tip 1", "Tip 2"]
        )
        self.assertEqual(recommendation.disease_name, "Test Disease")
        self.assertIsInstance(recommendation.treatment_steps, list)
```

---

## Migration Notes

**Initial Migration**: Creates both models with all fields and indexes

**To create migrations**:
```bash
python manage.py makemigrations disease_detection
python manage.py migrate disease_detection
```

**Dependencies**: Requires `novaterra.models.Field` to exist first

---

## Performance Considerations

1. **Image Storage**: Consider cloud storage (S3, Cloudinary) for production
2. **Thumbnail Generation**: Add thumbnail field for faster loading in lists
3. **Indexing**: detection_date and status are frequently queried
4. **Caching**: Cache TreatmentRecommendation lookups
5. **Pagination**: Always paginate detection history queries

---

## Future Enhancements

- [ ] Add confidence threshold settings per user
- [ ] Multi-disease detection (JSON array of detections)
- [ ] Treatment effectiveness tracking (did it work?)
- [ ] Cost tracking for treatments applied
- [ ] Integration with weather data for disease risk prediction
- [ ] Notification system for critical detections
- [ ] Bulk scan upload for large fields
- [ ] Export detection reports (PDF/Excel)
