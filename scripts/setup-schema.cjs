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

// Generate Prisma client from the correct schema
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
  // Don't exit - the build might still succeed
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
        timeout: 120000, // 2 minutes timeout
      });
      console.log('[setup-schema] Data import completed successfully');
    } catch (err) {
      console.error('[setup-schema] Data import failed:', err.message);
      console.error('[setup-schema] You can manually import data later');
    }
  } else {
    console.log('[setup-schema] No sqlite-export.json found, skipping data import');
  }
}
