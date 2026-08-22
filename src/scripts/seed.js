import { initDb, getOne, run } from '../config/db.js';
import { hashPassword } from '../utils/security.js';

const seedDatabase = async () => {
  try {
    console.log('Initializing database tables for seed...');
    await initDb();

    // Check if HR user exists
    let hrUser = await getOne('SELECT id FROM users WHERE email = ?', ['hr@dayflow.com']);
    if (!hrUser) {
      const hrPassHash = await hashPassword('Admin@1234');
      const result = await run(
        `INSERT INTO users (employee_id, email, password_hash, name, role, is_verified)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['EMP-HR-001', 'hr@dayflow.com', hrPassHash, 'Sarah Jenkins (HR Manager)', 'HR', 1]
      );
      
      await run(
        `INSERT INTO employee_profiles (user_id, phone, address, job_title, department, date_of_joining, salary_base)
         VALUES (?, ?, ?, ?, ?, DATE('now'), ?)`,
        [result.id, '+1-555-0192', '100 Executive Way, Suite 400', 'HR Manager', 'Human Resources', 85000]
      );
      console.log('✅ Seeded HR Account: hr@dayflow.com / Admin@1234');
    } else {
      console.log('ℹ️ HR Account already exists.');
    }

    // Check if Regular Employee user exists
    let empUser = await getOne('SELECT id FROM users WHERE email = ?', ['employee@dayflow.com']);
    if (!empUser) {
      const empPassHash = await hashPassword('Employee@1234');
      const result = await run(
        `INSERT INTO users (employee_id, email, password_hash, name, role, is_verified)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['EMP-DEV-101', 'employee@dayflow.com', empPassHash, 'Alex Rivera', 'Employee', 1]
      );

      await run(
        `INSERT INTO employee_profiles (user_id, phone, address, job_title, department, date_of_joining, salary_base)
         VALUES (?, ?, ?, ?, ?, DATE('now'), ?)`,
        [result.id, '+1-555-0144', '42 Innovation Drive', 'Senior Software Engineer', 'Engineering', 75000]
      );
      console.log('✅ Seeded Employee Account: employee@dayflow.com / Employee@1234');
    } else {
      console.log('ℹ️ Employee Account already exists.');
    }

    console.log('🎉 Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
