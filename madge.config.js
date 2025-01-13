module.exports = {
  fileExtensions: ['ts', 'tsx'],
  tsConfig: './tsconfig.json',
  detectiveOptions: {
    ts: {
      skipTypeImports: true
    }
  },
  excludeRegExp: [
    /\.test\.ts$/,
    /\.spec\.ts$/,
    /\.e2e-spec\.ts$/,
    /\.d\.ts$/,
    /node_modules/
  ]
};