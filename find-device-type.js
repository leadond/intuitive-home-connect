const fs = require('fs');
const path = require('path');

// Function to search for device type patterns in files
function findDeviceTypePatterns(dir) {
  const results = [];
  const patterns = ['device.type', 'deviceType', 'device_type'];
  
  function searchDir(currentDir) {
    try {
      const files = fs.readdirSync(currentDir);
      
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        
        try {
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            // Skip node_modules and .git directories
            if (file !== 'node_modules' && file !== '.git') {
              searchDir(filePath);
            }
          } else {
            // Only search in React/TypeScript files
            if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.js')) {
              const content = fs.readFileSync(filePath, 'utf8');
              const lines = content.split('\n');
              
              const matchingLines = [];
              
              lines.forEach((line, index) => {
                for (const pattern of patterns) {
                  if (line.includes(pattern)) {
                    matchingLines.push({
                      lineNumber: index + 1,
                      content: line.trim(),
                      pattern
                    });
                    break;
                  }
                }
              });
              
              if (matchingLines.length > 0) {
                results.push({
                  path: filePath,
                  matches: matchingLines
                });
              }
            }
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

// Search in the src directory
const searchDir = 'src';
console.log(`Searching for device type patterns in ${searchDir}...`);
const results = findDeviceTypePatterns(searchDir);

// Display results
console.log(`\nFound ${results.length} files with device type patterns:\n`);

results.forEach(file => {
  console.log(`File: ${file.path}`);
  console.log('Matching lines:');
  
  file.matches.forEach(match => {
    console.log(`  Line ${match.lineNumber} [${match.pattern}]: ${match.content.substring(0, 120)}${match.content.length > 120 ? '...' : ''}`);
  });
  
  console.log(''); // Empty line between files
});

// Analyze how device types are being used
console.log('\n=== ANALYSIS OF DEVICE TYPE USAGE ===\n');

// Count occurrences of each pattern
const patternCounts = {};
results.forEach(file => {
  file.matches.forEach(match => {
    patternCounts[match.pattern] = (patternCounts[match.pattern] || 0) + 1;
  });
});

console.log('Pattern usage frequency:');
Object.entries(patternCounts).forEach(([pattern, count]) => {
  console.log(`  ${pattern}: ${count} occurrences`);
});

// Find files that might be defining device types
console.log('\nPossible device type definitions:');
results.forEach(file => {
  const hasDefinition = file.matches.some(match => 
    match.content.includes('=') || 
    match.content.includes('const') || 
    match.content.includes('enum') ||
    match.content.includes('type') ||
    match.content.includes('interface')
  );
  
  if (hasDefinition) {
    console.log(`  ${file.path} might contain device type definitions`);
    
    // Show potential definition lines
    const definitionLines = file.matches.filter(match => 
      match.content.includes('=') || 
      match.content.includes('const') || 
      match.content.includes('enum') ||
      match.content.includes('type') ||
      match.content.includes('interface')
    );
    
    definitionLines.forEach(line => {
      console.log(`    Line ${line.lineNumber}: ${line.content.substring(0, 120)}${line.content.length > 120 ? '...' : ''}`);
    });
  }
});

// Find components that use device types for conditional rendering
console.log('\nComponents using device types for conditional rendering:');
results.forEach(file => {
  const hasConditional = file.matches.some(match => 
    match.content.includes('if') || 
    match.content.includes('?') || 
    match.content.includes('switch') ||
    match.content.includes('case') ||
    match.content.includes('===') ||
    match.content.includes('==') ||
    match.content.includes('includes')
  );
  
  if (hasConditional) {
    console.log(`  ${file.path} uses device types in conditional logic`);
  }
});
