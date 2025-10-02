const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Event Management System...\n');

// Function to run commands
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    console.log('✅ Command completed successfully\n');
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Function to create .env file if it doesn't exist
function createEnvFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created ${filePath}`);
  } else {
    console.log(`⚠️  ${filePath} already exists, skipping...`);
  }
}

// Setup Backend
console.log('📦 Setting up Backend...');
runCommand('npm install', path.join(__dirname, 'Backend'));

// Create Backend .env file
const backendEnvContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/event_management
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
NODE_ENV=development`;

createEnvFile(path.join(__dirname, 'Backend', '.env'), backendEnvContent);

// Setup Frontend
console.log('📦 Setting up Frontend...');
runCommand('npm install', path.join(__dirname, 'Frontend'));

// Create Frontend .env file
const frontendEnvContent = `VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Event Management System`;

createEnvFile(path.join(__dirname, 'Frontend', '.env', frontendEnvContent);

console.log('🎉 Setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Start the backend server: cd Backend && npm run dev');
console.log('3. Start the frontend server: cd Frontend && npm run dev');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n🔧 Configuration:');
console.log('- Backend runs on http://localhost:5000');
console.log('- Frontend runs on http://localhost:3000');
console.log('- MongoDB should be running on mongodb://localhost:27017');
console.log('\n📚 For more information, check the README.md files in each directory.');
