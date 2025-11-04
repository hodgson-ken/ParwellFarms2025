# UniFi Mobile App - Firewall Configuration for Let's Encrypt

Your server's gateway is `192.168.88.1` (likely your UniFi router/gateway).

## Option 1: Temporarily Disable Firewall (Quick but less secure)

1. **Open UniFi Mobile App:**
   - Launch the UniFi app on your phone/tablet
   - Make sure you're connected to your network or have remote access

2. **Navigate to Your Gateway/Router:**
   - Tap on your gateway/router device (should show as "Gateway" or "Router")
   - If you see multiple devices, look for the one with IP `192.168.88.1`

3. **Find Firewall Settings:**
   - Tap **Settings** or the gear icon
   - Look for **Firewall** or **Security** section
   - In newer app versions: Go to **Internet** → **Firewall & Security**
   - In older versions: Look under **Advanced** or **Traffic Management**

4. **Disable Firewall (temporarily):**
   - Find **Enable Firewall** or **Threat Management** toggle
   - Turn it **OFF**
   - Tap **Apply** or **Save** (top right corner)
   - Wait for changes to apply (you may see a confirmation message)

5. **Renew Certificates:**
   - Once firewall is disabled, let me know and I'll run:
     - `sudo certbot renew`
     - `sudo systemctl reload nginx`

6. **Re-enable Firewall:**
   - Go back to the same settings
   - Turn firewall **ON** again
   - Tap **Apply** or **Save**

## Option 2: Create Port 80 Allow Rule (Recommended - More Secure)

Instead of disabling the firewall, create a rule to allow inbound port 80:

1. **Open UniFi Mobile App:**
   - Launch the app and select your gateway/router

2. **Navigate to Firewall Rules:**
   - Tap **Settings** or gear icon
   - Look for **Firewall Rules** or **Traffic Rules**
   - May be under **Internet** → **Firewall & Security** → **Firewall Rules**

3. **Create New Rule:**
   - Tap **+** (plus icon) or **Add Rule** or **Create Rule**
   - If you don't see this option, you may need to use the web interface for advanced rules

4. **Configure the Rule:**
   - **Name**: `Allow Port 80` or `Cert Renewal`
   - **Action**: `Accept` or `Allow`
   - **Protocol**: `TCP`
   - **Source**: Select `Any` or `All` (for simplicity)
   - **Destination Port**: `80`
   - **Destination IP**: Your server's internal IP: `192.168.88.22`
   - **Rule Position**: Set to `Top` or `Before other rules` (important!)

5. **Save the Rule:**
   - Tap **Save** or **Apply** (top right)
   - Wait for confirmation

6. **Renew Certificates:**
   - Once the rule is saved, let me know and I'll renew the certificates

## Option 3: Port Forwarding (If behind NAT)

If your server needs port forwarding (most common):

1. **Navigate to Port Forwarding:**
   - In UniFi app, go to **Settings**
   - Look for **Port Forwarding** or **Port Forwarding Rules**
   - May be under **Internet** → **Advanced** → **Port Forwarding**

2. **Create Port Forward:**
   - Tap **+** or **Add Port Forward**
   - **Name**: `HTTP Cert Renewal`
   - **Port Range**: `80` (or `80-80`)
   - **Forward IP**: `192.168.88.22` (your server's internal IP)
   - **Forward Port**: `80`
   - **Protocol**: `TCP`
   - Tap **Save** or **Apply**

3. **Renew Certificates:**
   - After port forward is active, let me know and I'll renew

## Troubleshooting App Navigation

If you can't find firewall settings in the mobile app:

- **New UniFi App (current):**
  - Bottom navigation: Tap **Internet** tab
  - Scroll to **Firewall & Security** section
  
- **Older UniFi App:**
  - Tap **Devices** → Select your gateway
  - Tap **Settings** → Look for **Firewall** or **Advanced**

- **If settings are limited in app:**
  - Some advanced firewall features may only be in the web interface
  - You may need to use a browser to access `https://192.168.88.1` or your UniFi controller URL
  - Or use **Port Forwarding** (Option 3) which is usually available in the app

## After Renewal

Once certificates are renewed:
- **Option 1**: Re-enable the firewall in the app
- **Option 2**: Keep the rule (it only affects port 80) or remove it if desired
- **Option 3**: Keep port forwarding if you want HTTP access, or remove it after renewal

## Quick Reference

- **Your Server IP**: `192.168.88.22` (internal), `162.245.89.28` (public)
- **Your Gateway**: `192.168.88.1`
- **Port Needed**: `80` (HTTP for Let's Encrypt validation)

