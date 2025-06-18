const fs = require('fs');
const path = require('path');

// Function to search for patterns in files recursively
function searchInFiles(dir, patterns) {
  const results = [];
  
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
            // Only search in text files that are likely to be code
            const fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.json', '.md'];
            const ext = path.extname(filePath).toLowerCase();
            
            if (fileExtensions.includes(ext)) {
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                
                let hasMatch = false;
                const matchingLines = [];
                
                lines.forEach((line, index) => {
                  // Check if any pattern matches this line
                  for (const pattern of patterns) {
                    if (line.includes(pattern)) {
                      hasMatch = true;
                      matchingLines.push({
                        lineNumber: index + 1,
                        text: line.trim(),
                        pattern
                      });
                      break;
                    }
                  }
                });
                
                if (hasMatch) {
                  results.push({
                    filePath,
                    matchingLines
                  });
                }
              } catch (err) {
                console.error(`Error reading file ${filePath}:`, err.message);
              }
            }
          }
        } catch (err) {
          console.error(`Error processing ${filePath}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${currentDir}:`, err.message);
    }
  }
  
  searchDir(dir);
  return results;
}

// Get search patterns from command line arguments or use defaults
const searchPatterns = process.argv.length > 2 
  ? process.argv.slice(2) 
  : ['device.type', 'deviceType'];

const searchDir = 'src';

console.log(`Searching for patterns: ${searchPatterns.join(', ')} in directory: ${searchDir}`);
const results = searchInFiles(searchDir, searchPatterns);

// Display results
console.log(`\nFound matches in ${results.length} files:\n`);

results.forEach(result => {
  console.log(`File: ${result.filePath}`);
  
  result.matchingLines.forEach(line => {
    console.log(`  Line ${line.lineNumber}: ${line.text.substring(0, 150)}${line.text.length > 150 ? '...' : ''}`);
    console.log(`  Matched pattern: ${line.pattern}`);
  });
  
  console.log(''); // Empty line between files
});

// Summary
const totalMatches = results.reduce((sum, result) => sum + result.matchingLines.length, 0);
console.log(`Total: ${totalMatches} matches in ${results.length} files`);
