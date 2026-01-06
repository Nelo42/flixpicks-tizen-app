#!/bin/bash
# FlixPicks Tizen TV App - Deployment Script
# Deploys the app to a Samsung TV device

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${PROJECT_DIR}/.buildResult"
APP_ID="net.flixpicks.tv"
SDB_PORT="26101"

# Check for TV IP argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: TV IP address required${NC}"
    echo ""
    echo "Usage: $0 <TV_IP_ADDRESS>"
    echo ""
    echo "Example: $0 192.168.1.50"
    echo ""
    echo "To find your TV IP:"
    echo "  1. On TV: Settings → General → External Device Manager → Device Connection Manager"
    echo "  2. Or check your router's connected devices list"
    exit 1
fi

TV_IP="$1"
TARGET="${TV_IP}:${SDB_PORT}"

echo -e "${GREEN}=== FlixPicks Tizen TV App Deployment ===${NC}\n"

# Check if SDB is available
if ! command -v sdb &> /dev/null; then
    if [ -f ~/tizen-studio/tools/sdb ]; then
        SDB=~/tizen-studio/tools/sdb
    else
        echo -e "${RED}Error: SDB not found!${NC}"
        echo "Please install Tizen Studio and add SDB to your PATH"
        exit 1
    fi
else
    SDB=sdb
fi

# Check if WGT file exists
WGT_FILE=$(find "${BUILD_DIR}" -name "*.wgt" -type f | head -1)

if [ -z "${WGT_FILE}" ]; then
    echo -e "${YELLOW}No WGT file found. Building first...${NC}\n"
    "${PROJECT_DIR}/build.sh"
    WGT_FILE=$(find "${BUILD_DIR}" -name "*.wgt" -type f | head -1)
    
    if [ -z "${WGT_FILE}" ]; then
        echo -e "${RED}Build failed! Cannot deploy.${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}WGT file: ${WGT_FILE}${NC}\n"

# Connect to TV
echo -e "${YELLOW}1. Connecting to TV at ${TV_IP}...${NC}"
${SDB} connect ${TARGET} 2>&1 || {
    echo -e "${RED}Failed to connect to TV!${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Ensure TV is in Developer Mode:"
    echo "     - Press: 1 2 3 4 5 on remote (in Apps menu)"
    echo "     - Or: Settings → General → System Manager → Developer Mode"
    echo "  2. Verify TV IP address is correct"
    echo "  3. Ensure TV and PC are on same network"
    echo "  4. Check firewall allows port ${SDB_PORT}"
    exit 1
}

# Wait a moment for connection
sleep 2

# Verify connection
echo -e "${YELLOW}2. Verifying connection...${NC}"
DEVICES=$(${SDB} devices 2>&1)
if ! echo "${DEVICES}" | grep -q "${TV_IP}"; then
    echo -e "${RED}TV not found in connected devices!${NC}"
    echo "${DEVICES}"
    exit 1
fi

echo -e "${GREEN}✓ Connected to TV${NC}"
echo ""

# Uninstall existing app (if present)
echo -e "${YELLOW}3. Checking for existing installation...${NC}"
if ${SDB} shell 0 "pkgcmd -l" 2>/dev/null | grep -q "${APP_ID}"; then
    echo -e "${YELLOW}Uninstalling existing app...${NC}"
    ${SDB} shell 0 "pkgcmd -u -n ${APP_ID}" 2>/dev/null || true
    sleep 1
fi

# Install app
echo -e "${YELLOW}4. Installing app...${NC}"
${SDB} install "${WGT_FILE}" 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}Installation failed!${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Certificate profile not set correctly"
    echo "  - TV not in Developer Mode"
    echo "  - App already installed with different certificate"
    echo ""
    echo "Try: ${SDB} shell 0 \"pkgcmd -u -n ${APP_ID}\" to uninstall first"
    exit 1
fi

echo -e "${GREEN}✓ App installed successfully${NC}"
echo ""

# Run app
echo -e "${YELLOW}5. Launching app...${NC}"
${SDB} shell 0 "app_launcher -s ${APP_ID}" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ App launched${NC}"
else
    echo -e "${YELLOW}Note: App may have launched but command returned error${NC}"
fi

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "The app should now be running on your TV!"
echo ""
echo "Useful commands:"
echo "  View logs: ${SDB} logcat"
echo "  Debug: tizen debug -p ${APP_ID} -t ${TARGET}"
echo "  Uninstall: ${SDB} shell 0 \"pkgcmd -u -n ${APP_ID}\""
echo "  List apps: ${SDB} shell 0 \"pkgcmd -l\""

