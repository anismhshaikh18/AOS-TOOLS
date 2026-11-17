import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const assetsDir = path.resolve(distDir, 'assets');

try {
  const rootHtml = fs.readFileSync(path.resolve(rootDir, 'index.html'), 'utf-8');

  if (!fs.existsSync(assetsDir)) {
    console.log('No dist/assets directory found, skipping singlefile generation.');
    process.exit(0);
  }

  const files = fs.readdirSync(assetsDir);
  const jsFiles = files.filter((f) => f.endsWith('.js'));
  const cssFile =
    files.find((f) => f.startsWith('index-') && f.endsWith('.css')) ||
    files.find((f) => f.endsWith('.css'));
  const jsFile =
    files.find((f) => f.startsWith('index-') && f.endsWith('.js')) || jsFiles[0];

  if (!jsFile) {
    console.log('No built JS asset found in dist/assets, skipping singlefile generation.');
    process.exit(0);
  }

  // When code-splitting emits multiple lazy chunks, keep dist/index.html untouched so
  // Vite's ES module chunks and Workbox service worker precache hashes remain valid.
  if (jsFiles.length > 1) {
    const entrySizeKB = (fs.statSync(path.resolve(assetsDir, jsFile)).size / 1024).toFixed(1);
    console.log(
      `✓ Code-splitting active (${jsFiles.length} JS chunks; entry ${jsFile}: ${entrySizeKB} KB). Preserving dist/index.html.`
    );
    process.exit(0);
  }

  const jsContent = fs.readFileSync(path.resolve(assetsDir, jsFile), 'utf-8');
  const cssContent = cssFile ? fs.readFileSync(path.resolve(assetsDir, cssFile), 'utf-8') : '';

  let singleHtml = rootHtml;
  singleHtml = singleHtml.replace(/<script[^>]*src=["']\/src\/main\.tsx["'][^>]*><\/script>/i, '');

  if (cssContent) {
    singleHtml = singleHtml.replace('</head>', () => `<style>\n${cssContent}\n</style>\n</head>`);
  }

  singleHtml = singleHtml.replace(
    '</body>',
    () => `<script type="module">\n${jsContent}\n</script>\n</body>`
  );

  fs.mkdirSync(path.resolve(rootDir, 'public'), { recursive: true });
  fs.writeFileSync(path.resolve(rootDir, 'public/standalone-index.html'), singleHtml, 'utf-8');
  fs.writeFileSync(path.resolve(rootDir, 'standalone-index.html'), singleHtml, 'utf-8');
  fs.writeFileSync(path.resolve(distDir, 'standalone-index.html'), singleHtml, 'utf-8');
  fs.writeFileSync(path.resolve(distDir, 'index.html'), singleHtml, 'utf-8');

  console.log('✓ Successfully created 100% self-contained single-file HTML.');
} catch (err) {
  console.error('Failed to process post-build assets:', err);
  process.exit(1);
}
