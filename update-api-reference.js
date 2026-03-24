#!/usr/bin/env node
// update-api-reference.js
// Scans app/api/ for endpoints and updates docs/api-reference.md

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      const isRootRouteFile =
        file === 'index.ts' ||
        file === 'index.js' ||
        file === 'route.ts' ||
        file === 'route.js';
      const route = prefix + (isRootRouteFile ? '' : '/' + file.replace(/\.(ts|js)$/, ''));
      endpoints.push(route);
    }
  }
  return endpoints;
}

const endpoints = scanApiRoutes(apiDir);

const header = `# API Reference\n\nThis page is automatically generated.\n\n`;
const list = endpoints.map((e) => `- ${e}`).join('\n');
const content = `${header}${list}\n`;

fs.writeFileSync(docsFile, content);
console.log('API Reference updated:', docsFile);
