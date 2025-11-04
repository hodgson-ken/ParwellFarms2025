#!/bin/bash
# Simple setup for automated certificate renewal with email notifications

if [ -z "$1" ]; then
    echo "Usage: $0 <your-email@example.com>"
    echo ""
    echo "This sets up automated SSL certificate renewal with email notifications."
    exit 1
fi

EMAIL="$1"
HOOK_DIR="/etc/letsencrypt/renewal-hooks/deploy"

echo "Setting up automated renewal with email notifications..."
echo "Email: $EMAIL"
echo ""

# Register email with certbot for the account (for failure notifications)
echo "Registering email with certbot..."
sudo certbot register --update-email --email "$EMAIL" --non-interactive --agree-tos 2>/dev/null || \
    echo "Note: Email may already be registered"

# Create a simple deploy hook that sends email on success
sudo tee "$HOOK_DIR/email-on-success.sh" > /dev/null << 'SCRIPT'
#!/bin/bash
# Send email notification on successful renewal

EMAIL_TO="EMAIL_PLACEHOLDER"
DOMAINS="$RENEWED_DOMAINS"
CERT_PATH="$RENEWED_LINEAGE"

if [ -z "$CERT_PATH" ]; then
    exit 0  # Not a renewal
fi

# Get expiration date
EXPIRY=$(sudo openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2 | xargs -I {} date -d {} '+%B %d, %Y' 2>/dev/null || echo "unknown")

SUBJECT="✅ SSL Certificate Renewed - kenex.org"
BODY="SSL certificate renewal completed successfully!

Domains: $DOMAINS
Expiration: $EXPIRY
Certificate Path: $CERT_PATH

Nginx has been automatically reloaded.
Next automatic renewal: ~60 days before expiration.
"

# Use certbot's email notification (via logger to syslog, then we'll configure log emails)
logger -t certbot-renewal "SUCCESS: $DOMAINS renewed, expires $EXPIRY"

# Try to send email using mail command or Python
if command -v mail &> /dev/null; then
    echo "$BODY" | mail -s "$SUBJECT" "$EMAIL_TO" 2>/dev/null || true
elif command -v python3 &> /dev/null; then
    python3 << PYEOF
import smtplib
from email.mime.text import MIMEText
import subprocess
import sys

try:
    msg = MIMEText("""$BODY""")
    msg['From'] = "certbot@kenex.org"
    msg['To'] = """$EMAIL_TO"""
    msg['Subject'] = """$SUBJECT"""
    
    # Try sendmail
    try:
        p = subprocess.Popen(["/usr/sbin/sendmail", "-t", "-oi"], stdin=subprocess.PIPE)
        p.communicate(msg.as_string().encode())
        sys.exit(0)
    except:
        pass
    
    # If sendmail fails, at least log it
    import logging
    logging.warning("Email notification attempted (sendmail not configured)")
except:
    pass
PYEOF
fi

# Reload nginx
sudo systemctl reload nginx >/dev/null 2>&1 || true
SCRIPT

sudo sed -i "s/EMAIL_PLACEHOLDER/$EMAIL/g" "$HOOK_DIR/email-on-success.sh"
sudo chmod +x "$HOOK_DIR/email-on-success.sh"

echo "✓ Success hook installed"

# Verify certbot timer is active
if systemctl is-active --quiet snap.certbot.renew.timer || systemctl is-enabled --quiet certbot.timer 2>/dev/null; then
    echo "✓ Certbot auto-renewal timer is active"
else
    echo "⚠ Certbot timer may need configuration"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Renewal Status:"
sudo certbot certificates | grep -E "Certificate Name|Domains|Expiry"
echo ""
echo "Next renewal attempt: Check with 'systemctl list-timers | grep certbot'"
echo ""
echo "To test the email notification, you can manually trigger a renewal:"
echo "  sudo certbot renew --force-renewal"

# Simple setup for automated certificate renewal with email notifications

if [ -z "$1" ]; then
    echo "Usage: $0 <your-email@example.com>"
    echo ""
    echo "This sets up automated SSL certificate renewal with email notifications."
    exit 1
fi

EMAIL="$1"
HOOK_DIR="/etc/letsencrypt/renewal-hooks/deploy"

echo "Setting up automated renewal with email notifications..."
echo "Email: $EMAIL"
echo ""

# Register email with certbot for the account (for failure notifications)
echo "Registering email with certbot..."
sudo certbot register --update-email --email "$EMAIL" --non-interactive --agree-tos 2>/dev/null || \
    echo "Note: Email may already be registered"

# Create a simple deploy hook that sends email on success
sudo tee "$HOOK_DIR/email-on-success.sh" > /dev/null << 'SCRIPT'
#!/bin/bash
# Send email notification on successful renewal

EMAIL_TO="EMAIL_PLACEHOLDER"
DOMAINS="$RENEWED_DOMAINS"
CERT_PATH="$RENEWED_LINEAGE"

if [ -z "$CERT_PATH" ]; then
    exit 0  # Not a renewal
fi

# Get expiration date
EXPIRY=$(sudo openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2 | xargs -I {} date -d {} '+%B %d, %Y' 2>/dev/null || echo "unknown")

SUBJECT="✅ SSL Certificate Renewed - kenex.org"
BODY="SSL certificate renewal completed successfully!

Domains: $DOMAINS
Expiration: $EXPIRY
Certificate Path: $CERT_PATH

Nginx has been automatically reloaded.
Next automatic renewal: ~60 days before expiration.
"

# Use certbot's email notification (via logger to syslog, then we'll configure log emails)
logger -t certbot-renewal "SUCCESS: $DOMAINS renewed, expires $EXPIRY"

# Try to send email using mail command or Python
if command -v mail &> /dev/null; then
    echo "$BODY" | mail -s "$SUBJECT" "$EMAIL_TO" 2>/dev/null || true
elif command -v python3 &> /dev/null; then
    python3 << PYEOF
import smtplib
from email.mime.text import MIMEText
import subprocess
import sys

try:
    msg = MIMEText("""$BODY""")
    msg['From'] = "certbot@kenex.org"
    msg['To'] = """$EMAIL_TO"""
    msg['Subject'] = """$SUBJECT"""
    
    # Try sendmail
    try:
        p = subprocess.Popen(["/usr/sbin/sendmail", "-t", "-oi"], stdin=subprocess.PIPE)
        p.communicate(msg.as_string().encode())
        sys.exit(0)
    except:
        pass
    
    # If sendmail fails, at least log it
    import logging
    logging.warning("Email notification attempted (sendmail not configured)")
except:
    pass
PYEOF
fi

# Reload nginx
sudo systemctl reload nginx >/dev/null 2>&1 || true
SCRIPT

sudo sed -i "s/EMAIL_PLACEHOLDER/$EMAIL/g" "$HOOK_DIR/email-on-success.sh"
sudo chmod +x "$HOOK_DIR/email-on-success.sh"

echo "✓ Success hook installed"

# Verify certbot timer is active
if systemctl is-active --quiet snap.certbot.renew.timer || systemctl is-enabled --quiet certbot.timer 2>/dev/null; then
    echo "✓ Certbot auto-renewal timer is active"
else
    echo "⚠ Certbot timer may need configuration"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Renewal Status:"
sudo certbot certificates | grep -E "Certificate Name|Domains|Expiry"
echo ""
echo "Next renewal attempt: Check with 'systemctl list-timers | grep certbot'"
echo ""
echo "To test the email notification, you can manually trigger a renewal:"
echo "  sudo certbot renew --force-renewal"

# Simple setup for automated certificate renewal with email notifications

if [ -z "$1" ]; then
    echo "Usage: $0 <your-email@example.com>"
    echo ""
    echo "This sets up automated SSL certificate renewal with email notifications."
    exit 1
fi

EMAIL="$1"
HOOK_DIR="/etc/letsencrypt/renewal-hooks/deploy"

echo "Setting up automated renewal with email notifications..."
echo "Email: $EMAIL"
echo ""

# Register email with certbot for the account (for failure notifications)
echo "Registering email with certbot..."
sudo certbot register --update-email --email "$EMAIL" --non-interactive --agree-tos 2>/dev/null || \
    echo "Note: Email may already be registered"

# Create a simple deploy hook that sends email on success
sudo tee "$HOOK_DIR/email-on-success.sh" > /dev/null << 'SCRIPT'
#!/bin/bash
# Send email notification on successful renewal

EMAIL_TO="EMAIL_PLACEHOLDER"
DOMAINS="$RENEWED_DOMAINS"
CERT_PATH="$RENEWED_LINEAGE"

if [ -z "$CERT_PATH" ]; then
    exit 0  # Not a renewal
fi

# Get expiration date
EXPIRY=$(sudo openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2 | xargs -I {} date -d {} '+%B %d, %Y' 2>/dev/null || echo "unknown")

SUBJECT="✅ SSL Certificate Renewed - kenex.org"
BODY="SSL certificate renewal completed successfully!

Domains: $DOMAINS
Expiration: $EXPIRY
Certificate Path: $CERT_PATH

Nginx has been automatically reloaded.
Next automatic renewal: ~60 days before expiration.
"

# Use certbot's email notification (via logger to syslog, then we'll configure log emails)
logger -t certbot-renewal "SUCCESS: $DOMAINS renewed, expires $EXPIRY"

# Try to send email using mail command or Python
if command -v mail &> /dev/null; then
    echo "$BODY" | mail -s "$SUBJECT" "$EMAIL_TO" 2>/dev/null || true
elif command -v python3 &> /dev/null; then
    python3 << PYEOF
import smtplib
from email.mime.text import MIMEText
import subprocess
import sys

try:
    msg = MIMEText("""$BODY""")
    msg['From'] = "certbot@kenex.org"
    msg['To'] = """$EMAIL_TO"""
    msg['Subject'] = """$SUBJECT"""
    
    # Try sendmail
    try:
        p = subprocess.Popen(["/usr/sbin/sendmail", "-t", "-oi"], stdin=subprocess.PIPE)
        p.communicate(msg.as_string().encode())
        sys.exit(0)
    except:
        pass
    
    # If sendmail fails, at least log it
    import logging
    logging.warning("Email notification attempted (sendmail not configured)")
except:
    pass
PYEOF
fi

# Reload nginx
sudo systemctl reload nginx >/dev/null 2>&1 || true
SCRIPT

sudo sed -i "s/EMAIL_PLACEHOLDER/$EMAIL/g" "$HOOK_DIR/email-on-success.sh"
sudo chmod +x "$HOOK_DIR/email-on-success.sh"

echo "✓ Success hook installed"

# Verify certbot timer is active
if systemctl is-active --quiet snap.certbot.renew.timer || systemctl is-enabled --quiet certbot.timer 2>/dev/null; then
    echo "✓ Certbot auto-renewal timer is active"
else
    echo "⚠ Certbot timer may need configuration"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Renewal Status:"
sudo certbot certificates | grep -E "Certificate Name|Domains|Expiry"
echo ""
echo "Next renewal attempt: Check with 'systemctl list-timers | grep certbot'"
echo ""
echo "To test the email notification, you can manually trigger a renewal:"
echo "  sudo certbot renew --force-renewal"

