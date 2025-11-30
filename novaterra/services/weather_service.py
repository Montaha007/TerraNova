import requests     
from django.conf import settings

class WeatherService:
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    @staticmethod
    def get_current_weather(latitude, longitude):
        """Get current weather for coordinates"""
        try:
            url = f"{WeatherService.BASE_URL}/weather"
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': settings.OPENWEATHER_API_KEY,
                'units': 'metric',  # Celsius
                'lang': 'en'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 401:
                print(f"⚠️  OpenWeatherMap API key not yet active. Using mock data for now.")
                print(f"   Check back in 30-60 minutes for real weather data.")
                # Return None to trigger mock data
                return None
            
            response.raise_for_status()
            data = response.json()
            
            # Extract relevant data
            weather_data = {
                'temperature': round(data['main']['temp']),
                'feels_like': round(data['main']['feels_like']),
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'wind_speed': round(data['wind']['speed'] * 3.6, 1),  # m/s to km/h
                'description': data['weather'][0]['description'].title(),
                'icon': data['weather'][0]['icon'],
                'condition': data['weather'][0]['main'],
                'clouds': data['clouds']['all'],
                'visibility': data.get('visibility', 0) / 1000,  # meters to km
                'sunrise': data['sys']['sunrise'],
                'sunset': data['sys']['sunset'],
                'location_name': data['name'],
            }
            
            # Calculate if good for farming
            weather_data['good_for_farming'] = WeatherService.is_good_for_farming(weather_data)
            
            return weather_data
            
        except requests.exceptions.RequestException as e:
            print(f"Weather API Error: {e}")
            return None
    
    @staticmethod
    def get_mock_weather():
        """Return mock weather data when API is unavailable"""
        return {
            'temperature': 24,
            'feels_like': 26,
            'humidity': 65,
            'pressure': 1013,
            'wind_speed': 12.5,
            'description': 'Partly Cloudy',
            'icon': '02d',
            'condition': 'Clouds',
            'clouds': 40,
            'visibility': 10.0,
            'sunrise': 1700543400,
            'sunset': 1700580600,
            'location_name': 'Tunisia',
            'good_for_farming': True
        }
    
    @staticmethod
    def is_good_for_farming(weather_data):
        """Determine if weather conditions are good for farming activities"""
        temp = weather_data['temperature']
        humidity = weather_data['humidity']
        wind_speed = weather_data['wind_speed']
        condition = weather_data['condition'].lower()
        
        # Bad conditions
        if condition in ['rain', 'thunderstorm', 'snow', 'drizzle']:
            return False
        
        if wind_speed > 30:  # Strong winds
            return False
        
        if temp < 5 or temp > 40:  # Too cold or too hot
            return False
        
        if humidity > 90:  # Too humid (risk of fungal diseases)
            return False
        
        # Good conditions
        return True
    
    @staticmethod
    def get_5day_forecast(latitude, longitude):
        """Get 5-day weather forecast"""
        try:
            url = f"{WeatherService.BASE_URL}/forecast"
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': settings.OPENWEATHER_API_KEY,
                'units': 'metric',
                'cnt': 40  # 5 days * 8 (3-hour intervals)
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Parse forecast data
            forecast = []
            for item in data['list']:
                forecast.append({
                    'date': item['dt'],
                    'temperature': round(item['main']['temp']),
                    'humidity': item['main']['humidity'],
                    'description': item['weather'][0]['description'],
                    'icon': item['weather'][0]['icon'],
                })
            
            return forecast
            
        except requests.exceptions.RequestException as e:
            print(f"Forecast API Error: {e}")
            return None