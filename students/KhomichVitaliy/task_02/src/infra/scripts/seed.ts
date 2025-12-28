#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function seed() {
  console.log('🌱 Seeding database...');
  
  try {
    const { stdout, stderr } = await execAsync('npx prisma db seed');
    
    if (stdout) console.log(stdout);
    if (stderr && stderr.trim() !== '') {
      console.error('Stderr:', stderr);
    }
    
    console.log('✅ Seeding completed successfully');
    return 0;
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    return 1;
  }
}

(async () => {
  const exitCode = await seed();
  process.exit(exitCode);
})();