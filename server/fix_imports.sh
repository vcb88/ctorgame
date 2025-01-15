#!/bin/bash

# This script updates import statements
find src -type f -name "*.ts" -exec sed -i 's/\(@ctor-game\/shared\/.*\)\.js/\1/g' {} \;
find src -type f -name "*.ts" -exec sed -i 's/\(\.\/.*\)\.js/\1/g' {} \;