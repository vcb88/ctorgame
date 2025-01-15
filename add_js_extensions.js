const fs = require('fs');
const path = require('path');

function addJsExtensions(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            addJsExtensions(fullPath);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Replace local imports without .js extension
            content = content.replace(
                /from\s+['"](\.[^'"]*)['"]/g,
                (match, importPath) => {
                    if (!importPath.endsWith('.js')) {
                        return `from '${importPath}.js'`;
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
addJsExtensions('/tmp/ctorgame/server/src');