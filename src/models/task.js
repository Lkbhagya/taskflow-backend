const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define(
    'Task',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      priority: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'MEDIUM' },
      status: { type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'DONE'), defaultValue: 'OPEN' },
      dueDate: { type: DataTypes.DATE, allowNull: true },
      assignedTo: { type: DataTypes.STRING, allowNull: true },
      createdBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    { tableName: 'tasks', timestamps: true }
  );

  return Task;
};
