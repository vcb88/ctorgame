import madge from 'madge';

async function analyzeDependencies() {
  try {
    const serverResult = await madge(['./server/src', './shared/src'], {
      fileExtensions: ['ts', 'tsx'],
      tsConfig: './tsconfig.json',
      includeNpm: false,
      detectiveOptions: {
        ts: {
          skipTypeImports: false
        }
      }
    });

    // Find circular dependencies
    const circular = serverResult.circular();
    if (circular.length) {
      console.log('\nCircular dependencies found:');
      circular.forEach(path => {
        console.log(path.join(' -> '));
      });
    }

    // Generate graph
    await serverResult.image('dependency-graph-full.svg', {
      layout: 'dot',
      rankdir: 'TB',
      fontname: 'Arial',
      nodeStyle: {
        shape: 'box',
        fillcolor: '#EFEFEF'
      }
    });

  } catch (error) {
    console.error('Error analyzing dependencies:', error);
  }
}

analyzeDependencies();