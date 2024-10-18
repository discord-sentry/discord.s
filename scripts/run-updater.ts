// scripts/run-updater.ts

const dotenv = require('dotenv');
const { initializeUpdater } = require('../utils/ServerMonitor');



dotenv.config({ path: '.env' });

console.log('🎮 Game status updater script started 🚀');

initializeUpdater().catch((error: unknown) => {
  console.error('❌ Failed to initialize updater:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
