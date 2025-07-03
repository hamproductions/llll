#!/bin/bash

# This script deletes all WebM files in public/assets and its subdirectories.

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the directory to search for WebM files
TARGET_DIR="public/assets"

echo "Starting deletion of WebM files in ${TARGET_DIR}"

# Find all WebM files and delete them
# -type f: only consider files
# -name "*.webm": match files ending with .webm
# -delete: delete the found files
find "${TARGET_DIR}" -type f -name "*.webm" -delete

echo "All WebM files deletion complete."
