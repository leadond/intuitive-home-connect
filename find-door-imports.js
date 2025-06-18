const fs = require('fs');
const path = require('path');

// Function to search for files that import Door from lucide-react
function findDoorImports(dir) {
  const results = [];
  
  function searchDir(currentDir) {
    try {
      const files = fs.readdirSync(currentDir);
      
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        
        try {
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            searchDir(filePath);
          } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for imports from lucide-react that include Door
            if (content.includes('lucide-react') && content.includes('Door')) {
              // Check if it's importing Door directly from lucide-react
              const importMatch = content.match(/import\s+{[^}]*Door[^}]*}\s+from\s+['"]lucide-react['"]/);
              if (importMatch) {
                results.push({
                  path: filePath,
                  importStatement: importMatch[0],
                  content: content
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

const searchDir = 'src';
console.log('Searching for files that import Door from lucide-react...');
const results = findDoorImports(searchDir);

console.log(`\nFound ${results.length} files importing Door from lucide-react:\n`);
results.forEach(file => {
  console.log(`File: ${file.path}`);
  console.log(`Import statement: ${file.importStatement}`);
  console.log('---');
});

// Check if any files are importing Door from our custom DoorIcons
const doorIconsImports = [];
function findDoorIconsImports(dir) {
  function searchDir(currentDir) {
    try {
      const files = fs.readdirSync(currentDir);
      
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        
        try {
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            searchDir(filePath);
          } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for imports from our DoorIcons
            if (content.includes('DoorIcons') && content.includes('Door')) {
              const importMatch = content.match(/import\s+{[^}]*Door[^}]*}\s+from\s+['"](.*DoorIcons)['"]/);
              if (importMatch) {
                doorIconsImports.push({
                  path: filePath,
                  importStatement: importMatch[0]
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
}

findDoorIconsImports(searchDir);
console.log(`\nFound ${doorIconsImports.length} files importing from DoorIcons:\n`);
doorIconsImports.forEach(file => {
  console.log(`File: ${file.path}`);
  console.log(`Import statement: ${file.importStatement}`);
  console.log('---');
});

// Check if our DoorIcons.tsx is exporting Door
const doorIconsPath = path.join(searchDir, 'components/icons/DoorIcons.tsx');
if (fs.existsSync(doorIconsPath)) {
  const content = fs.readFileSync(doorIconsPath, 'utf8');
  console.log('\nDoorIcons.tsx exports:');
  
  if (content.includes('export const Door')) {
    console.log('✅ DoorIcons.tsx exports Door');
  } else {
    console.log('❌ DoorIcons.tsx does NOT export Door');
  }
  
  if (content.includes('export const DoorOpen')) {
    console.log('✅ DoorIcons.tsx exports DoorOpen');
  } else {
    console.log('❌ DoorIcons.tsx does NOT export DoorOpen');
  }
  
  if (content.includes('export const DoorClosed')) {
    console.log('✅ DoorIcons.tsx exports DoorClosed');
  } else {
    console.log('❌ DoorIcons.tsx does NOT export DoorClosed');
  }
}
