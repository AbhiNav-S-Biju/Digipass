const pool = require('./db.js');

async function addCurrentStepColumn() {
  try {
    console.log('Adding current_step column to executor_tasks table...');

    const result = await pool.query(
      `ALTER TABLE executor_tasks 
       ADD COLUMN IF NOT EXISTS current_step INT DEFAULT 0;`
    );

    console.log('✅ Column added successfully');

    // Verify column exists
    const check = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'executor_tasks' AND column_name = 'current_step'`
    );

    if (check.rows.length > 0) {
      console.log('✅ Verified: current_step column exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addCurrentStepColumn();
