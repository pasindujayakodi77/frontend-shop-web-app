const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    try {
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        walk(filepath, filelist);
      } else if (stat.isFile() && filepath.endsWith('.js')) {
        filelist.push(filepath);
      }
    } catch (e) {
      // ignore permission errors
    }
  });
  return filelist;
}

function patchFiles(root) {
  if (!fs.existsSync(root)) return;
  const files = walk(root);
  let patched = 0;
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('fs.F_OK')) {
        const updated = content.split('fs.F_OK').join('fs.constants.F_OK');
        fs.writeFileSync(file, updated, 'utf8');
        patched += 1;
        console.log('Patched', file);
      }
    } catch (e) {
      // ignore read/write errors
    }
  });
  console.log(`Patched ${patched} file(s) under ${root}`);
}

// Run against local node_modules when installed on build systems like Vercel
const target = path.join(__dirname, '..', 'node_modules');
patchFiles(target);
