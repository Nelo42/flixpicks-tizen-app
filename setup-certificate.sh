#!/bin/bash
# FlixPicks Tizen TV App - Certificate Setup Helper
# Guides through certificate creation process

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=== FlixPicks Tizen Certificate Setup ===${NC}\n"

# Check if Tizen Studio is installed
if [ ! -f ~/tizen-studio/tools/certificate-manager/certificate-manager ]; then
    echo -e "${YELLOW}Tizen Studio not found at ~/tizen-studio${NC}"
    echo "Please install Tizen Studio first:"
    echo "  https://developer.tizen.org/tizen-studio/download"
    exit 1
fi

echo -e "${BLUE}Certificate Manager will open in a new window.${NC}"
echo ""
echo "Follow these steps:"
echo ""
echo -e "${YELLOW}1. Create New Certificate Profile${NC}"
echo "   - Click the '+' button"
echo "   - Profile name: FlixPicksTV"
echo "   - Select 'TV' as platform"
echo ""
echo -e "${YELLOW}2. Create Author Certificate${NC}"
echo "   - Click 'Create' next to Author Certificate"
echo "   - Enter password (save this!)"
echo "   - Fill in your information"
echo "   - Click 'Next' → 'Create'"
echo ""
echo -e "${YELLOW}3. Create Distributor Certificate${NC}"
echo "   - Select 'Samsung' as certificate type"
echo "   - Click 'Get Certificate'"
echo "   - Sign in with your Samsung Developer account"
echo "     (Create free account at: https://developer.samsung.com/)"
echo "   - Select 'Partner' privilege level (for testing)"
echo "   - Click 'Next' → 'Create'"
echo ""
echo -e "${YELLOW}4. Save Profile${NC}"
echo "   - Click 'OK' to save the certificate profile"
echo ""
echo -e "${GREEN}Once complete, you can build the app with: ./build.sh${NC}"
echo ""

# Launch Certificate Manager
~/tizen-studio/tools/certificate-manager/certificate-manager &

echo "Certificate Manager launched!"
echo "Follow the steps above, then run: ./build.sh"

