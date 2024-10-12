#!/bin/bash
if command -v pod &> /dev/null; then
  (yarn pod-install)
else
  echo "pod command not found. Skipping pod install."
fi
