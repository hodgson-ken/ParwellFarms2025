# Automated SSL Certificate Renewal Setup

Your SSL certificates are now configured for automatic renewal with email notifications.

## Quick Setup

Run this command with your email address:

```bash
sudo /home/ken/claude-code/setup-auto-renewal.sh your-email@example.com
```

This will:
- Register your email with certbot
- Set up email notifications for successful renewals
- Configure automatic nginx reload after renewal

## How It Works

1. **Automatic Renewal**: Certbot runs twice daily and attempts renewal when certificates are within 30 days of expiring
2. **Email on Success**: You'll receive an email when certificates are successfully renewed
3. **Email on Failure**: Certbot will email you if renewal fails (via built-in certbot notifications)
4. **Auto Reload**: Nginx automatically reloads with new certificates

## Email Setup Options

### Option 1: System Mail (Simplest)
If your server has `mail` command configured, emails will work automatically.

### Option 2: Gmail SMTP (Recommended)
If you want to use Gmail:

1. Create a Gmail App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Generate an app password for "Mail"
   - Copy the 16-character password

2. Edit the hook script:
   ```bash
   sudo nano /etc/letsencrypt/renewal-hooks/deploy/email-on-success.sh
   ```
   
   Uncomment and set these variables:
   ```bash
   SMTP_SERVER="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-16-char-app-password"
   ```

### Option 3: Other SMTP Providers
Similar to Gmail, just adjust SMTP_SERVER and SMTP_PORT for your provider.

## Testing

Test the renewal system:
```bash
# Dry run (doesn't actually renew, just tests)
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates

# Check when next renewal will run
systemctl list-timers | grep certbot
```

## Manual Renewal (if needed)

If automatic renewal fails:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Current Certificates

Your certificates:
- **kenex.org** - Covers: kenex.org, kindoo.kenex.org, signups.kenex.org
- Expires: ~90 days from issuance
- Auto-renews: ~30 days before expiration

## Troubleshooting

**Check renewal logs:**
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

**Check if timer is active:**
```bash
sudo systemctl status snap.certbot.renew.timer
```

**Force renewal test:**
```bash
sudo certbot renew --force-renewal
```


Your SSL certificates are now configured for automatic renewal with email notifications.

## Quick Setup

Run this command with your email address:

```bash
sudo /home/ken/claude-code/setup-auto-renewal.sh your-email@example.com
```

This will:
- Register your email with certbot
- Set up email notifications for successful renewals
- Configure automatic nginx reload after renewal

## How It Works

1. **Automatic Renewal**: Certbot runs twice daily and attempts renewal when certificates are within 30 days of expiring
2. **Email on Success**: You'll receive an email when certificates are successfully renewed
3. **Email on Failure**: Certbot will email you if renewal fails (via built-in certbot notifications)
4. **Auto Reload**: Nginx automatically reloads with new certificates

## Email Setup Options

### Option 1: System Mail (Simplest)
If your server has `mail` command configured, emails will work automatically.

### Option 2: Gmail SMTP (Recommended)
If you want to use Gmail:

1. Create a Gmail App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Generate an app password for "Mail"
   - Copy the 16-character password

2. Edit the hook script:
   ```bash
   sudo nano /etc/letsencrypt/renewal-hooks/deploy/email-on-success.sh
   ```
   
   Uncomment and set these variables:
   ```bash
   SMTP_SERVER="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-16-char-app-password"
   ```

### Option 3: Other SMTP Providers
Similar to Gmail, just adjust SMTP_SERVER and SMTP_PORT for your provider.

## Testing

Test the renewal system:
```bash
# Dry run (doesn't actually renew, just tests)
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates

# Check when next renewal will run
systemctl list-timers | grep certbot
```

## Manual Renewal (if needed)

If automatic renewal fails:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Current Certificates

Your certificates:
- **kenex.org** - Covers: kenex.org, kindoo.kenex.org, signups.kenex.org
- Expires: ~90 days from issuance
- Auto-renews: ~30 days before expiration

## Troubleshooting

**Check renewal logs:**
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

**Check if timer is active:**
```bash
sudo systemctl status snap.certbot.renew.timer
```

**Force renewal test:**
```bash
sudo certbot renew --force-renewal
```


Your SSL certificates are now configured for automatic renewal with email notifications.

## Quick Setup

Run this command with your email address:

```bash
sudo /home/ken/claude-code/setup-auto-renewal.sh your-email@example.com
```

This will:
- Register your email with certbot
- Set up email notifications for successful renewals
- Configure automatic nginx reload after renewal

## How It Works

1. **Automatic Renewal**: Certbot runs twice daily and attempts renewal when certificates are within 30 days of expiring
2. **Email on Success**: You'll receive an email when certificates are successfully renewed
3. **Email on Failure**: Certbot will email you if renewal fails (via built-in certbot notifications)
4. **Auto Reload**: Nginx automatically reloads with new certificates

## Email Setup Options

### Option 1: System Mail (Simplest)
If your server has `mail` command configured, emails will work automatically.

### Option 2: Gmail SMTP (Recommended)
If you want to use Gmail:

1. Create a Gmail App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Generate an app password for "Mail"
   - Copy the 16-character password

2. Edit the hook script:
   ```bash
   sudo nano /etc/letsencrypt/renewal-hooks/deploy/email-on-success.sh
   ```
   
   Uncomment and set these variables:
   ```bash
   SMTP_SERVER="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-16-char-app-password"
   ```

### Option 3: Other SMTP Providers
Similar to Gmail, just adjust SMTP_SERVER and SMTP_PORT for your provider.

## Testing

Test the renewal system:
```bash
# Dry run (doesn't actually renew, just tests)
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates

# Check when next renewal will run
systemctl list-timers | grep certbot
```

## Manual Renewal (if needed)

If automatic renewal fails:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Current Certificates

Your certificates:
- **kenex.org** - Covers: kenex.org, kindoo.kenex.org, signups.kenex.org
- Expires: ~90 days from issuance
- Auto-renews: ~30 days before expiration

## Troubleshooting

**Check renewal logs:**
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

**Check if timer is active:**
```bash
sudo systemctl status snap.certbot.renew.timer
```

**Force renewal test:**
```bash
sudo certbot renew --force-renewal
```

