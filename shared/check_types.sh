#!/bin/bash

echo "Cleaning up..."
rm -rf dist tsconfig.tsbuildinfo

echo "Testing compilation with minimal config..."
node_modules/.bin/tsc --project tsconfig.minimal.json

if [ $? -eq 0 ]; then
    echo "Base types compilation successful"
else
    echo "Base types compilation failed"
    exit 1
fi