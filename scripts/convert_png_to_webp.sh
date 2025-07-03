#!/bin/bash

# This script converts all PNG files in public/assets to WebP format.
# It uses ffmpeg, which must be installed and available in your PATH.

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the source directory for PNGs
SOURCE_DIR="public/assets"

echo "Starting PNG to WebP conversion in ${SOURCE_DIR}"

# Find all PNG files and execute ffmpeg for each.
# -exec: executes the command for each found file.
# {}: placeholder for the current file path.
# \;: terminates the -exec command.
find "${SOURCE_DIR}" -type f -name "*.png" -exec bash -c ' 
  png_file="$1"
  webp_file="${png_file%.png}.webp"

  echo "Converting \"${png_file}\" to \"${webp_file}\""

  # Convert PNG to WebP using ffmpeg
  # -i: input file
  # -q:v 85: quality setting for WebP (0-100, 85 is a good balance)
  ffmpeg -i "${png_file}" -q:v 85 "${webp_file}"

  echo "Finished converting \"${png_file}\""

  # Delete the original PNG file
  rm "${png_file}"
  echo "Deleted original \"${png_file}\""
' _ {} \;

echo "All PNG to WebP conversions complete."
