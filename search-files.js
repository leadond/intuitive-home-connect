const fs = require('fs');
const path = require('path');

// Function to search for files recursively
function findFiles(dir, extensions, searchTerms) {
  const results = [];
  
  function searchDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        searchDir(filePath);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lowerContent = content.toLowerCase();
        
        if (searchTerms.some(term => lowerContent.includes(term.toLowerCase()))) {
          results.push({
            path: filePath,
            matches: searchTerms.filter(term => 
              lowerContent.includes(term.toLowerCase())
            )
          });
        }
      }
    }
  }
  
  searchDir(dir);
  return results;
}

// Search for files with these extensions containing the search terms
const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];
const searchTerms = ['door', 'garage'];
const searchDir = 'src';

console.log(`Searching for files in ${searchDir} containing: ${searchTerms.join(', ')}`);
const foundFiles = findFiles(searchDir, fileExtensions, searchTerms);

console.log(`\nFound ${foundFiles.length} files:`);
foundFiles.forEach(file => {
  console.log(`\n${file.path}`);
  console.log(`  Matches: ${file.matches.join(', ')}`);
  
  // Display a snippet of the file content
  try {
    const content = fs.readFileSync(file.path, 'utf8');
    const lines = content.split('\n');
    
    // Find lines containing the search terms
    const matchingLines = lines.map((line, index) => {
      const lowerLine = line.toLowerCase();
      if (searchTerms.some(term => lowerLine.includes(term.toLowerCase()))) {
        return { lineNumber: index + 1, content: line.trim() };
      }
      return null;
    }).filter(Boolean);
    
    if (matchingLines.length > 0) {
      console.log('  Matching lines:');
      matchingLines.slice(0, 5).forEach(line => {
        console.log(`    Line ${line.lineNumber}: ${line.content.substring(0, 100)}${line.content.length > 100 ? '...' : ''}`);
      });
      
      if (matchingLines.length > 5) {
        console.log(`    ... and ${matchingLines.length - 5} more matches`);
      }
    }
  } catch (error) {
    console.error(`  Error reading file: ${error.message}`);
  }
});
