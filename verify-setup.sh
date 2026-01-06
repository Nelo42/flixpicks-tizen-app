#!/bin/bash
# FlixPicks Tizen TV App - Setup Verification Script
# Verifies that the development environment is ready

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== FlixPicks Tizen Setup Verification ===${NC}\n"

ERRORS=0
WARNINGS=0

# Check Tizen Studio
echo -e "${YELLOW}Checking Tizen Studio...${NC}"
if command -v tizen &> /dev/null; then
    TIZEN_VERSION=$(tizen version 2>&1 | head -1)
    echo -e "${GREEN}✓ Tizen CLI found: ${TIZEN_VERSION}${NC}"
else
    if [ -f ~/tizen-studio/tools/ide/bin/tizen ]; then
        echo -e "${YELLOW}⚠ Tizen CLI found but not in PATH${NC}"
        echo "   Add to PATH: export PATH=\$PATH:~/tizen-studio/tools/ide/bin"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}✗ Tizen CLI not found${NC}"
        echo "   Install Tizen Studio: https://developer.tizen.org/tizen-studio/download"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check SDB
echo -e "\n${YELLOW}Checking SDB (Smart Development Bridge)...${NC}"
if command -v sdb &> /dev/null; then
    SDB_VERSION=$(sdb version 2>&1 | head -1)
    echo -e "${GREEN}✓ SDB found: ${SDB_VERSION}${NC}"
elif [ -f ~/tizen-studio/tools/sdb ]; then
    echo -e "${YELLOW}⚠ SDB found but not in PATH${NC}"
    echo "   Add to PATH: export PATH=\$PATH:~/tizen-studio/tools"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${RED}✗ SDB not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Java
echo -e "\n${YELLOW}Checking Java...${NC}"
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -1)
    echo -e "${GREEN}✓ Java found: ${JAVA_VERSION}${NC}"
else
    echo -e "${RED}✗ Java not found${NC}"
    echo "   Install: sudo apt install openjdk-11-jdk"
    ERRORS=$((ERRORS + 1))
fi

# Check certificate
echo -e "\n${YELLOW}Checking certificate profile...${NC}"
if [ -d ~/.tizen-studio-data/profile ]; then
    CERT_COUNT=$(ls -1 ~/.tizen-studio-data/profile/*.p12 2>/dev/null | wc -l)
    if [ "$CERT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Certificate files found (${CERT_COUNT})${NC}"
        
        # Check for FlixPicksTV profile
        if grep -q "FlixPicksTV" ~/.tizen-studio-data/profile/profiles.xml 2>/dev/null; then
            echo -e "${GREEN}✓ FlixPicksTV certificate profile found${NC}"
        else
            echo -e "${YELLOW}⚠ FlixPicksTV profile not found${NC}"
            echo "   Run: ./setup-certificate.sh"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${YELLOW}⚠ No certificate files found${NC}"
        echo "   Run: ./setup-certificate.sh"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ Certificate directory not found${NC}"
    echo "   Run: ./setup-certificate.sh"
    WARNINGS=$((WARNINGS + 1))
fi

# Check project files
echo -e "\n${YELLOW}Checking project files...${NC}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "${PROJECT_DIR}/config.xml" ]; then
    echo -e "${GREEN}✓ config.xml found${NC}"
else
    echo -e "${RED}✗ config.xml not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "${PROJECT_DIR}/index.html" ]; then
    echo -e "${GREEN}✓ index.html found${NC}"
else
    echo -e "${RED}✗ index.html not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "${PROJECT_DIR}/icon.png" ]; then
    echo -e "${GREEN}✓ icon.png found${NC}"
else
    echo -e "${YELLOW}⚠ icon.png not found (will be created during build)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check required directories
echo -e "\n${YELLOW}Checking project structure...${NC}"
REQUIRED_DIRS=("js" "css" "assets")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "${PROJECT_DIR}/${dir}" ]; then
        echo -e "${GREEN}✓ ${dir}/ directory exists${NC}"
    else
        echo -e "${RED}✗ ${dir}/ directory missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Summary
echo -e "\n${BLUE}=== Verification Summary ===${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready to build.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. ./build.sh"
    echo "  2. ./deploy.sh <TV_IP>"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
    echo "You can proceed, but some features may not work."
    exit 0
else
    echo -e "${RED}✗ ${ERRORS} error(s) found, ${WARNINGS} warning(s)${NC}"
    echo "Please fix the errors before building."
    exit 1
fi

