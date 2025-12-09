# novaterra/services/sms_service.py

from django.conf import settings
import requests


class SMSService:
    """
    SMS notification service for disease detection alerts
    Uses Twilio API (or can be adapted for other SMS providers)
    """
    
    def __init__(self):
        # Configuration from settings
        self.account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
        self.auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
        self.from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
        self.enabled = all([self.account_sid, self.auth_token, self.from_number])
    
    def send_disease_alert(self, phone_number, disease_name, field_name, severity):
        """
        Send SMS alert when disease is detected
        
        Args:
            phone_number (str): Recipient phone number (with country code, e.g., +216...)
            disease_name (str): Name of detected disease
            field_name (str): Name of affected field
            severity (str): Severity level (low, medium, high, critical)
        
        Returns:
            dict: Result with success status and message
        """
        if not self.enabled:
            print("SMS service not configured. Skipping SMS notification.")
            return {
                'success': False,
                'message': 'SMS service not configured'
            }
        
        if not phone_number:
            return {
                'success': False,
                'message': 'No phone number provided'
            }
        
        # Format phone number (ensure it starts with +)
        if not phone_number.startswith('+'):
            # Assume Tunisia country code +216
            phone_number = f'+216{phone_number}'
        
        # Create message based on severity
        severity_emoji = {
            'low': 'Info',
            'medium': 'Warning',
            'high': 'ALERT',
            'critical': 'URGENT'
        }
        
        message = (
            f"{severity_emoji.get(severity, 'Alert')}: Disease detected on your farm!\n\n"
            f"Disease: {disease_name}\n"
            f"Field: {field_name or 'Unknown'}\n"
            f"Severity: {severity.upper()}\n\n"
            f"Please check NovaTerra app for treatment recommendations."
        )
        
        try:
            # Twilio API endpoint
            url = f'https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json'
            
            data = {
                'From': self.from_number,
                'To': phone_number,
                'Body': message
            }
            
            response = requests.post(
                url,
                data=data,
                auth=(self.account_sid, self.auth_token),
                timeout=10
            )
            
            if response.status_code == 201:
                print(f"SMS sent successfully to {phone_number}")
                return {
                    'success': True,
                    'message': 'SMS sent successfully',
                    'sid': response.json().get('sid')
                }
            else:
                print(f"Failed to send SMS: {response.text}")
                return {
                    'success': False,
                    'message': f'SMS failed: {response.text}'
                }
        
        except Exception as e:
            print(f"SMS error: {str(e)}")
            return {
                'success': False,
                'message': f'SMS error: {str(e)}'
            }
    
    def send_custom_alert(self, phone_number, message):
        """
        Send custom SMS message
        
        Args:
            phone_number (str): Recipient phone number
            message (str): Message content
        
        Returns:
            dict: Result with success status
        """
        if not self.enabled:
            return {
                'success': False,
                'message': 'SMS service not configured'
            }
        
        if not phone_number.startswith('+'):
            phone_number = f'+216{phone_number}'
        
        try:
            url = f'https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json'
            
            data = {
                'From': self.from_number,
                'To': phone_number,
                'Body': message
            }
            
            response = requests.post(
                url,
                data=data,
                auth=(self.account_sid, self.auth_token),
                timeout=10
            )
            
            return {
                'success': response.status_code == 201,
                'message': 'SMS sent' if response.status_code == 201 else 'SMS failed'
            }
        
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }
