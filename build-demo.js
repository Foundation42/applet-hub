#!/usr/bin/env bun

// Simple script to build the demo

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configure directories to build
const modulesToBuild = [
  'src/ui-components',
  'src/admin-dashboard',
];

// Make sure directories exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Build each module
modulesToBuild.forEach(modulePath => {
  const outputPath = path.join('dist', path.basename(modulePath));
  
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  console.log(`Building ${modulePath}...`);
  
  // Use bun to build the module
  const buildProcess = spawn('bun', [
    'build', 
    modulePath, 
    '--outdir', 
    outputPath,
    '--target', 
    'browser'
  ]);
  
  buildProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  buildProcess.stderr.on('data', (data) => {
    console.error(`${data}`);
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`Successfully built ${modulePath}`);
    } else {
      console.error(`Error building ${modulePath}, code: ${code}`);
    }
  });
});

// Copy HTML demo file
fs.copyFileSync('demo.html', 'dist/index.html');

console.log('Build completed. Run a local server in the dist directory to view the demo.');