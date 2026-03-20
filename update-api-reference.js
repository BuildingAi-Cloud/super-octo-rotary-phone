#!/usr/bin/env node
// update-api-reference.js
// Scans app/api/ for endpoints and updates docs/api-reference.md

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'app', 'api');
const docsFile = path.join(__dirname, 'docs', 'api-reference.md');

function scanApiRoutes(dir, prefix = '/api') {
  let endpoints = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      endpoints = endpoints.concat(scanApiRoutes(fullPath, prefix + '/' + file));
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const route = prefix + (file === 'index.ts' || file === 'index.js' ? '' : '/' + file.replace(/\.(ts|js)$/, ''));
      endpoints.push(route);
    }
  }
  return endpoints;
}

const endpoints = scanApiRoutes(apiDir);

const header = `# API Reference\n\nThis page is automatically generated.\n\n`;
const list = endpoints.map(e => `- ${e}`).join('\n');
const content = `${header}${list}\n`;

fs.writeFileSync(docsFile, content);
console.log('API Reference updated:', docsFile);
