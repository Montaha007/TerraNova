# 🚀 Quick Start Guide - Interactive Farm Map

## Installation Complete! ✅

All packages have been installed and components created. Follow these steps to get started:

## 1. Start the Backend Server

```powershell
# Navigate to project root
cd C:\Users\Mattoussi\OneDrive\Documents\Novaterra

# Activate virtual environment
.\myvenv\Scripts\Activate.ps1

# Run Django server
python manage.py runserver
```

Backend will be available at: **http://localhost:8000**

## 2. Start the React Frontend

```powershell
# Open a new terminal
cd C:\Users\Mattoussi\OneDrive\Documents\Novaterra\frontend

# Start React development server
npm start
```

Frontend will be available at: **http://localhost:3001**

## 3. Test the Interactive Map

### Register/Login
1. Go to http://localhost:3001
2. Register a new account with:
   - Username
   - Password
   - Farm name (e.g., "Green Valley Farm")
   - City (select from dropdown - e.g., "Nabeul")

### Navigate to Dashboard
1. After registration, you'll be redirected to the main dashboard
2. Scroll down to see the **Interactive Farm Map** section

### Add Your First Field
1. Click **🌾 Add Field** button
2. Map enters drawing mode
3. Click multiple points on the map to outline your field
4. Double-click to finish the polygon
5. A modal will open:
   - **Field Name**: Enter "North Field" or any name
   - **Crop Type**: Select from dropdown (e.g., "Tomato")
   - **Planting Date**: Optional - select a date
   - **Notes**: Optional - add any notes
   - **Calculated Area**: Shows automatically in hectares
6. Click **Save Field**
7. Success notification appears
8. Field appears on map with orange polygon
9. Statistics update showing "1" total field

### Add Your First Camera
1. Click **📹 Add Camera** button
2. Map cursor changes to crosshair
3. Click anywhere on the map
4. A blue marker appears
5. A modal opens:
   - **Camera Name**: Enter "Gate Camera" or any name
   - **Stream URL**: Optional - enter camera stream URL
   - **Notes**: Optional - add any notes
   - **Location**: Shows coordinates automatically
6. Click **Save Camera**
7. Success notification appears
8. Camera marker appears on map
9. Statistics update showing "1" active camera

### Delete Field or Camera
1. Click on any field or camera marker
2. Popup opens with details
3. Click **❌ Delete Field** or **❌ Delete Camera** button
4. Confirmation dialog appears: "Are you sure?"
5. Click **Delete** to confirm
6. Success notification appears
7. Item removed from map
8. Statistics update automatically

### Switch Modes
- **🗺️ View Only**: Default mode - browse and view markers (no editing)
- **🌾 Add Field**: Draw polygon boundaries for new fields
- **📹 Add Camera**: Click map to place camera markers

The mode indicator shows your current mode in the toolbar.

## 4. Map Controls

### Drawing a Field Polygon
- **Start Drawing**: Click to place first point
- **Continue**: Click to add more points
- **Finish**: Double-click on the last point
- **Cancel**: Press ESC key

### Viewing Details
- **Click any marker** to see popup with details
- **Farm HQ** (green): Shows farm name, city, coordinates
- **Fields** (orange): Shows crop, status, area, planting date
- **Cameras** (blue): Shows status, stream URL button

### Map Navigation
- **Zoom**: Mouse wheel or +/- buttons
- **Pan**: Click and drag
- **Reset View**: Refresh page

## 5. Understanding Statistics Cards

### Total Fields
- Shows count of all your fields
- Updates automatically when you add/delete

### Active Cameras
- Shows count of active monitoring cameras
- Only counts cameras with `is_active: true`

### Total Area
- Shows sum of all field areas
- Displayed in hectares (ha)
- Calculated from polygon boundaries

## 6. Keyboard Shortcuts

- **ESC**: Cancel current drawing
- **Enter**: Finish polygon (alternative to double-click)
- **Delete**: (When marker selected) Delete marker

## 7. Mobile Usage

### On Smartphones
- Toolbar buttons show icons only (text hidden)
- Tap to place markers
- Swipe to pan map
- Pinch to zoom
- Forms are touch-friendly

### On Tablets
- Full interface available
- Touch-optimized buttons
- Responsive grid layouts

## 8. Troubleshooting

### Map Not Loading
- Check backend is running on port 8000
- Check frontend is running on port 3001
- Verify you're logged in (check localStorage has `access_token`)
- Check browser console for errors

### Can't Draw Polygons
- Ensure you clicked **Add Field** button
- Mode indicator should show "Drawing Field"
- If stuck, click **View Only** then **Add Field** again

### Can't Place Camera
- Ensure you clicked **Add Camera** button
- Mode indicator should show "Placing Camera"
- Click map once to place marker

### Modal Won't Open
- Make sure you completed the drawing (double-click)
- Check browser console for JavaScript errors
- Try refreshing the page

### Statistics Not Updating
- Statistics update automatically after save/delete
- If stuck, refresh the page to force re-fetch

### Delete Not Working
- Ensure you clicked the delete button
- Confirm in the dialog that appears
- Check backend server is running
- Check browser console for API errors

## 9. Data Flow

```
User Action → Frontend Modal → API Request → Backend View → Database
                    ↓                                         ↓
              Toast Notification                    Create/Update/Delete
                    ↓                                         ↓
              Refresh Data ← API Response ← JSON Serialization
                    ↓
              Update Map & Statistics
```

## 10. API Endpoints Reference

### Create Field
```
POST /api/fields/create/
Body: {
  name: string,
  crop_type: string,
  planting_date: string (optional),
  notes: string (optional),
  polygon: [[lat, lng], ...],
  area_size: number
}
```

### Create Camera
```
POST /api/cameras/create/
Body: {
  name: string,
  latitude: number,
  longitude: number,
  stream_url: string (optional),
  notes: string (optional)
}
```

### Delete Field
```
DELETE /api/fields/<field_id>/delete/
```

### Delete Camera
```
DELETE /api/cameras/<camera_id>/delete/
```

### Get Farm Data
```
GET /api/farm-data/
Response: {
  farm: { name, city, latitude, longitude },
  fields: [{ id, name, crop_type, polygon, ... }],
  cameras: [{ id, name, latitude, longitude, ... }],
  stock: [...]
}
```

## 11. Crop Types Available

1. **Tomato** - Solanum lycopersicum
2. **Olives** - Olea europaea
3. **Wheat** - Triticum aestivum
4. **Potato** - Solanum tuberosum
5. **Citrus Fruits** - Various citrus species
6. **Dates** - Phoenix dactylifera
7. **Grapes** - Vitis vinifera
8. **Mixed Vegetables** - Various vegetables
9. **Other** - Custom crop type

## 12. Color Legend

- 🟢 **Green Marker**: Farm Headquarters (your main location)
- 🟠 **Orange Marker**: Fields (with orange polygon boundaries)
- 🔵 **Blue Marker**: Monitoring Cameras

## 13. Best Practices

### Field Naming
- Use descriptive names: "North Field", "Tomato Plot 1"
- Include location reference: "East Section A"
- Keep names short and clear

### Drawing Fields
- Draw boundaries accurately along actual field edges
- Include buffer zones if needed
- Close polygons properly (double-click)

### Camera Placement
- Place cameras at strategic monitoring points
- Name cameras by location: "North Gate", "Main Entrance"
- Add stream URLs for easy access

### Deleting Items
- Always confirm deletions (they're permanent)
- Review item details before deleting
- Consider deactivating instead of deleting cameras

## 14. Performance Tips

- Limit fields to reasonable count (< 50 for best performance)
- Avoid extremely complex polygons (< 100 points)
- Close unused popups to free memory
- Refresh page if map becomes sluggish

## 15. Security Notes

- All API requests require JWT authentication
- Tokens stored in localStorage
- Tokens expire after 1 hour (access) / 7 days (refresh)
- Only your own fields/cameras are visible
- Re-login if you get 401 errors

## 🎉 You're All Set!

Your interactive farm map is ready to use. Start by:
1. Drawing your first field
2. Placing your first camera
3. Exploring the statistics

For detailed implementation info, see: **INTERACTIVE_MAP_SUMMARY.md**

---

**Support**: Check browser console for errors if anything doesn't work
**Documentation**: All code is well-commented for easy understanding
