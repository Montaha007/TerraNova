# SMS Notification Setup Guide

## Overview

NovaTerra can send SMS alerts to farmers when plant diseases are detected. This feature uses Twilio's SMS API to send notifications directly to the farmer's mobile phone.

## Features

- **Automatic SMS Alerts**: When a disease is detected with medium or high severity, an SMS is automatically sent
- **Disease Information**: SMS includes disease name, affected field, and severity level
- **Treatment Link**: Directs users to check the app for treatment recommendations
- **Configurable**: Can be enabled/disabled via environment variables

## SMS Alert Example

```
ALERT: Disease detected on your farm!

Disease: Late Blight
Field: North Tomato Field
Severity: HIGH

Please check NovaTerra app for treatment recommendations.
```

## Setup Instructions

### 1. Create a Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. You'll get **$15 in free credit** for testing

### 2. Get Your Twilio Credentials

1. Log in to [Twilio Console](https://www.twilio.com/console)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Go to **Phone Numbers** → **Manage** → **Buy a number**
4. Choose a phone number (free with trial account)

### 3. Configure Environment Variables

Create or update your `.env` file:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Note**: The phone number must include the country code (e.g., +1 for USA, +216 for Tunisia)

### 4. Add Phone Number During Registration

Users must provide their phone number during registration to receive SMS alerts:

1. Register a new account
2. Fill in the **Phone Number** field (optional)
3. Use format: `20123456` or `+21620123456` (Tunisia)

### 5. Update Existing User Phone Numbers

Users can add/update their phone number in Settings:

```sql
-- Direct database update (if needed)
UPDATE novaterra_userprofile 
SET phone_number = '+21620123456' 
WHERE user_id = 1;
```

## Testing

### Test SMS Service

```python
# In Django shell: python manage.py shell

from novaterra.services.sms_service import SMSService
from django.contrib.auth.models import User

# Initialize service
sms_service = SMSService()

# Send test message
result = sms_service.send_custom_alert(
    phone_number='+21620123456',
    message='Test message from NovaTerra!'
)

print(result)
```

### Test Disease Detection Alert

1. Upload a plant image with disease
2. If disease is detected with medium/high severity
3. Check your phone for SMS alert
4. Check Django logs for SMS status

## Phone Number Formats

### Tunisia (Country Code: +216)

```
Accepted formats:
- +21620123456 (with country code)
- 21620123456 (without +)
- 20123456 (8 digits, system adds +216)
```

### International

```
Format: +[country_code][phone_number]
Examples:
- +33612345678 (France)
- +447911123456 (UK)
- +12025551234 (USA)
```

## Cost Estimate

### Twilio Pricing (as of 2024)

- **Trial Account**: $15 free credit
- **SMS to Tunisia**: ~$0.05 per message
- **SMS to USA**: ~$0.0075 per message
- **Free credits allow**: ~300 messages to Tunisia, ~2000 to USA

### Production Recommendations

1. **Start with trial** for testing
2. **Upgrade account** when ready for production
3. **Set up auto-recharge** to avoid service interruption
4. **Monitor usage** via Twilio dashboard

## Disable SMS Notifications

To disable SMS notifications:

1. **Leave Twilio credentials empty** in `.env`:
   ```env
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   TWILIO_PHONE_NUMBER=
   ```

2. SMS service will be automatically disabled
3. Disease detection will still work normally
4. No SMS attempts will be made

## Troubleshooting

### "SMS service not configured"

**Cause**: Twilio credentials not set in `.env`

**Solution**: 
- Add Twilio credentials to `.env` file
- Restart Django server

### "Failed to send SMS"

**Possible causes**:
1. Invalid phone number format
2. Twilio account not verified
3. Insufficient Twilio credit
4. Network connection issue

**Solutions**:
1. Check phone number includes country code
2. Verify your Twilio account
3. Check Twilio balance
4. Check internet connection

### "SMS sent but not received"

**Possible causes**:
1. Phone number not verified (trial account)
2. Network delay (can take 1-2 minutes)
3. Phone in Do Not Disturb mode

**Solutions**:
1. Add recipient number to Twilio verified numbers
2. Wait a few minutes
3. Check phone settings

## Alternative SMS Providers

While this implementation uses Twilio, you can adapt it for other providers:

### Vonage (Nexmo)

```python
# Update sms_service.py for Vonage
import vonage

client = vonage.Client(key=api_key, secret=api_secret)
sms = vonage.Sms(client)

responseData = sms.send_message({
    "from": sender,
    "to": recipient,
    "text": message,
})
```

### AWS SNS

```python
# Update sms_service.py for AWS SNS
import boto3

client = boto3.client('sns', region_name='us-east-1')

response = client.publish(
    PhoneNumber=phone_number,
    Message=message
)
```

## Security Considerations

1. **Never commit credentials**: Keep `.env` file out of version control
2. **Use environment variables**: Store credentials securely
3. **Validate phone numbers**: Prevent SMS spam/abuse
4. **Rate limiting**: Limit SMS per user per day
5. **User consent**: Only send to users who opt-in

## Future Enhancements

- [ ] SMS delivery status tracking
- [ ] User SMS preferences (severity threshold)
- [ ] SMS quota limits per user
- [ ] Multi-language SMS support
- [ ] SMS templates for different alert types
- [ ] Batch SMS for multiple disease detections
- [ ] SMS opt-in/opt-out via app settings

## Support

For Twilio support:
- Documentation: https://www.twilio.com/docs
- Support: https://support.twilio.com

For NovaTerra issues:
- Check Django logs: `python manage.py runserver`
- Check console for errors
- Verify phone number in database

## License

This SMS integration is part of the NovaTerra platform and follows the same license terms.
