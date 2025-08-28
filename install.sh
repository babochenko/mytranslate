#!/bin/bash
set -e

appname="MyTranslate.app"

# 1. build
npm run build-mac

# 2. remove old app if exists
rm -rf "/Applications/$appname"

# 3. extract and install from zip
zipfile=$(find ./dist -maxdepth 1 -type f -name "*-mac.zip" | head -n 1)
zip=$(basename "$zipfile")

cd ./dist
unzip -o "$zip"
cp -R "$appname" "/Applications/"
rm -rf "$appname"

