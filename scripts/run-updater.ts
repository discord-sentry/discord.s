// scripts/run-updater.ts

import dotenv from 'dotenv';
import chalk from 'chalk';
import { initializeUpdater } from '../utils/ServerMonitor';


dotenv.config({ path: '.env' });

console.log(chalk.bold.green('🎮 Game status updater script started 🚀'));

initializeUpdater().catch((error: unknown) => {
  console.error(chalk.bold.red('❌ Failed to initialize updater:'), error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.bold.red('Unhandled Rejection at:'), promise, chalk.bold.red('reason:'), reason);
  process.exit(1);
});
