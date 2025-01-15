const fs = require('fs');
const path = require('path');

function fixImports(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            fixImports(fullPath);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Remove src/ from imports and fix paths
            content = content.replace(
                /from\s+['"]@ctor-game\/shared\/([^'"]*)['"]/g,
                (match, importPath) => {
                    // Remove src/ from path
                    const cleanPath = importPath
                        .replace(/src\//g, '')
                        .replace(/\.js$/, '');
                    
                    return `from '@ctor-game/shared/${cleanPath}'`;
                }
            );
            
            fs.writeFileSync(fullPath, content);
            console.log(`Processed ${fullPath}`);
        }
    }
}

// Process server directory
fixImports('/tmp/ctorgame/server/src');