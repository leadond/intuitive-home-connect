const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Checking project setup before starting dev server...');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('node_modules not found. Running pnpm install...');
  const install = spawn('pnpm', ['install'], { stdio: 'inherit' });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.error('pnpm install failed with code', code);
      return;
    }
    startDevServer();
  });
} else {
  startDevServer();
}

function startDevServer() {
  console.log('Starting development server...');
  
  // Kill any existing Vite processes
  try {
    const ps = spawn('ps', ['aux'], { stdio: ['pipe', 'pipe', 'inherit'] });
    let output = '';
    
    ps.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ps.on('close', () => {
      const lines = output.split('\n');
      const viteProcesses = lines.filter(line => line.includes('vite') && !line.includes('grep'));
      
      viteProcesses.forEach(process => {
        const pid = process.split(/\s+/)[1];
        if (pid) {
          console.log(`Killing existing Vite process: ${pid}`);
          try {
            spawn('kill', ['-9', pid]);
          } catch (err) {
            console.error(`Failed to kill process ${pid}:`, err.message);
          }
        }
      });
      
      // Start the dev server
      const dev = spawn('pnpm', ['run', 'dev'], { stdio: 'inherit' });
      
      dev.on('error', (err) => {
        console.error('Failed to start dev server:', err.message);
      });
    });
  } catch (err) {
    console.error('Error checking for existing processes:', err.message);
    
    // Try to start the dev server anyway
    const dev = spawn('pnpm', ['run', 'dev'], { stdio: 'inherit' });
    
    dev.on('error', (err) => {
      console.error('Failed to start dev server:', err.message);
    });
  }
}
