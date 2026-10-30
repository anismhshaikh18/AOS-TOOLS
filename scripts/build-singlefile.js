import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const assetsDir = path.resolve(distDir, 'assets');

try {
  // Always read from root index.html clean template
  const rootHtml = fs.readFileSync(path.resolve(rootDir, 'index.html'), 'utf-8');

  // Find built CSS and JS assets in dist/assets
  if (!fs.existsSync(assetsDir)) {
    console.log('No dist/assets directory found, skipping singlefile generation.');
    process.exit(0);
  }

  const files = fs.readdirSync(assetsDir);
  const cssFile = files.find(f => f.endsWith('.css'));
  const jsFile = files.find(f => f.endsWith('.js'));

  if (!jsFile) {
    console.log('No built JS asset found in dist/assets, skipping singlefile generation.');
    process.exit(0);
  }

  const jsContent = fs.readFileSync(path.resolve(assetsDir, jsFile), 'utf-8');
  const cssContent = cssFile ? fs.readFileSync(path.resolve(assetsDir, cssFile), 'utf-8') : '';

  // Start with clean root index.html
  let singleHtml = rootHtml;

  // Remove the module script tag
  singleHtml = singleHtml.replace(/<script[^>]*src=["']\/src\/main\.tsx["'][^>]*><\/script>/i, '');

  // Inject CSS style tag before </head>
  if (cssContent) {
    singleHtml = singleHtml.replace('</head>', () => `<style>\n${cssContent}\n</style>\n</head>`);
  }

  // Inject JS module script before </body> using function replacer to prevent $ substitution bugs
  singleHtml = singleHtml.replace('</body>', () => `<script type="module">\n${jsContent}\n</script>\n</body>`);

  // Write standalone single-file to standalone-index.html and dist/index.html (NEVER to root index.html)
  fs.mkdirSync(path.resolve(rootDir, 'public'), { recursive: true });
  fs.writeFileSync(path.resolve(rootDir, 'public/standalone-index.html'), singleHtml, 'utf-8');
  fs.writeFileSync(path.resolve(rootDir, 'standalone-index.html'), singleHtml, 'utf-8');
  fs.writeFileSync(path.resolve(distDir, 'standalone-index.html'), singleHtml, 'utf-8');
  fs.writeFileSync(path.resolve(distDir, 'index.html'), singleHtml, 'utf-8');

  console.log('✓ Successfully created 100% self-contained single-file HTML:');
  console.log('  - ./standalone-index.html (' + (Buffer.byteLength(singleHtml) / 1024).toFixed(1) + ' KB)');
  console.log('  - ./dist/index.html (' + (Buffer.byteLength(singleHtml) / 1024).toFixed(1) + ' KB)');
} catch (err) {
  console.error('Failed to create single file bundle:', err);
  process.exit(1);
}
