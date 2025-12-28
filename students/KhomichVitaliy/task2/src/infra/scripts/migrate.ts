import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function migrate() {
  console.log('🚀 Running database migrations...');
  
  try {
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    if (stdout) console.log(stdout);
    if (stderr && stderr.trim() !== '') {
      console.error('Stderr:', stderr);
    }
    
    console.log('✅ Migrations completed successfully');
    return 0;
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    return 1;
  }
}

(async () => {
  const exitCode = await migrate();
  process.exit(exitCode);
})();