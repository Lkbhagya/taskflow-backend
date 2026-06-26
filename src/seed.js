require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./models');

async function seed() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    const User = db.User;

    const adminEmail = 'admin@taskflow.com';
    const existing = await User.findOne({ where: { email: adminEmail } });

    if (existing) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    await User.create({ name: 'Admin User', email: adminEmail, passwordHash, role: 'ADMIN' });

    console.log('Seeded admin user: admin@taskflow.com / password123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
