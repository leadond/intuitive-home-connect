const fs = require('fs');
const path = require('path');

// Function to search for files recursively with multiple search patterns
function searchCodebase(dir, extensions, searchPatterns) {
  const results = {};
  
  // Initialize results for each pattern
  searchPatterns.forEach(pattern => {
    results[pattern] = [];
  });
  
  function searchDir(currentDir) {
    try {
      const files = fs.readdirSync(currentDir);
      
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        
        try {
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            searchDir(filePath);
          } else if (extensions.some(ext => file.endsWith(ext))) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check each pattern
            searchPatterns.forEach(pattern => {
              if (content.toLowerCase().includes(pattern.toLowerCase())) {
                results[pattern].push({
                  path: filePath,
                  // Find lines containing the pattern
                  lines: content.split('\n')
                    .map((line, index) => {
                      if (line.toLowerCase().includes(pattern.toLowerCase())) {
                        return { number: index + 1, content: line.trim() };
                      }
                      return null;
                    })
                    .filter(Boolean)
                });
              }
            });
          }
        } catch (err) {
          console.error(`Error processing file ${filePath}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${currentDir}:`, err.message);
    }
  }
  
  searchDir(dir);
  return results;
}

// Search patterns
const searchPatterns = [
  'DeviceControl', 
  'device-control',
  'renderDevice',
  'deviceRenderer',
  'GarageDoorControl',
  'import.*GarageDoorControl',
  'DoorOpen',
  'DoorClosed',
  'Door'
];

const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];
const searchDir = 'src';

console.log('Searching codebase for important patterns...');
const results = searchCodebase(searchDir, fileExtensions, searchPatterns);

// Display results
console.log('\n=== SEARCH RESULTS ===\n');
Object.entries(results).forEach(([pattern, files]) => {
  console.log(`\n## Pattern: "${pattern}" - Found in ${files.length} files\n`);
  
  files.forEach(file => {
    console.log(`File: ${file.path}`);
    console.log('Matching lines:');
    file.lines.slice(0, 5).forEach(line => {
      console.log(`  Line ${line.number}: ${line.content.substring(0, 120)}${line.content.length > 120 ? '...' : ''}`);
    });
    
    if (file.lines.length > 5) {
      console.log(`  ... and ${file.lines.length - 5} more matches`);
    }
    console.log('');
  });
});

// Check for potential issues in the codebase
console.log('\n=== POTENTIAL ISSUES ===\n');

// Check for missing imports
const doorIconsFile = path.join(searchDir, 'components/icons/DoorIcons.tsx');
if (fs.existsSync(doorIconsFile)) {
  console.log('✅ DoorIcons.tsx file exists');
  const content = fs.readFileSync(doorIconsFile, 'utf8');
  
  if (content.includes('DoorOpen') && content.includes('DoorClosed')) {
    console.log('✅ DoorIcons.tsx exports DoorOpen and DoorClosed');
  } else {
    console.log('❌ DoorIcons.tsx might be missing proper exports');
  }
} else {
  console.log('❌ DoorIcons.tsx file is missing');
}

// Check for vite.config.ts
const viteConfigFile = 'vite.config.ts';
if (fs.existsSync(viteConfigFile)) {
  console.log('✅ vite.config.ts exists');
  const content = fs.readFileSync(viteConfigFile, 'utf8');
  
  if (content.includes('path.resolve') && content.includes('./src')) {
    console.log('✅ vite.config.ts has proper path aliases');
  } else {
    console.log('❌ vite.config.ts might be missing path aliases');
  }
} else {
  console.log('❌ vite.config.ts is missing');
}

// Check for package.json
const packageJsonFile = 'package.json';
if (fs.existsSync(packageJsonFile)) {
  console.log('✅ package.json exists');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
    
    if (packageJson.dependencies && packageJson.dependencies['lucide-react']) {
      console.log('✅ lucide-react is in dependencies');
    } else {
      console.log('❌ lucide-react might be missing from dependencies');
    }
    
    if (packageJson.scripts && packageJson.scripts.dev) {
      console.log('✅ dev script exists in package.json');
    } else {
      console.log('❌ dev script might be missing from package.json');
    }
  } catch (err) {
    console.error('❌ Error parsing package.json:', err.message);
  }
}

console.log('\n=== RECOMMENDATIONS ===\n');
console.log('1. Make sure DoorIcons.tsx properly exports the icons');
console.log('2. Check that all components importing DoorIcons are using the correct path');
console.log('3. Verify that vite.config.ts has the correct path aliases');
console.log('4. Try running the dev server with: pnpm run dev');
