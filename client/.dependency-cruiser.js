/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  extends: '../.dependency-cruiser.js',
  options: {
    baseDir: '.',
    tsConfig: {
      fileName: './tsconfig.json'
    }
  }
};