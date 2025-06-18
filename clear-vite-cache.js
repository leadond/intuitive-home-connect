const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('Clearing Vite cache and restarting the development server...');

// Paths to clear
const pathsToClear = [
  'node_modules/.vite',
  '.vite'
];

// Clear the paths
pathsToClear.forEach(cachePath => {
  const fullPath = path.join(process.cwd(), cachePath);
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${fullPath}...`);
    try {
      // Recursive function to delete directory contents
      const deleteRecursive = (dirPath) => {
        if (fs.existsSync(dirPath)) {
          fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              // Recursive call for directories
              deleteRecursive(curPath);
              try {
                fs.rmdirSync(curPath);
              } catch (err) {
                console.error(`Error removing directory ${curPath}:`, err.message);
              }
            } else {
              // Delete file
              try {
                fs.unlinkSync(curPath);
              } catch (err) {
                console.error(`Error removing file ${curPath}:`, err.message);
              }
            }
          });
        }
      };
      
      deleteRecursive(fullPath);
      console.log(`Successfully cleared ${cachePath}`);
    } catch (err) {
      console.error(`Error clearing ${cachePath}:`, err.message);
    }
  } else {
    console.log(`${cachePath} does not exist, skipping...`);
  }
});

// Restart the development server
console.log('Starting development server with cleared cache...');
const dev = spawn('pnpm', ['run', 'dev', '--force'], { stdio: 'inherit' });

dev.on('error', (err) => {
  console.error('Failed to start dev server:', err.message);
});
