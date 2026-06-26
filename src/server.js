require('dotenv').config();
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();
    console.log('Connected to MySQL and synced models');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to database', err);
    process.exit(1);
  }
}

start();
