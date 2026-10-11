const fs = require('fs');
let content = fs.readFileSync('pages/property/assets.html', 'utf8');

// Replace \` with `
content = content.split('\\`').join('`');
// Replace \$ with $
content = content.split('\\$').join('$');

fs.writeFileSync('pages/property/assets.html', content, 'utf8');
console.log('Fixed escaped backticks and dollars in assets.html');
