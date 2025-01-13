#!/usr/bin/env python3
import os
import re
import sys
from pathlib import Path

def process_file(file_path):
    print(f"Processing {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern for import statements with relative paths
    pattern = r'''(import\s+(?:type\s+)?(?:[^"']*)\s+from\s+['"])(\.[^"']+)(['"])'''
    
    def add_js_extension(match):
        prefix, path, suffix = match.groups()
        if not path.endswith('.js'):
            path = path + '.js'
        return f"{prefix}{path}{suffix}"
    
    # Replace imports
    new_content = re.sub(pattern, add_js_extension, content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated imports in {file_path}")

def main():
    script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    src_dir = script_dir.parent / 'src'
    
    for file_path in src_dir.rglob('*.ts'):
        if 'node_modules' not in str(file_path):
            process_file(file_path)

if __name__ == '__main__':
    main()