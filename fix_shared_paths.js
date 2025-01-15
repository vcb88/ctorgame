const fs = require('fs');
const path = require('path');

function fixPaths(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            fixPaths(fullPath);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix duplicate src paths and ensure proper formatting
            content = content.replace(
                /from\s+['"]@ctor-game\/shared\/([^'"]*)['"]/g,
                (match, importPath) => {
                    // Remove duplicate src
                    const cleanPath = importPath
                        .replace(/src\/src\//g, 'src/')
                        .replace(/^src\/+/, 'src/');
                    
                    // Ensure it starts with src/ and ends with .js
                    const finalPath = cleanPath.startsWith('src/') ? cleanPath : `src/${cleanPath}`;
                    const withJs = finalPath.endsWith('.js') ? finalPath : `${finalPath}.js`;
                    
                    return `from '@ctor-game/shared/${withJs}'`;
                }
            );
            
            fs.writeFileSync(fullPath, content);
            console.log(`Processed ${fullPath}`);
        }
    }
}

// Process server directory
fixPaths('/tmp/ctorgame/server/src');