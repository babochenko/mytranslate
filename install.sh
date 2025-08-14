#!/bin/bash
set -e

dmgfile=$(find ./dist -maxdepth 1 -type f -name "*.dmg" | head -n 1)
dmg=$(basename "$dmgfile")
appname="MyTranslate.app"

function volume() {
    hdiutil info | grep Volumes | awk '{for (i=3; i<=NF; i++) printf $i (i<NF ? OFS : ORS)}'
}

function detach() { 
    hdiutil detach "$(volume)"
}

# 1. build
npm run build-mac

# 2. attach dmg
detach || true
hdiutil attach "./dist/$dmg"

# 3. install dmg
cp -R "$(volume)/$appname" "/Applications/"
detach

