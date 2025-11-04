import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually if it exists
try {
  const envPath = join(__dirname, '..', '.env');
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
} catch (error) {
  // .env file doesn't exist or can't be read, rely on system env vars
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applyMigration() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected to database');

    // Check if migrations directory exists and has SQL files
    const migrationsDir = join(__dirname, '..', 'migrations');
    let migrationSQL = '';
    
    try {
      // Try to read migration files
      const fs = await import('fs');
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      
      if (files.length > 0) {
        const latestMigration = files[files.length - 1];
        const migrationPath = join(migrationsDir, latestMigration);
        migrationSQL = readFileSync(migrationPath, 'utf-8');
        console.log(`Using migration file: ${latestMigration}`);
      } else {
        console.log('No migration files found. Checking if database schema already exists...');
        // Check if tables exist
        const result = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          LIMIT 1
        `);
        
        if (result.rows.length > 0) {
          console.log('⚠️  Database tables already exist. Skipping migration.');
          client.release();
          await pool.end();
          process.exit(0);
        } else {
          console.log('⚠️  No migration files and no tables found. You may need to run: npm run db:push');
          client.release();
          await pool.end();
          process.exit(0);
        }
      }
    } catch (error) {
      console.log('⚠️  Migrations directory not found. If using drizzle-kit push, migrations may not be needed.');
      console.log('Checking if database schema already exists...');
      
      try {
        const result = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          LIMIT 1
        `);
        
        if (result.rows.length > 0) {
          console.log('✅ Database tables already exist. Skipping migration.');
          client.release();
          await pool.end();
          process.exit(0);
        } else {
          console.log('⚠️  No tables found. Please run: npm run db:push');
          client.release();
          await pool.end();
          process.exit(0);
        }
      } catch (err) {
        console.error('Error checking database:', err.message);
        client.release();
        await pool.end();
        process.exit(1);
      }
    }

    if (!migrationSQL) {
      client.release();
      await pool.end();
      process.exit(0);
    }

    // Split by statement breakpoint and execute each statement
    // The migration file uses '--> statement-breakpoint' as a separator
    const parts = migrationSQL.split('--> statement-breakpoint');
    const statements = parts
      .map(part => part.trim())
      .filter(part => part.length > 0 && part.startsWith('CREATE TABLE'))
      .map(statement => {
        // Ensure statement ends with semicolon
        return statement.endsWith(';') ? statement : statement + ';';
      });

    console.log(`\nApplying ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() && statement !== ';') {
        try {
          await client.query(statement);
          const tableMatch = statement.match(/CREATE TABLE "?(\w+)"?/i);
          const tableName = tableMatch ? tableMatch[1] : 'unknown';
          console.log(`✅ Statement ${i + 1}/${statements.length} applied (${tableName})`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || error.code === '42P07' || error.code === '23505') {
            const tableMatch = statement.match(/CREATE TABLE "?(\w+)"?/i);
            const tableName = tableMatch ? tableMatch[1] : 'unknown';
            console.log(`⚠️  Statement ${i + 1}/${statements.length} skipped - ${tableName} already exists`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
            throw error;
          }
        }
      }
    }

    client.release();
    console.log('\n✅ Migration applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();

