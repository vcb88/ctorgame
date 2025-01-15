const fs = require('fs');
const path = require('path');

function updateSharedImports(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            updateSharedImports(fullPath);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Replace @ctor-game/shared imports to include /src/ and .js
            content = content.replace(
                /from\s+['"]@ctor-game\/shared\/(.*?)['"]/g,
                (match, importPath) => {
                    if (!importPath.includes('/src/') && !importPath.endsWith('.js')) {
                        return `from '@ctor-game/shared/src/${importPath}.js'`;
                    } else if (!importPath.endsWith('.js')) {
                        return `from '@ctor-game/shared/${importPath}.js'`;
                    }
                    return match;
                }
            );
            
            fs.writeFileSync(fullPath, content);
            console.log(`Processed ${fullPath}`);
        }
    }
}

// Process server directory
updateSharedImports('/tmp/ctorgame/server/src');