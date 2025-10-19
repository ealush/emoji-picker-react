#!/usr/bin/env node
const fs = require('fs');

// Accept version as first arg or from env
const versionArg = process.argv[2] || process.env.PACKAGE_VERSION;
if (!versionArg) {
  console.error('Usage: update-gh-pages-package.js <version>');
  process.exit(2);
}

const version = versionArg;

function updatePackageJson() {
  const pkgPath = './package.json';
  if (fs.existsSync(pkgPath)) {
    const p = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (!p.dependencies) p.dependencies = {};
    p.dependencies['emoji-picker-react'] = version;
    fs.writeFileSync(pkgPath, JSON.stringify(p, null, 2) + '\n');
    console.log(
      `Updated package.json dependency emoji-picker-react to ${version}`
    );
  } else {
    const p = {
      name: 'gh-pages',
      version: '0.0.0',
      dependencies: { 'emoji-picker-react': version },
    };
    fs.writeFileSync(pkgPath, JSON.stringify(p, null, 2) + '\n');
    console.log(`Created package.json with emoji-picker-react@${version}`);
  }
}

try {
  updatePackageJson();
} catch (err) {
  console.error('Failed to update package.json:', err);
  process.exit(1);
}
