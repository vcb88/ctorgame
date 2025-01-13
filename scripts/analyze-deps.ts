import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

function getFileDependencies(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  basePath: string
): string[] {
  const dependencies: string[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const module = node.moduleSpecifier.getText().replace(/['"]/g, '');
      if (!module.startsWith('.')) return;
      
      const resolvedPath = path.resolve(path.dirname(sourceFile.fileName), module);
      const relativePath = path.relative(basePath, resolvedPath);
      dependencies.push(relativePath);
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return dependencies;
}

function findCircularDependencies(rootPath: string): void {
  const configPath = ts.findConfigFile(
    rootPath,
    ts.sys.fileExists,
    "tsconfig.json"
  );
  
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const { options, fileNames } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(configPath)
  );

  const program = ts.createProgram(fileNames, options);
  const checker = program.getTypeChecker();

  const dependencies = new Map<string, string[]>();
  
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile && sourceFile.fileName.includes(rootPath)) {
      const relativePath = path.relative(rootPath, sourceFile.fileName);
      const fileDeps = getFileDependencies(sourceFile, checker, rootPath);
      dependencies.set(relativePath, fileDeps);
    }
  }

  // Find circular dependencies
  function findCycles(
    start: string,
    current: string,
    visited: Set<string>,
    path: string[]
  ) {
    if (visited.has(current)) {
      const cycleStart = path.indexOf(current);
      if (cycleStart !== -1) {
        console.log('Circular dependency found:');
        console.log(path.slice(cycleStart).concat(current).join(' -> '));
      }
      return;
    }

    visited.add(current);
    path.push(current);

    const deps = dependencies.get(current) || [];
    for (const dep of deps) {
      findCycles(start, dep, new Set(visited), [...path]);
    }
  }

  for (const file of dependencies.keys()) {
    findCycles(file, file, new Set(), []);
  }
}

// Анализируем server и shared директории
console.log('Analyzing server directory...');
findCircularDependencies('/tmp/ctorgame/server/src');

console.log('\nAnalyzing shared directory...');
findCircularDependencies('/tmp/ctorgame/shared');