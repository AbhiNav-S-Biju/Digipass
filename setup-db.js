#!/usr/bin/env node

/**
 * Database Setup Script
 * Run this once to initialize the database tables
 */

const {
  initializeUserActivityColumns,
  initializeDigitalAssetsTable,
  initializeExecutorsTable,
  initializeDeadMansSwitchTable,
  initializeDigitalWillTable
} = require('./utils/dbInit');

async function setupDatabase() {
  console.log('Setting up DIGIPASS database...\n');

  try {
    const userActivityColumnsCreated = await initializeUserActivityColumns();
    const assetsTableCreated = await initializeDigitalAssetsTable();
    const executorsTableCreated = await initializeExecutorsTable();
    const deadMansSwitchTableCreated = await initializeDeadMansSwitchTable();
    const digitalWillTableCreated = await initializeDigitalWillTable();

    if (
      userActivityColumnsCreated &&
      assetsTableCreated &&
      executorsTableCreated &&
      deadMansSwitchTableCreated &&
      digitalWillTableCreated
    ) {
      console.log('\nDatabase setup completed successfully!');
      process.exit(0);
    }

    console.error('\nDatabase setup failed');
    process.exit(1);
  } catch (err) {
    console.error('Setup error:', err.message);
    process.exit(1);
  }
}

setupDatabase();
