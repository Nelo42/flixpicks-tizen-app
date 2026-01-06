#!/bin/bash
# FlixPicks Tizen TV App - Build Script
# Builds the app for deployment to Samsung TV

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${PROJECT_DIR}/.buildResult"
CERT_PROFILE="FlixPicksTV"  # Change this to your certificate profile name
APP_ID="net.flixpicks.tv"
PACKAGE_NAME="FlixPicksTV"

echo -e "${GREEN}=== FlixPicks Tizen TV App Build ===${NC}\n"

# Check if Tizen Studio is installed
if ! command -v tizen &> /dev/null; then
    echo -e "${RED}Error: Tizen CLI not found!${NC}"
    echo "Please install Tizen Studio and add it to your PATH:"
    echo "  export PATH=\$PATH:~/tizen-studio/tools/ide/bin"
    exit 1
fi

echo -e "${YELLOW}1. Checking Tizen installation...${NC}"
tizen version
echo ""

# Check for icon file - Tizen requires PNG (80x80 minimum)
if [ ! -f "${PROJECT_DIR}/icon.png" ]; then
    echo -e "${YELLOW}Creating icon.png (required by Tizen)...${NC}"
    
    # Try ImageMagick first
    if command -v convert &> /dev/null; then
        convert -size 80x80 xc:#3B82F6 \
            -fill white -font Arial-Bold -pointsize 36 -gravity center \
            -annotate +0+0 "FP" \
            "${PROJECT_DIR}/icon.png"
        echo -e "${GREEN}✓ Icon created with ImageMagick${NC}"
    # Try Python with PIL/Pillow
    elif command -v python3 &> /dev/null && python3 -c "from PIL import Image, ImageDraw, ImageFont" 2>/dev/null; then
        python3 << 'PYTHON_SCRIPT'
from PIL import Image, ImageDraw, ImageFont
img = Image.new('RGB', (80, 80), color='#3B82F6')
draw = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 36)
except:
    font = ImageFont.load_default()
text = "FP"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
x = (80 - text_width) / 2
y = (80 - text_height) / 2
draw.text((x, y), text, fill='white', font=font)
img.save('icon.png')
PYTHON_SCRIPT
        echo -e "${GREEN}✓ Icon created with Python${NC}"
    else
        echo -e "${RED}Error: Cannot create icon.png${NC}"
        echo "Please install ImageMagick or Python PIL/Pillow, or create icon.png manually (80x80 PNG)"
        echo ""
        echo "Quick fix: Create a simple 80x80 blue square with 'FP' text"
        exit 1
    fi
fi

# Verify icon exists
if [ ! -f "${PROJECT_DIR}/icon.png" ]; then
    echo -e "${RED}Error: icon.png not found after creation attempt${NC}"
    exit 1
fi

# Clean previous build
echo -e "${YELLOW}2. Cleaning previous build...${NC}"
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"
echo ""

# Build the web app
echo -e "${YELLOW}3. Building web app...${NC}"
cd "${PROJECT_DIR}"
tizen build-web -out "${BUILD_DIR}" 2>&1 | tee "${BUILD_DIR}/build.log"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}Build failed! Check ${BUILD_DIR}/build.log for details.${NC}"
    exit 1
fi
echo ""

# Package the app
echo -e "${YELLOW}4. Packaging app...${NC}"
tizen package -t wgt -s "${CERT_PROFILE}" -- "${BUILD_DIR}" 2>&1 | tee -a "${BUILD_DIR}/build.log"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}Packaging failed!${NC}"
    echo -e "${YELLOW}Make sure you have created a certificate profile named '${CERT_PROFILE}'${NC}"
    echo "Run: ~/tizen-studio/tools/certificate-manager/certificate-manager"
    exit 1
fi
echo ""

# Find the generated WGT file
WGT_FILE=$(find "${BUILD_DIR}" -name "*.wgt" -type f | head -1)

if [ -z "${WGT_FILE}" ]; then
    echo -e "${RED}Error: WGT file not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful!${NC}"
echo -e "${GREEN}WGT file: ${WGT_FILE}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Connect to your TV: ~/tizen-studio/tools/sdb connect <TV_IP>:26101"
echo "2. Install app: tizen install -n ${WGT_FILE} -t <TV_IP>:26101"
echo "3. Run app: tizen run -p ${APP_ID} -t <TV_IP>:26101"
echo ""
echo "Or use the deploy.sh script: ./deploy.sh <TV_IP>"

