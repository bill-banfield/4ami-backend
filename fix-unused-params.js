const fs = require('fs');
const path = require('path');

// Fix unused function parameters by prefixing with underscore
const paramFixes = [
  {
    file: 'src/modules/ai/processors/ai.processor.ts',
    fixes: [
      { line: 172, oldParam: 'assetData', newParam: '_assetData' },
      { line: 189, oldParam: 'assetData', newParam: '_assetData' },
      { line: 205, oldParam: 'data', newParam: '_data' },
      { line: 213, oldParam: 'data', newParam: '_data' },
      { line: 229, oldParam: 'data', newParam: '_data' },
    ]
  },
  {
    file: 'src/modules/assets/assets.service.ts',
    fixes: [
      { line: 270, oldParam: 'projectId', newParam: '_projectId' },
    ]
  },
];

paramFixes.forEach(({ file, fixes }) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  
  fixes.forEach(({ line, oldParam, newParam }) => {
    if (lines[line - 1]) {
      lines[line - 1] = lines[line - 1].replace(
        new RegExp(`\b${oldParam}\b`, 'g'),
        newParam
      );
    }
  });
  
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`Fixed: ${file}`);
});

console.log('Done!');
