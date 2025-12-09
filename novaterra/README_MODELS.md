# Novaterra Models Documentation

This document describes the core data models for the Novaterra farm management system. These models handle user profiles, geographic locations, agricultural fields, inventory management, and IoT camera surveillance.

## Table of Contents

1. [UserProfile](#userprofile)
2. [Location](#location)
3. [Field](#field)
4. [Stock](#stock)
5. [Camera](#camera)

---

## UserProfile

**Purpose**: Extends Django's built-in User model with farm-specific information.

**Relationship**: OneToOne with Django's User model (auto-created via signal)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `user` | OneToOneField(User) | CASCADE, related_name='profile' | Link to Django User account |
| `farm_name` | CharField | max_length=200, blank=True | Name of the user's farm |
| `phone_number` | CharField | max_length=20, blank=True | Contact phone number |
| `created_at` | DateTimeField | auto_now_add=True | Profile creation timestamp |
| `updated_at` | DateTimeField | auto_now=True | Last update timestamp |

### Usage Example

```python
# Auto-created when User is created
user = User.objects.create_user('farmer@example.com', password='secure')
# user.profile is now available

# Update profile
user.profile.farm_name = "Green Valley Farm"
user.profile.phone_number = "+1234567890"
user.profile.save()

# Access from user
farm_name = user.profile.farm_name
```

---

## Location

**Purpose**: Stores geographic location data using PostGIS for mapping and spatial queries. Supports both point markers and polygon shapes.

**Key Feature**: Uses PostGIS PointField and MultiPolygonField for GIS functionality

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `user` | ForeignKey(User) | CASCADE, related_name='locations' | Owner of this location |
| `name` | CharField | max_length=100 | Location name/label |
| `point` | PointField | SRID=4326, geography=True | GPS coordinates (longitude, latitude) |
| `shape` | MultiPolygonField | SRID=4326, geography=True, null=True, blank=True | Polygon boundary for area |
| `city` | CharField | max_length=100, blank=True | City name |
| `region` | CharField | max_length=100, blank=True | Province/State/Region |
| `address` | TextField | blank=True | Full street address |
| `location_type` | CharField | max_length=20, default='field' | Type category (see choices below) |
| `created_at` | DateTimeField | auto_now_add=True | Creation timestamp |
| `updated_at` | DateTimeField | auto_now=True | Last update timestamp |

### Location Type Choices

| Value | Display |
|-------|---------|
| `farm` | Farm |
| `field` | Field |
| `warehouse` | Warehouse |
| `other` | Other |

### Properties

- `latitude`: Returns the latitude from point field
- `longitude`: Returns the longitude from point field

### Meta Options

- **Ordering**: `['-created_at']` (newest first)
- **Verbose Names**: "Location" / "Locations"

### Usage Example

```python
from django.contrib.gis.geos import Point, MultiPolygon, Polygon

# Create point location
location = Location.objects.create(
    user=user,
    name="North Field",
    point=Point(10.1815, 36.8065),  # Longitude, Latitude (Tunis coordinates)
    location_type='field',
    city="Tunis",
    region="Tunis Governorate"
)

# Create polygon location
polygon = Polygon(((0, 0), (0, 1), (1, 1), (1, 0), (0, 0)))
location_with_shape = Location.objects.create(
    user=user,
    name="Main Farm",
    point=Point(10.1815, 36.8065),
    shape=MultiPolygon(polygon),
    location_type='farm'
)

# Access coordinates
lat = location.latitude
lon = location.longitude

# Spatial queries
nearby = Location.objects.filter(
    point__distance_lte=(location.point, 5000)  # 5km radius
)
```

---

## Field

**Purpose**: Represents agricultural fields with crop information, status tracking, and area calculations.

**Relationship**: OneToOne with Location (field extends location with agricultural data)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `owner` | ForeignKey(User) | CASCADE, related_name='fields' | Field owner |
| `location` | OneToOneField(Location) | CASCADE, related_name='field_details' | Geographic location data |
| `crop_type` | CharField | max_length=50, choices | Type of crop planted (see choices) |
| `status` | CharField | max_length=20, choices, default='active' | Current field status (see choices) |
| `area_size` | DecimalField | max_digits=10, decimal_places=2, null=True, blank=True | Area in hectares (auto-calculated) |
| `planting_date` | DateField | null=True, blank=True | When crop was planted |
| `expected_harvest` | DateField | null=True, blank=True | Expected harvest date |
| `notes` | TextField | blank=True | Additional notes/observations |
| `created_at` | DateTimeField | auto_now_add=True | Record creation timestamp |
| `updated_at` | DateTimeField | auto_now=True | Last update timestamp |

### Crop Type Choices

| Value | Display |
|-------|---------|
| `tomato` | Tomato |
| `olives` | Olives |
| `wheat` | Wheat |
| `potato` | Potato |
| `citrus` | Citrus |
| `dates` | Dates |
| `grapes` | Grapes |
| `vegetables` | Vegetables |
| `other` | Other |

### Status Choices

| Value | Display | Description |
|-------|---------|-------------|
| `active` | Active | Crop is growing |
| `fallow` | Fallow | Resting/no crop |
| `preparation` | Preparation | Being prepared for planting |
| `harvested` | Harvested | Recently harvested |

### Meta Options

- **Ordering**: `['location__name']` (alphabetical by location name)

### Auto-Calculation

The `save()` method automatically calculates `area_size` from the location's shape polygon if:
- Location has a shape (MultiPolygonField)
- Area is not already set

**Calculation**: `area_size = shape.area / 10000` (converts m² to hectares)

### Usage Example

```python
# Create location first
location = Location.objects.create(
    user=user,
    name="South Tomato Field",
    point=Point(10.1815, 36.8065),
    shape=MultiPolygon(polygon),  # Polygon defines field boundary
    location_type='field'
)

# Create field
field = Field.objects.create(
    owner=user,
    location=location,
    crop_type='tomato',
    status='active',
    planting_date='2025-03-15',
    expected_harvest='2025-07-01',
    notes='Early variety, requires daily irrigation'
)

# area_size is auto-calculated from location.shape
print(f"Field area: {field.area_size} hectares")

# Update status after harvest
field.status = 'harvested'
field.save()

# Access location data through field
coordinates = (field.location.latitude, field.location.longitude)
```

---

## Stock

**Purpose**: Inventory management for seeds, fertilizers, equipment, and other agricultural supplies.

**Relationship**: ForeignKey to User (owner) and Location (storage location)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `owner` | ForeignKey(User) | CASCADE, related_name='stock' | Inventory owner |
| `location` | ForeignKey(Location) | SET_NULL, null=True, blank=True, related_name='inventory' | Storage location |
| `item_name` | CharField | max_length=200 | Product/item name |
| `category` | CharField | max_length=50, choices | Item category (see choices) |
| `quantity` | DecimalField | max_digits=10, decimal_places=2 | Amount in stock |
| `unit` | CharField | max_length=50 | Measurement unit (kg, liters, pieces) |
| `cost_per_unit` | DecimalField | max_digits=10, decimal_places=2, null=True, blank=True | Price per unit |
| `total_cost` | DecimalField | max_digits=10, decimal_places=2, null=True, blank=True | Total value (auto-calculated) |
| `purchase_date` | DateField | null=True, blank=True | When item was purchased |
| `expiry_date` | DateField | null=True, blank=True | Expiration date |
| `notes` | TextField | blank=True | Additional notes |
| `created_at` | DateTimeField | auto_now_add=True | Record creation timestamp |
| `updated_at` | DateTimeField | auto_now=True | Last update timestamp |

### Category Choices

| Value | Display |
|-------|---------|
| `seeds` | Seeds |
| `fertilizer` | Fertilizer |
| `pesticide` | Pesticide |
| `herbicide` | Herbicide |
| `equipment` | Equipment |
| `tools` | Tools |
| `irrigation` | Irrigation Supplies |
| `other` | Other |

### Meta Options

- **Ordering**: `['-created_at']` (newest first)

### Auto-Calculation

The `save()` method automatically calculates `total_cost` if both `cost_per_unit` and `quantity` are provided:

**Calculation**: `total_cost = cost_per_unit * quantity`

### Usage Example

```python
# Create inventory item
stock = Stock.objects.create(
    owner=user,
    location=warehouse_location,
    item_name="Organic Tomato Seeds (Variety Roma)",
    category='seeds',
    quantity=50,
    unit='kg',
    cost_per_unit=25.50,
    # total_cost auto-calculated: 50 * 25.50 = 1275.00
    purchase_date='2025-01-15',
    expiry_date='2026-01-15',
    notes='Store in cool, dry place'
)

# Update quantity when used
stock.quantity -= 5  # Used 5kg
stock.save()  # total_cost recalculated automatically

# Query inventory
low_stock = Stock.objects.filter(quantity__lt=10)
expired = Stock.objects.filter(expiry_date__lt=timezone.now().date())
fertilizers = Stock.objects.filter(category='fertilizer')

# Calculate total inventory value
from django.db.models import Sum
total_value = Stock.objects.filter(owner=user).aggregate(Sum('total_cost'))
```

---

## Camera

**Purpose**: Track IoT surveillance cameras for field monitoring and security.

**Relationship**: ForeignKey to User (owner) and Location (camera placement)

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `owner` | ForeignKey(User) | CASCADE, related_name='cameras' | Camera owner |
| `location` | ForeignKey(Location) | CASCADE, related_name='cameras' | Where camera is installed |
| `name` | CharField | max_length=100 | Camera identifier/label |
| `stream_url` | URLField | blank=True | RTSP/HTTP stream URL |
| `is_active` | BooleanField | default=True | Whether camera is operational |
| `created_at` | DateTimeField | auto_now_add=True | Installation timestamp |

### Usage Example

```python
# Add camera to field
camera = Camera.objects.create(
    owner=user,
    location=field_location,
    name="North Field Camera 1",
    stream_url="rtsp://192.168.1.100:554/stream",
    is_active=True
)

# Get all active cameras
active_cameras = Camera.objects.filter(owner=user, is_active=True)

# Get cameras for specific location
field_cameras = Camera.objects.filter(location=field_location)

# Disable camera
camera.is_active = False
camera.save()
```

---

## Model Relationships Diagram

```
User
├── UserProfile (1:1)
├── Location (1:N)
│   ├── Field (1:1 with Location)
│   ├── Stock (N:1 with Location)
│   └── Camera (N:1 with Location)
├── Field (1:N, through Location)
├── Stock (1:N)
└── Camera (1:N)
```

---

## Database Indexes

**PostGIS Spatial Indexes** (automatic):
- `Location.point` - Enables fast spatial queries (distance, contains, intersects)
- `Location.shape` - Enables polygon-based spatial queries

**Standard Indexes** (automatic):
- All ForeignKey fields
- All DateTimeField fields with `auto_now` or `auto_now_add`

---

## Admin Interface

All models are registered in Django Admin with appropriate:
- List displays
- Search fields
- Filters
- Readonly fields (for auto-calculated values)

---

## Notes

- **PostGIS Required**: All geographic functionality requires PostgreSQL with PostGIS extension
- **SRID 4326**: WGS84 coordinate system (standard GPS coordinates)
- **Geography=True**: Enables distance calculations in meters
- **Automatic Calculations**: Field area and Stock total_cost are auto-calculated on save()
- **Cascade Deletion**: Deleting a User deletes all related data
- **SET_NULL**: Stock locations can be deleted without deleting stock items
