require('dotenv').config({ path: '.env.local' });
const gameStatusUpdater = require('../app/utils/ServerMonitor.ts');
const chalk = require('chalk');

console.log(chalk.bold.green('🎮 Game status updater script started 🚀'));

gameStatusUpdater.initializeUpdater().catch((error: unknown) => {
  console.error(chalk.bold.red('❌ Failed to initialize updater:'), error);
  process.exit(1);
});
