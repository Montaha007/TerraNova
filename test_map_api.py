#!/usr/bin/env python3
"""
Test script to verify backend API endpoints for interactive map
Run this after starting Django server: python manage.py runserver
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_authentication():
    """Test user authentication"""
    print("\n=== Testing Authentication ===")
    
    # Register
    register_data = {
        "username": "testfarm",
        "password": "test123456",
        "email": "test@farm.com",
        "farm_name": "Test Farm",
        "city": "Nabeul"
    }
    
    response = requests.post(f"{BASE_URL}/api/register/", json=register_data)
    print(f"Register: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        token = data['tokens']['access']
        print(f"✓ Registration successful, got token")
        return token
    else:
        print(f"✗ Registration failed: {response.text}")
        
        # Try login instead
        login_data = {
            "username": "testfarm",
            "password": "test123456"
        }
        response = requests.post(f"{BASE_URL}/api/login/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            token = data['tokens']['access']
            print(f"✓ Login successful, got token")
            return token
        return None

def test_create_field(token):
    """Test field creation"""
    print("\n=== Testing Create Field ===")
    
    field_data = {
        "name": "Test Field",
        "crop_type": "tomato",
        "planting_date": "2024-11-20",
        "notes": "Test field for API verification",
        "polygon": [
            [36.45, 10.73],
            [36.45, 10.74],
            [36.46, 10.74],
            [36.46, 10.73],
            [36.45, 10.73]
        ],
        "area_size": 1.5
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{BASE_URL}/api/fields/create/", 
                            json=field_data, 
                            headers=headers)
    print(f"Create Field: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"✓ Field created: {data['field']['name']}")
        print(f"  ID: {data['field']['id']}")
        print(f"  Crop: {data['field']['crop_type']}")
        print(f"  Area: {data['field']['area_size']} ha")
        return data['field']['id']
    else:
        print(f"✗ Field creation failed: {response.text}")
        return None

def test_create_camera(token):
    """Test camera creation"""
    print("\n=== Testing Create Camera ===")
    
    camera_data = {
        "name": "Test Camera",
        "latitude": 36.4516,
        "longitude": 10.7358,
        "stream_url": "rtsp://test.example.com/stream",
        "notes": "Test camera for API verification"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{BASE_URL}/api/cameras/create/", 
                            json=camera_data, 
                            headers=headers)
    print(f"Create Camera: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"✓ Camera created: {data['camera']['name']}")
        print(f"  ID: {data['camera']['id']}")
        print(f"  Location: {data['camera']['latitude']}, {data['camera']['longitude']}")
        return data['camera']['id']
    else:
        print(f"✗ Camera creation failed: {response.text}")
        return None

def test_get_farm_data(token):
    """Test farm data retrieval"""
    print("\n=== Testing Get Farm Data ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/api/farm-data/", headers=headers)
    print(f"Get Farm Data: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Farm data retrieved")
        print(f"  Farm: {data['farm']['name']}")
        print(f"  City: {data['farm']['city']}")
        print(f"  Fields: {len(data.get('fields', []))}")
        print(f"  Cameras: {len(data.get('cameras', []))}")
        
        if data.get('fields'):
            for field in data['fields']:
                print(f"    - {field['name']}: {field['crop_type']}, {field.get('area_size', 0)} ha")
                if field.get('polygon'):
                    print(f"      Polygon: {len(field['polygon'])} points")
        
        if data.get('cameras'):
            for camera in data['cameras']:
                print(f"    - {camera['name']}: {camera['latitude']}, {camera['longitude']}")
        
        return True
    else:
        print(f"✗ Failed to get farm data: {response.text}")
        return False

def test_delete_field(token, field_id):
    """Test field deletion"""
    print(f"\n=== Testing Delete Field (ID: {field_id}) ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.delete(f"{BASE_URL}/api/fields/{field_id}/delete/", 
                              headers=headers)
    print(f"Delete Field: {response.status_code}")
    if response.status_code == 200:
        print(f"✓ Field deleted successfully")
        return True
    else:
        print(f"✗ Field deletion failed: {response.text}")
        return False

def test_delete_camera(token, camera_id):
    """Test camera deletion"""
    print(f"\n=== Testing Delete Camera (ID: {camera_id}) ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.delete(f"{BASE_URL}/api/cameras/{camera_id}/delete/", 
                              headers=headers)
    print(f"Delete Camera: {response.status_code}")
    if response.status_code == 200:
        print(f"✓ Camera deleted successfully")
        return True
    else:
        print(f"✗ Camera deletion failed: {response.text}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("Interactive Map API Test Suite")
    print("=" * 50)
    
    # Test authentication
    token = test_authentication()
    if not token:
        print("\n✗ Authentication failed, stopping tests")
        return
    
    # Test create field
    field_id = test_create_field(token)
    
    # Test create camera
    camera_id = test_create_camera(token)
    
    # Test get farm data
    test_get_farm_data(token)
    
    # Test delete field
    if field_id:
        test_delete_field(token, field_id)
    
    # Test delete camera
    if camera_id:
        test_delete_camera(token, camera_id)
    
    # Verify deletions
    print("\n=== Verifying Deletions ===")
    test_get_farm_data(token)
    
    print("\n" + "=" * 50)
    print("Test Suite Complete!")
    print("=" * 50)

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to Django server")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n✗ Error: {e}")
