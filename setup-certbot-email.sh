#!/bin/bash
# Setup script for certbot email notifications
# This configures automated certificate renewal with email notifications

set -e

EMAIL_TO="$1"

if [ -z "$EMAIL_TO" ]; then
    echo "Usage: $0 <your-email@example.com>"
    echo ""
    echo "This will set up automated certificate renewal with email notifications."
    echo "You'll receive emails only when renewal succeeds or fails."
    exit 1
fi

echo "Setting up certbot email notifications for: $EMAIL_TO"
echo ""

# Install Python email dependencies if needed
if ! python3 -c "import smtplib" 2>/dev/null; then
    echo "Python3 smtplib is available (built-in)"
fi

# Create the renewal hook script
sudo tee /etc/letsencrypt/renewal-hooks/deploy/send-email-notification.sh > /dev/null << 'HOOK_EOF'
#!/bin/bash
# Certbot renewal hook - sends email notification after renewal

EMAIL_TO="EMAIL_PLACEHOLDER"
CERT_DOMAINS="$RENEWED_DOMAINS"
CERT_PATH="$RENEWED_LINEAGE"

if [ -z "$CERT_PATH" ]; then
    # Renewal failed - this is a deploy hook, so if RENEWED_LINEAGE is empty,
    # we're running on a failed renewal check
    exit 0
fi

# Renewal succeeded
SUBJECT="✅ SSL Certificate Renewed - kenex.org"
EXPIRY=$(sudo openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2)

BODY="SSL Certificate renewal completed successfully!

Certificate: $CERT_DOMAINS
Expiration Date: $EXPIRY

The certificate has been automatically renewed and nginx reloaded.
Next renewal: approximately 60 days from now.
"

# Send email using Python
python3 << PYTHON_EOF
import smtplib
from email.mime.text import MIMEText
import subprocess
import sys

try:
    # Try using system sendmail first (no configuration needed)
    msg = MIMEText("""$BODY""")
    msg['From'] = "certbot@kenex.org"
    msg['To'] = """$EMAIL_TO"""
    msg['Subject'] = """$SUBJECT"""
    
    # Try system sendmail (works if mail is configured)
    try:
        p = subprocess.Popen(["/usr/sbin/sendmail", "-t"], stdin=subprocess.PIPE)
        p.communicate(msg.as_string().encode())
        if p.returncode == 0:
            sys.exit(0)
    except:
        pass
    
    # Fallback: log to syslog
    import logging
    logging.basicConfig()
    logger = logging.getLogger()
    logger.warning("Certbot renewal notification (email not configured): """$SUBJECT""")
    
except Exception as e:
    # Silent fail - don't break renewal if email fails
    pass
PYTHON_EOF

# Reload nginx
sudo systemctl reload nginx

# Log success
logger -t certbot "Certificate renewed for $CERT_DOMAINS"
HOOK_EOF

# Replace email placeholder
sudo sed -i "s/EMAIL_PLACEHOLDER/$EMAIL_TO/g" /etc/letsencrypt/renewal-hooks/deploy/send-email-notification.sh

# Make executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/send-email-notification.sh

# Also create a post-renewal hook for failure notifications
sudo tee /etc/letsencrypt/renewal-hooks/post/check-renewal-status.sh > /dev/null << 'POST_HOOK_EOF'
#!/bin/bash
# Check if renewal failed and send notification

EMAIL_TO="EMAIL_PLACEHOLDER"

# This runs after renewal attempts
# Check certbot logs for recent failures
LOG_FILE="/var/log/letsencrypt/letsencrypt.log"

# Check if last renewal failed (simplified check)
if grep -q "All renewal attempts failed" "$LOG_FILE" 2>/dev/null; then
    SUBJECT="❌ SSL Certificate Renewal Failed - kenex.org"
    BODY="SSL Certificate renewal FAILED!

Please check the certbot logs and renew manually:
- Log: $LOG_FILE
- Command: sudo certbot renew

Your certificates may expire soon!"
    
    python3 << PYTHON_EOF
import smtplib
from email.mime.text import MIMEText
import subprocess
try:
    msg = MIMEText("""$BODY""")
    msg['From'] = "certbot@kenex.org"
    msg['To'] = """$EMAIL_TO"""
    msg['Subject'] = """$SUBJECT"""
    try:
        p = subprocess.Popen(["/usr/sbin/sendmail", "-t"], stdin=subprocess.PIPE)
        p.communicate(msg.as_string().encode())
    except:
        logger.warning("Certbot renewal failed")
except:
    pass
PYTHON_EOF
fi
POST_HOOK_EOF

sudo sed -i "s/EMAIL_PLACEHOLDER/$EMAIL_TO/g" /etc/letsencrypt/renewal-hooks/post/check-renewal-status.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/check-renewal-status.sh

echo "✓ Email notification hooks installed"
echo ""

# Test with dry run
echo "Testing renewal system (dry run)..."
if sudo certbot renew --dry-run > /dev/null 2>&1; then
    echo "✓ Certbot renewal system is working"
else
    echo "⚠ Note: Dry run had issues (this may be normal)"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Email notifications configured for: $EMAIL_TO"
echo ""
echo "The system will automatically:"
echo "  - Attempt renewal twice daily"
echo "  - Email you on SUCCESS (with expiry date)"
echo "  - Email you on FAILURE (with troubleshooting info)"
echo ""
echo "To test email manually, run:"
echo "  sudo certbot renew --dry-run"
echo ""
echo "To check renewal status:"
echo "  sudo certbot certificates"

# Setup script for certbot email notifications
# This configures automated certificate renewal with email notifications

set -e

EMAIL_TO="$1"

if [ -z "$EMAIL_TO" ]; then
    echo "Usage: $0 <your-email@example.com>"
    echo ""
    echo "This will set up automated certificate renewal with email notifications."
    echo "You'll receive emails only when renewal succeeds or fails."
    exit 1
fi

echo "Setting up certbot email notifications for: $EMAIL_TO"
echo ""

# Install Python email dependencies if needed
if ! python3 -c "import smtplib" 2>/dev/null; then
    echo "Python3 smtplib is available (built-in)"
fi

# Create the renewal hook script
sudo tee /etc/letsencrypt/renewal-hooks/deploy/send-email-notification.sh > /dev/null << 'HOOK_EOF'
#!/bin/bash
# Certbot renewal hook - sends email notification after renewal

EMAIL_TO="EMAIL_PLACEHOLDER"
CERT_DOMAINS="$RENEWED_DOMAINS"
CERT_PATH="$RENEWED_LINEAGE"

if [ -z "$CERT_PATH" ]; then
    # Renewal failed - this is a deploy hook, so if RENEWED_LINEAGE is empty,
    # we're running on a failed renewal check
    exit 0
fi

# Renewal succeeded
SUBJECT="✅ SSL Certificate Renewed - kenex.org"
EXPIRY=$(sudo openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2)

BODY="SSL Certificate renewal completed successfully!

Certificate: $CERT_DOMAINS
Expiration Date: $EXPIRY

The certificate has been automatically renewed and nginx reloaded.
Next renewal: approximately 60 days from now.
"

# Send email using Python
python3 << PYTHON_EOF
import smtplib
from email.mime.text import MIMEText
import subprocess
import sys

try:
    # Try using system sendmail first (no configuration needed)
    msg = MIMEText("""$BODY""")
    msg['From'] = "certbot@kenex.org"
    msg['To'] = """$EMAIL_TO"""
    msg['Subject'] = """$SUBJECT"""
    
    # Try system sendmail (works if mail is configured)
    try:
        p = subprocess.Popen(["/usr/sbin/sendmail", "-t"], stdin=subprocess.PIPE)
        p.communicate(msg.as_string().encode())
        if p.returncode == 0:
            sys.exit(0)
    except:
        pass
    
    # Fallback: log to syslog
    import logging
    logging.basicConfig()
    logger = logging.getLogger()
    logger.warning("Certbot renewal notification (email not configured): """$SUBJECT""")
    
except Exception as e:
    # Silent fail - don't break renewal if email fails
    pass
PYTHON_EOF

# Reload nginx
sudo systemctl reload nginx

# Log success
logger -t certbot "Certificate renewed for $CERT_DOMAINS"
HOOK_EOF

# Replace email placeholder
sudo sed -i "s/EMAIL_PLACEHOLDER/$EMAIL_TO/g" /etc/letsencrypt/renewal-hooks/deploy/send-email-notification.sh

# Make executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/send-email-notification.sh

# Also create a post-renewal hook for failure notifications
sudo tee /etc/letsencrypt/renewal-hooks/post/check-renewal-status.sh > /dev/null << 'POST_HOOK_EOF'
#!/bin/bash
# Check if renewal failed and send notification

EMAIL_TO="EMAIL_PLACEHOLDER"

# This runs after renewal attempts
# Check certbot logs for recent failures
LOG_FILE="/var/log/letsencrypt/letsencrypt.log"

# Check if last renewal failed (simplified check)
if grep -q "All renewal attempts failed" "$LOG_FILE" 2>/dev/null; then
    SUBJECT="❌ SSL Certificate Renewal Failed - kenex.org"
    BODY="SSL Certificate renewal FAILED!

Please check the certbot logs and renew manually:
- Log: $LOG_FILE
- Command: sudo certbot renew

Your certificates may expire soon!"
    
    python3 << PYTHON_EOF
import smtplib
from email.mime.text import MIMEText
import subprocess
try:
    msg = MIMEText("""$BODY""")
    msg['From'] = "certbot@kenex.org"
    msg['To'] = """$EMAIL_TO"""
    msg['Subject'] = """$SUBJECT"""
    try:
        p = subprocess.Popen(["/usr/sbin/sendmail", "-t"], stdin=subprocess.PIPE)
        p.communicate(msg.as_string().encode())
    except:
        logger.warning("Certbot renewal failed")
except:
    pass
PYTHON_EOF
fi
POST_HOOK_EOF

sudo sed -i "s/EMAIL_PLACEHOLDER/$EMAIL_TO/g" /etc/letsencrypt/renewal-hooks/post/check-renewal-status.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/check-renewal-status.sh

echo "✓ Email notification hooks installed"
echo ""

# Test with dry run
echo "Testing renewal system (dry run)..."
if sudo certbot renew --dry-run > /dev/null 2>&1; then
    echo "✓ Certbot renewal system is working"
else
    echo "⚠ Note: Dry run had issues (this may be normal)"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Email notifications configured for: $EMAIL_TO"
echo ""
echo "The system will automatically:"
echo "  - Attempt renewal twice daily"
echo "  - Email you on SUCCESS (with expiry date)"
echo "  - Email you on FAILURE (with troubleshooting info)"
echo ""
echo "To test email manually, run:"
echo "  sudo certbot renew --dry-run"
echo ""
echo "To check renewal status:"
echo "  sudo certbot certificates"

# Setup script for certbot email notifications
# This configures automated certificate renewal with email notifications

set -e

EMAIL_TO="$1"

if [ -z "$EMAIL_TO" ]; then
    echo "Usage: $0 <your-email@example.com>"
    echo ""
    echo "This will set up automated certificate renewal with email notifications."
    echo "You'll receive emails only when renewal succeeds or fails."
    exit 1
fi

echo "Setting up certbot email notifications for: $EMAIL_TO"
echo ""

# Install Python email dependencies if needed
if ! python3 -c "import smtplib" 2>/dev/null; then
    echo "Python3 smtplib is available (built-in)"
fi

# Create the renewal hook script
sudo tee /etc/letsencrypt/renewal-hooks/deploy/send-email-notification.sh > /dev/null << 'HOOK_EOF'
#!/bin/bash
# Certbot renewal hook - sends email notification after renewal

EMAIL_TO="EMAIL_PLACEHOLDER"
CERT_DOMAINS="$RENEWED_DOMAINS"
CERT_PATH="$RENEWED_LINEAGE"

if [ -z "$CERT_PATH" ]; then
    # Renewal failed - this is a deploy hook, so if RENEWED_LINEAGE is empty,
    # we're running on a failed renewal check
    exit 0
fi

# Renewal succeeded
SUBJECT="✅ SSL Certificate Renewed - kenex.org"
EXPIRY=$(sudo openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2)

BODY="SSL Certificate renewal completed successfully!

Certificate: $CERT_DOMAINS
Expiration Date: $EXPIRY

The certificate has been automatically renewed and nginx reloaded.
Next renewal: approximately 60 days from now.
"

# Send email using Python
python3 << PYTHON_EOF
import smtplib
from email.mime.text import MIMEText
import subprocess
import sys

try:
    # Try using system sendmail first (no configuration needed)
    msg = MIMEText("""$BODY""")
    msg['From'] = "certbot@kenex.org"
    msg['To'] = """$EMAIL_TO"""
    msg['Subject'] = """$SUBJECT"""
    
    # Try system sendmail (works if mail is configured)
    try:
        p = subprocess.Popen(["/usr/sbin/sendmail", "-t"], stdin=subprocess.PIPE)
        p.communicate(msg.as_string().encode())
        if p.returncode == 0:
            sys.exit(0)
    except:
        pass
    
    # Fallback: log to syslog
    import logging
    logging.basicConfig()
    logger = logging.getLogger()
    logger.warning("Certbot renewal notification (email not configured): """$SUBJECT""")
    
except Exception as e:
    # Silent fail - don't break renewal if email fails
    pass
PYTHON_EOF

# Reload nginx
sudo systemctl reload nginx

# Log success
logger -t certbot "Certificate renewed for $CERT_DOMAINS"
HOOK_EOF

# Replace email placeholder
sudo sed -i "s/EMAIL_PLACEHOLDER/$EMAIL_TO/g" /etc/letsencrypt/renewal-hooks/deploy/send-email-notification.sh

# Make executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/send-email-notification.sh

# Also create a post-renewal hook for failure notifications
sudo tee /etc/letsencrypt/renewal-hooks/post/check-renewal-status.sh > /dev/null << 'POST_HOOK_EOF'
#!/bin/bash
# Check if renewal failed and send notification

EMAIL_TO="EMAIL_PLACEHOLDER"

# This runs after renewal attempts
# Check certbot logs for recent failures
LOG_FILE="/var/log/letsencrypt/letsencrypt.log"

# Check if last renewal failed (simplified check)
if grep -q "All renewal attempts failed" "$LOG_FILE" 2>/dev/null; then
    SUBJECT="❌ SSL Certificate Renewal Failed - kenex.org"
    BODY="SSL Certificate renewal FAILED!

Please check the certbot logs and renew manually:
- Log: $LOG_FILE
- Command: sudo certbot renew

Your certificates may expire soon!"
    
    python3 << PYTHON_EOF
import smtplib
from email.mime.text import MIMEText
import subprocess
try:
    msg = MIMEText("""$BODY""")
    msg['From'] = "certbot@kenex.org"
    msg['To'] = """$EMAIL_TO"""
    msg['Subject'] = """$SUBJECT"""
    try:
        p = subprocess.Popen(["/usr/sbin/sendmail", "-t"], stdin=subprocess.PIPE)
        p.communicate(msg.as_string().encode())
    except:
        logger.warning("Certbot renewal failed")
except:
    pass
PYTHON_EOF
fi
POST_HOOK_EOF

sudo sed -i "s/EMAIL_PLACEHOLDER/$EMAIL_TO/g" /etc/letsencrypt/renewal-hooks/post/check-renewal-status.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/check-renewal-status.sh

echo "✓ Email notification hooks installed"
echo ""

# Test with dry run
echo "Testing renewal system (dry run)..."
if sudo certbot renew --dry-run > /dev/null 2>&1; then
    echo "✓ Certbot renewal system is working"
else
    echo "⚠ Note: Dry run had issues (this may be normal)"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Email notifications configured for: $EMAIL_TO"
echo ""
echo "The system will automatically:"
echo "  - Attempt renewal twice daily"
echo "  - Email you on SUCCESS (with expiry date)"
echo "  - Email you on FAILURE (with troubleshooting info)"
echo ""
echo "To test email manually, run:"
echo "  sudo certbot renew --dry-run"
echo ""
echo "To check renewal status:"
echo "  sudo certbot certificates"

