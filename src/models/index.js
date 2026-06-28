const { Sequelize } = require('sequelize');

const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || '3306');
const database = process.env.DB_NAME || 'taskflow';
const username = process.env.DB_USER || 'root';
const password = process.env.DB_PASS || '';

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: 'mysql',
  logging: false,

  dialectOptions: {
    connectTimeout: 60000,
  },

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const db = {
  sequelize,
};

db.User = require('./user')(sequelize);
db.Task = require('./task')(sequelize);

// Task -> Assigned User
db.Task.belongsTo(db.User, {
  foreignKey: 'assignedTo',
  targetKey: 'id',
  as: 'assignedUser',
  constraints: false,
});

db.User.hasMany(db.Task, {
  foreignKey: 'assignedTo',
  sourceKey: 'id',
  as: 'assignedTasks',
  constraints: false,
});

// Task -> Creator
db.Task.belongsTo(db.User, {
  foreignKey: 'createdBy',
  targetKey: 'id',
  as: 'creator',
  constraints: false,
});

db.User.hasMany(db.Task, {
  foreignKey: 'createdBy',
  sourceKey: 'id',
  as: 'createdTasks',
  constraints: false,
});

module.exports = db;