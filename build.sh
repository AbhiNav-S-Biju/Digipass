#!/bin/bash
set -o errexit

echo "Installing Python dependencies..."

# Check if python3 is available
if command -v python3 &> /dev/null; then
    echo "Python3 found, installing requirements..."
    python3 -m pip install --upgrade pip
    python3 -m pip install -r requirements.txt
    echo "Python dependencies installed successfully"
else
    echo "Warning: Python3 not found, skipping Python dependency installation"
fi

echo "Build completed"
