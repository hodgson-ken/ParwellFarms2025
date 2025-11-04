#!/bin/bash
# Certbot renewal hook to send email notifications
# This script is called after each certificate renewal attempt

# Configuration - EDIT THESE VALUES
EMAIL_TO="your-email@example.com"  # Your email address
EMAIL_FROM="certbot@kenex.org"      # From address
SMTP_SERVER="smtp.gmail.com"        # Your SMTP server (Gmail: smtp.gmail.com)
SMTP_PORT="587"                     # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=""                        # SMTP username (leave empty for system mail)
SMTP_PASS=""                        # SMTP password (leave empty for system mail)
USE_TLS="true"                      # Use TLS for SMTP

# Certificate details
CERT_NAME="$RENEWED_DOMAINS"
CERT_PATH="$RENEWED_LINEAGE"
REMAINING_DAYS=30

# Determine email subject and body based on renewal result
if [ "$RENEWED_LINEAGE" != "" ]; then
    # Renewal succeeded
    SUBJECT="✅ SSL Certificate Renewed Successfully - kenex.org"
    
    # Get certificate expiration date
    EXPIRY_DATE=$(sudo openssl x509 -in "$RENEWED_LINEAGE/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2)
    
    BODY="SSL Certificate renewal completed successfully!

Certificate: $RENEWED_DOMAINS
Certificate Path: $RENEWED_LINEAGE
Expiration Date: $EXPIRY_DATE

The certificate has been automatically renewed and nginx has been reloaded.
"
else
    # Renewal failed (this hook runs on failure too)
    SUBJECT="❌ SSL Certificate Renewal Failed - kenex.org"
    BODY="SSL Certificate renewal FAILED!

Please check the certbot logs for details:
- Log file: /var/log/letsencrypt/letsencrypt.log
- Check renewal: sudo certbot renew --dry-run

You may need to manually renew the certificates."
fi

# Function to send email using Python
send_email_python() {
    python3 << EOF
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys

try:
    # Create message
    msg = MIMEMultipart()
    msg['From'] = "$EMAIL_FROM"
    msg['To'] = "$EMAIL_TO"
    msg['Subject'] = "$SUBJECT"
    msg.attach(MIMEText("$BODY", 'plain'))
    
    # Send email
    if "$SMTP_USER" and "$SMTP_PASS":
        # Use SMTP authentication
        server = smtplib.SMTP("$SMTP_SERVER", int("$SMTP_PORT"))
        if "$USE_TLS" == "true":
            server.starttls()
        server.login("$SMTP_USER", "$SMTP_PASS")
        server.send_message(msg)
        server.quit()
    else:
        # Use system sendmail
        import subprocess
        sendmail = subprocess.Popen(["/usr/sbin/sendmail", "-t"], stdin=subprocess.PIPE)
        sendmail.communicate(msg.as_string().encode())
    
    print("Email sent successfully")
    sys.exit(0)
except Exception as e:
    print(f"Failed to send email: {e}")
    sys.exit(1)
EOF
}

# Function to send email using system mail command
send_email_system() {
    echo "$BODY" | mail -s "$SUBJECT" "$EMAIL_TO" 2>/dev/null
}

# Try to send email
if command -v python3 &> /dev/null; then
    send_email_python
elif command -v mail &> /dev/null; then
    send_email_system
else
    echo "Warning: No email method available. Install python3 or mail utilities."
    # Log to syslog as fallback
    logger -t certbot "Certificate renewal notification: $SUBJECT"
fi

# Reload nginx if renewal succeeded
if [ "$RENEWED_LINEAGE" != "" ]; then
    sudo systemctl reload nginx
    logger -t certbot "Certificate renewed for $RENEWED_DOMAINS, nginx reloaded"
fi

# Certbot renewal hook to send email notifications
# This script is called after each certificate renewal attempt

# Configuration - EDIT THESE VALUES
EMAIL_TO="your-email@example.com"  # Your email address
EMAIL_FROM="certbot@kenex.org"      # From address
SMTP_SERVER="smtp.gmail.com"        # Your SMTP server (Gmail: smtp.gmail.com)
SMTP_PORT="587"                     # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=""                        # SMTP username (leave empty for system mail)
SMTP_PASS=""                        # SMTP password (leave empty for system mail)
USE_TLS="true"                      # Use TLS for SMTP

# Certificate details
CERT_NAME="$RENEWED_DOMAINS"
CERT_PATH="$RENEWED_LINEAGE"
REMAINING_DAYS=30

# Determine email subject and body based on renewal result
if [ "$RENEWED_LINEAGE" != "" ]; then
    # Renewal succeeded
    SUBJECT="✅ SSL Certificate Renewed Successfully - kenex.org"
    
    # Get certificate expiration date
    EXPIRY_DATE=$(sudo openssl x509 -in "$RENEWED_LINEAGE/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2)
    
    BODY="SSL Certificate renewal completed successfully!

Certificate: $RENEWED_DOMAINS
Certificate Path: $RENEWED_LINEAGE
Expiration Date: $EXPIRY_DATE

The certificate has been automatically renewed and nginx has been reloaded.
"
else
    # Renewal failed (this hook runs on failure too)
    SUBJECT="❌ SSL Certificate Renewal Failed - kenex.org"
    BODY="SSL Certificate renewal FAILED!

Please check the certbot logs for details:
- Log file: /var/log/letsencrypt/letsencrypt.log
- Check renewal: sudo certbot renew --dry-run

You may need to manually renew the certificates."
fi

# Function to send email using Python
send_email_python() {
    python3 << EOF
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys

try:
    # Create message
    msg = MIMEMultipart()
    msg['From'] = "$EMAIL_FROM"
    msg['To'] = "$EMAIL_TO"
    msg['Subject'] = "$SUBJECT"
    msg.attach(MIMEText("$BODY", 'plain'))
    
    # Send email
    if "$SMTP_USER" and "$SMTP_PASS":
        # Use SMTP authentication
        server = smtplib.SMTP("$SMTP_SERVER", int("$SMTP_PORT"))
        if "$USE_TLS" == "true":
            server.starttls()
        server.login("$SMTP_USER", "$SMTP_PASS")
        server.send_message(msg)
        server.quit()
    else:
        # Use system sendmail
        import subprocess
        sendmail = subprocess.Popen(["/usr/sbin/sendmail", "-t"], stdin=subprocess.PIPE)
        sendmail.communicate(msg.as_string().encode())
    
    print("Email sent successfully")
    sys.exit(0)
except Exception as e:
    print(f"Failed to send email: {e}")
    sys.exit(1)
EOF
}

# Function to send email using system mail command
send_email_system() {
    echo "$BODY" | mail -s "$SUBJECT" "$EMAIL_TO" 2>/dev/null
}

# Try to send email
if command -v python3 &> /dev/null; then
    send_email_python
elif command -v mail &> /dev/null; then
    send_email_system
else
    echo "Warning: No email method available. Install python3 or mail utilities."
    # Log to syslog as fallback
    logger -t certbot "Certificate renewal notification: $SUBJECT"
fi

# Reload nginx if renewal succeeded
if [ "$RENEWED_LINEAGE" != "" ]; then
    sudo systemctl reload nginx
    logger -t certbot "Certificate renewed for $RENEWED_DOMAINS, nginx reloaded"
fi

# Certbot renewal hook to send email notifications
# This script is called after each certificate renewal attempt

# Configuration - EDIT THESE VALUES
EMAIL_TO="your-email@example.com"  # Your email address
EMAIL_FROM="certbot@kenex.org"      # From address
SMTP_SERVER="smtp.gmail.com"        # Your SMTP server (Gmail: smtp.gmail.com)
SMTP_PORT="587"                     # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=""                        # SMTP username (leave empty for system mail)
SMTP_PASS=""                        # SMTP password (leave empty for system mail)
USE_TLS="true"                      # Use TLS for SMTP

# Certificate details
CERT_NAME="$RENEWED_DOMAINS"
CERT_PATH="$RENEWED_LINEAGE"
REMAINING_DAYS=30

# Determine email subject and body based on renewal result
if [ "$RENEWED_LINEAGE" != "" ]; then
    # Renewal succeeded
    SUBJECT="✅ SSL Certificate Renewed Successfully - kenex.org"
    
    # Get certificate expiration date
    EXPIRY_DATE=$(sudo openssl x509 -in "$RENEWED_LINEAGE/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2)
    
    BODY="SSL Certificate renewal completed successfully!

Certificate: $RENEWED_DOMAINS
Certificate Path: $RENEWED_LINEAGE
Expiration Date: $EXPIRY_DATE

The certificate has been automatically renewed and nginx has been reloaded.
"
else
    # Renewal failed (this hook runs on failure too)
    SUBJECT="❌ SSL Certificate Renewal Failed - kenex.org"
    BODY="SSL Certificate renewal FAILED!

Please check the certbot logs for details:
- Log file: /var/log/letsencrypt/letsencrypt.log
- Check renewal: sudo certbot renew --dry-run

You may need to manually renew the certificates."
fi

# Function to send email using Python
send_email_python() {
    python3 << EOF
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys

try:
    # Create message
    msg = MIMEMultipart()
    msg['From'] = "$EMAIL_FROM"
    msg['To'] = "$EMAIL_TO"
    msg['Subject'] = "$SUBJECT"
    msg.attach(MIMEText("$BODY", 'plain'))
    
    # Send email
    if "$SMTP_USER" and "$SMTP_PASS":
        # Use SMTP authentication
        server = smtplib.SMTP("$SMTP_SERVER", int("$SMTP_PORT"))
        if "$USE_TLS" == "true":
            server.starttls()
        server.login("$SMTP_USER", "$SMTP_PASS")
        server.send_message(msg)
        server.quit()
    else:
        # Use system sendmail
        import subprocess
        sendmail = subprocess.Popen(["/usr/sbin/sendmail", "-t"], stdin=subprocess.PIPE)
        sendmail.communicate(msg.as_string().encode())
    
    print("Email sent successfully")
    sys.exit(0)
except Exception as e:
    print(f"Failed to send email: {e}")
    sys.exit(1)
EOF
}

# Function to send email using system mail command
send_email_system() {
    echo "$BODY" | mail -s "$SUBJECT" "$EMAIL_TO" 2>/dev/null
}

# Try to send email
if command -v python3 &> /dev/null; then
    send_email_python
elif command -v mail &> /dev/null; then
    send_email_system
else
    echo "Warning: No email method available. Install python3 or mail utilities."
    # Log to syslog as fallback
    logger -t certbot "Certificate renewal notification: $SUBJECT"
fi

# Reload nginx if renewal succeeded
if [ "$RENEWED_LINEAGE" != "" ]; then
    sudo systemctl reload nginx
    logger -t certbot "Certificate renewed for $RENEWED_DOMAINS, nginx reloaded"
fi

