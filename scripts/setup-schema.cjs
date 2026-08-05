const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env.local if exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^(\w+)=(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  });
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  '';

const isPostgres = databaseUrl.includes('postgres');
const schemaFile = isPostgres ? 'prisma/schema.postgres.prisma' : 'prisma/schema.sqlite.prisma';

console.log(`[setup-schema] Database URL type: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
console.log(`[setup-schema] Using schema: ${schemaFile}`);

// Always generate Prisma client (must succeed)
try {
  execSync(`node node_modules/prisma/build/index.js generate --schema=./${schemaFile}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('[setup-schema] Prisma client generated successfully');
} catch (err) {
  console.error('[setup-schema] Failed to generate Prisma client:', err.message);
  process.exit(1);
}

// Skip database operations during Vercel build (connecting to external DB may fail)
// Database schema push and data import will be done via /api/init-db after deployment
const isVercel = process.env.VERCEL === '1';
if (isVercel) {
  console.log('[setup-schema] Running on Vercel - skipping database operations');
  console.log('[setup-schema] Database setup will be done via /api/init-db after deployment');
  process.exit(0);
}

// For local development, run database operations
console.log('[setup-schema] Running locally - setting up database...');

// Run database push
try {
  execSync(`node node_modules/prisma/build/index.js db push --schema=./${schemaFile} --accept-data-loss`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  console.log('[setup-schema] Database schema pushed successfully');
} catch (err) {
  console.error('[setup-schema] Database push failed (might be OK):', err.message);
}

// If using PostgreSQL and sqlite-export.json exists, import data automatically
if (isPostgres) {
  const exportPath = path.join(__dirname, '..', 'prisma', 'sqlite-export.json');
  if (fs.existsSync(exportPath)) {
    console.log('[setup-schema] Found sqlite-export.json, importing data...');
    try {
      execSync('node scripts/import-to-postgres.cjs', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, DATABASE_URL: databaseUrl },
        timeout: 120000,
      });
      console.log('[setup-schema] Data import completed successfully');
    } catch (err) {
      console.error('[setup-schema] Data import failed:', err.message);
      console.error('[setup-schema] You can manually import data later');
    }
  }
}
