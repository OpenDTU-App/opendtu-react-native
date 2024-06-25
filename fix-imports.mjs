#!/usr/bin/env node
// check all imports in ./src and filter out file extensions from the import paths for .ts and .tsx.
import fs from 'fs';

const srcDir = './src';

// check if dry run
if (process.argv.includes('--dry')) {
  console.log('Dry run enabled');
  process.env.DRY_RUN = 'true';
}

const dryRun = process.env.DRY_RUN === 'true';

const fixImports = path => {
  const content = fs.readFileSync(path, 'utf8');
  const imports = content.match(/import (?:type )?{?(?:\s*[a-zA-Z0-9_]*,?\s)*}? ?from ['"]([^'"]*)['"];/gs) || [];

  const newImports = imports.map(imp => {
    const match = imp.match(/from ['"](.*)['"]/);
    const oldPath = match[1];
    // remove .ts and .tsx
    const newPath = oldPath.replace(/\.tsx?/g, '');

    return [imp, imp.replace(oldPath, newPath), oldPath === newPath];
  }).filter(([oldPath, newImp, same]) => !same);

  if (!newImports.length) {
    return;
  }

  const newContent = content.replace(
    new RegExp(newImports.map(([oldPath]) => oldPath).join('|'), 'g'),
    match => {
      const newImport = newImports.find(([oldPath]) => oldPath === match);
      return newImport[1];
    }
  );

  const changesMade = content !== newContent;

  const newImportsStr = newImports.map(([oldPath, newPath]) => `Old: \n${oldPath} \nNew: \n${newPath}`).join('\n');

  console.log(`\nChanges in ${path}:\n${newImportsStr}\n`);

  if (!changesMade) {
    return;
  }

  if (dryRun) {
    console.log(`Dry run enabled, skipping writing to ${path}`);
    return;
  }

  if (content !== newContent) {
    fs.writeFileSync(path, newContent);
    console.log(`Fixed imports in ${path}`);
  }
};

const walk = dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const path = `${dir}/${file}`;
    if (fs.statSync(path).isDirectory()) {
      walk(path);
    } else {
      if (path.endsWith('.ts') || path.endsWith('.tsx')) {
        fixImports(path);
      }
    }
  });

  if (dir === srcDir) {
    console.log('All imports fixed');
  }
};

walk(srcDir);
