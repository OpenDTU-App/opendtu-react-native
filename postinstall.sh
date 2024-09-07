#!/bin/bash
if command -v pod &> /dev/null; then
  (cd ios && pod install)
else
  echo "pod command not found. Skipping pod install."
fi
