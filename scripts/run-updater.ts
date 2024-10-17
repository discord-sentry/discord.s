require('dotenv').config({ path: '.env.local' });
const gameStatusUpdater = require('../app/utils/ServerMonitor.ts');

console.log('Game status updater script started'); // change this to be more colorful
// console.log('DB_URL:', process.env.DB_URL); 

gameStatusUpdater.initializeUpdater().catch((error: unknown) => {
  console.error('Failed to initialize updater:', error); // more colorful look
  process.exit(1);
});
