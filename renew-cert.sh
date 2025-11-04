#!/bin/bash
# Script to renew certificates using DNS validation

echo "=========================================="
echo "Certificate Renewal with DNS Validation"
echo "=========================================="
echo ""
echo "This script will guide you through renewing your certificates."
echo "You'll need to add DNS TXT records when prompted."
echo ""

# Function to renew a certificate
renew_cert() {
    local CERT_NAME=$1
    local DOMAINS=$2
    
    echo "Renewing certificate: $CERT_NAME"
    echo "Domains: $DOMAINS"
    echo ""
    
    sudo certbot certonly --manual --preferred-challenges dns \
        $DOMAINS \
        --cert-name "$CERT_NAME" \
        --agree-tos
    
    if [ $? -eq 0 ]; then
        echo "✓ Successfully renewed $CERT_NAME"
        echo ""
        return 0
    else
        echo "✗ Failed to renew $CERT_NAME"
        echo ""
        return 1
    fi
}

# Renew kindoo.kenex.org (non-wildcard)
echo "Step 1: Renewing kindoo.kenex.org..."
renew_cert "kindoo.kenex.org" "-d kindoo.kenex.org -d kenex.org"

# Renew kenex.org (wildcard)
echo "Step 2: Renewing kenex.org (wildcard)..."
renew_cert "kenex.org" "-d *.kenex.org -d kenex.org"

echo "=========================================="
echo "Certificate renewal complete!"
echo "=========================================="
echo ""
echo "To reload nginx with new certificates, run:"
echo "  sudo systemctl reload nginx"
echo ""

