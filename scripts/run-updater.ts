require('dotenv').config({ path: '.env.local' });
const gameStatusUpdater = require('../app/utils/game-status-updater');

console.log('Game status updater script started');
console.log('DB_URL:', process.env.DB_URL); // Log the DB_URL (make sure to remove this in production)

gameStatusUpdater.initializeUpdater().catch((error: unknown) => {
  console.error('Failed to initialize updater:', error);
  process.exit(1);
});
