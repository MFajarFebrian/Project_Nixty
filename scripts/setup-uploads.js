/**
 * Setup script to create upload directories and .gitkeep files
 * Run with: node scripts/setup-uploads.js
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupUploads() {
  try {
    console.log('🚀 Setting up upload directories...');
    
    const projectRoot = join(__dirname, '..');
    const publicDir = join(projectRoot, 'public');
    const uploadsDir = join(publicDir, 'uploads');
    const adminUploadsDir = join(uploadsDir, 'admin');
    
    // Create directories
    const directories = [
      publicDir,
      uploadsDir,
      adminUploadsDir
    ];
    
    for (const dir of directories) {
      try {
        await fs.access(dir);
        console.log(`✅ Directory exists: ${dir}`);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
    
    // Create .gitkeep files to ensure directories are tracked in git
    const gitkeepFiles = [
      join(uploadsDir, '.gitkeep'),
      join(adminUploadsDir, '.gitkeep')
    ];
    
    for (const gitkeepFile of gitkeepFiles) {
      try {
        await fs.access(gitkeepFile);
        console.log(`✅ .gitkeep exists: ${gitkeepFile}`);
      } catch {
        await fs.writeFile(gitkeepFile, '# This file ensures the directory is tracked in git\n');
        console.log(`📄 Created .gitkeep: ${gitkeepFile}`);
      }
    }
    
    // Create .gitignore for uploaded files
    const gitignoreContent = `# Ignore uploaded files but keep directory structure
*
!.gitkeep
!.gitignore
`;
    
    const adminGitignore = join(adminUploadsDir, '.gitignore');
    try {
      await fs.access(adminGitignore);
      console.log(`✅ .gitignore exists: ${adminGitignore}`);
    } catch {
      await fs.writeFile(adminGitignore, gitignoreContent);
      console.log(`📄 Created .gitignore: ${adminGitignore}`);
    }
    
    console.log('\n✨ Upload directories setup complete!');
    console.log('\nDirectory structure:');
    console.log('public/');
    console.log('├── uploads/');
    console.log('│   ├── .gitkeep');
    console.log('│   └── admin/');
    console.log('│       ├── .gitkeep');
    console.log('│       └── .gitignore');
    console.log('\n📝 Notes:');
    console.log('- Uploaded files will be stored in public/uploads/admin/');
    console.log('- Files are accessible via /uploads/admin/filename.ext');
    console.log('- .gitignore prevents uploaded files from being committed to git');
    console.log('- .gitkeep ensures empty directories are tracked in git');
    
  } catch (error) {
    console.error('❌ Error setting up uploads:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupUploads();
}

export { setupUploads };
