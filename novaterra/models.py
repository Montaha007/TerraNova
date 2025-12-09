# novaterra/models.py

from django.contrib.gis.db import models as geomodels
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.gis.geos import Point


# ============================================
# USER PROFILE
# ============================================
class UserProfile(geomodels.Model):
    """Extended user information - Profile data"""
    user = geomodels.OneToOneField(User, on_delete=geomodels.CASCADE, related_name='profile')
    
    # Farm Info
    farm_name = geomodels.CharField(max_length=200, default="My Farm")
    phone_number = geomodels.CharField(max_length=20, blank=True)
    
    # Metadata
    created_at = geomodels.DateTimeField(auto_now_add=True)
    updated_at = geomodels.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


# Auto-create profile when user registers
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


# ============================================
# LOCATION (Your existing model - enhanced)
# ============================================
class Location(geomodels.Model):
    """Farm location with geographic data"""
    LOCATION_TYPE_CHOICES = [
        ('farm', 'Farm Headquarters'),
        ('field', 'Field'),
        ('warehouse', 'Warehouse'),
        ('other', 'Other'),
    ]
    
    user = geomodels.ForeignKey(User, on_delete=geomodels.CASCADE, related_name='locations')
    name = geomodels.CharField(max_length=100)  # "My Farm", "Field A"
    location_type = geomodels.CharField(max_length=20, choices=LOCATION_TYPE_CHOICES, default='farm')
    
    # Geographic data (your existing fields)
    point = geomodels.PointField(geography=True, null=True, blank=True)  # Single point
    shape = geomodels.GeometryField(geography=True, null=True, blank=True)  # Polygon for fields
    
    # Address info (optional but useful)
    city = geomodels.CharField(max_length=100, blank=True)  # "Nabeul"
    region = geomodels.CharField(max_length=100, blank=True)  # "Nabeul Governorate"
    address = geomodels.TextField(blank=True)
    
    # Metadata
    created_at = geomodels.DateTimeField(auto_now_add=True)
    updated_at = geomodels.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"
    
    @property
    def latitude(self):
        """Helper property to get latitude from point"""
        return self.point.y if self.point else None
    
    @property
    def longitude(self):
        """Helper property to get longitude from point"""
        return self.point.x if self.point else None


# ============================================
# FIELD (Linked to Location)
# ============================================
class Field(geomodels.Model):
    """Agricultural fields"""
    CROP_CHOICES = [
        ('tomato', 'Tomato'),
        ('olives', 'Olives'),
        ('wheat', 'Wheat'),
        ('potato', 'Potato'),
        ('citrus', 'Citrus Fruits'),
        ('dates', 'Dates'),
        ('grapes', 'Grapes'),
        ('vegetables', 'Mixed Vegetables'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('fallow', 'Fallow'),
        ('preparation', 'Preparation'),
        ('harvested', 'Harvested'),
    ]
    
    owner = geomodels.ForeignKey(User, on_delete=geomodels.CASCADE, related_name='fields')
    location = geomodels.OneToOneField(Location, on_delete=geomodels.CASCADE, related_name='field_details')
    
    # Crop Info
    crop_type = geomodels.CharField(max_length=50, choices=CROP_CHOICES)
    status = geomodels.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Area (auto-calculated from shape if polygon exists)
    area_size = geomodels.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="in hectares")
    
    # Dates
    planting_date = geomodels.DateField(null=True, blank=True)
    expected_harvest = geomodels.DateField(null=True, blank=True)
    
    # Notes
    notes = geomodels.TextField(blank=True)
    
    created_at = geomodels.DateTimeField(auto_now_add=True)
    updated_at = geomodels.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['location__name']
    
    def __str__(self):
        return f"{self.location.name} - {self.crop_type}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate area from shape if available"""
        if self.location.shape and not self.area_size:
            # Calculate area in hectares (1 hectare = 10,000 m²)
            self.area_size = self.location.shape.area / 10000
        super().save(*args, **kwargs)


# ============================================
# STOCK / INVENTORY
# ============================================
class Stock(geomodels.Model):
    """Inventory management"""
    CATEGORY_CHOICES = [
        ('seeds', 'Seeds'),
        ('fertilizer', 'Fertilizer'),
        ('pesticide', 'Pesticide'),
        ('herbicide', 'Herbicide'),
        ('equipment', 'Equipment'),
        ('tools', 'Tools'),
        ('irrigation', 'Irrigation Supplies'),
        ('other', 'Other'),
    ]
    
    owner = geomodels.ForeignKey(User, on_delete=geomodels.CASCADE, related_name='stock')
    location = geomodels.ForeignKey(Location, on_delete=geomodels.SET_NULL, null=True, blank=True, related_name='inventory')
    
    # Item details
    item_name = geomodels.CharField(max_length=200)
    category = geomodels.CharField(max_length=50, choices=CATEGORY_CHOICES)
    quantity = geomodels.DecimalField(max_digits=10, decimal_places=2)
    unit = geomodels.CharField(max_length=50)  # "kg", "liters", "pieces"
    
    # Financial
    cost_per_unit = geomodels.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_cost = geomodels.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Dates
    purchase_date = geomodels.DateField(null=True, blank=True)
    expiry_date = geomodels.DateField(null=True, blank=True)
    
    # Notes
    notes = geomodels.TextField(blank=True)
    
    created_at = geomodels.DateTimeField(auto_now_add=True)
    updated_at = geomodels.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.item_name} - {self.quantity} {self.unit}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate total cost"""
        if self.cost_per_unit and self.quantity:
            self.total_cost = self.cost_per_unit * self.quantity
        super().save(*args, **kwargs)


# ============================================
# CAMERA (Surveillance cameras for novaterra app)
# ============================================
class Camera(geomodels.Model):
    """Surveillance cameras"""
    owner = geomodels.ForeignKey(User, on_delete=geomodels.CASCADE, related_name='novaterra_cameras')
    location = geomodels.ForeignKey(Location, on_delete=geomodels.CASCADE, related_name='novaterra_cameras')
    
    name = geomodels.CharField(max_length=100)
    stream_url = geomodels.URLField(blank=True)
    is_active = geomodels.BooleanField(default=True)
    
    created_at = geomodels.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Novaterra Camera"
        verbose_name_plural = "Novaterra Cameras"
    
    def __str__(self):
        return f"{self.name} at {self.location.name}"
    
    # Streaming methods for go2rtc integration
    def get_camera_id(self):
        """Camera ID is the name"""
        return self.name
    
    def get_stream_url(self):
        """Get go2rtc web player URL"""
        return f"http://localhost:1984/stream.html?src={self.get_camera_id()}"
    
    def get_go2rtc_url(self):
        """Get go2rtc API URL"""
        return f"http://localhost:1984/api/streams/{self.get_camera_id()}"
    
    def get_go2rtc_iframe_url(self):
        """Get go2rtc iframe embed URL"""
        return f"http://localhost:1984/streams/{self.get_camera_id()}"
    
    def get_hls_url(self):
        """Get HLS stream URL for video.js"""
        return f"http://localhost:1984/api/streams/{self.get_camera_id()}.m3u8"
    
    def get_webrtc_url(self):
        """Get WebRTC stream URL"""
        return f"http://localhost:1984/api/webrtc?src={self.get_camera_id()}"
