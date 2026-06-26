const { Op } = require('sequelize');
const db = require('../models');
const Task = db.Task;
const User = db.User;

function formatTaskResponse(task) {
  const json = task.toJSON();
  const assignedToId = json.assignedTo != null && Number.isFinite(Number(json.assignedTo))
    ? Number(json.assignedTo)
    : null;
  const createdById = json.createdBy != null && Number.isFinite(Number(json.createdBy))
    ? Number(json.createdBy)
    : null;

  return {
    ...json,
    id: String(json.id),
    assignedToId,
    createdById,
    assignedTo: json.assignedUser?.name || (assignedToId === null ? json.assignedTo || 'Unassigned' : 'Unassigned'),
    createdBy: json.creator?.name || 'Unknown',
  };
}

exports.getDashboard = async (req, res) => {
  const taskFilter = req.user.role === 'ADMIN' ? {} : { assignedTo: String(req.user.id) };

  const stats = {
    total: await Task.count({ where: taskFilter }),
    open: await Task.count({ where: { ...taskFilter, status: 'OPEN' } }),
    inProgress: await Task.count({ where: { ...taskFilter, status: 'IN_PROGRESS' } }),
    completed: await Task.count({ where: { ...taskFilter, status: 'DONE' } }),
  };

  const assignedToMe = await Task.count({ where: { assignedTo: String(req.user.id) } });
  const myCompleted = await Task.count({ where: { assignedTo: String(req.user.id), status: 'DONE' } });
  const myPending = await Task.count({ where: { assignedTo: String(req.user.id), status: { [Op.not]: 'DONE' } } });

  const recentTasks = await Task.findAll({
    where: taskFilter,
    include: [
      { model: User, as: 'assignedUser', attributes: ['name'] },
      { model: User, as: 'creator', attributes: ['name'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 4,
  });

  const unassignedTasks = await Task.findAll({
    where: {
      [Op.or]: [{ assignedTo: 'Unassigned' }, { assignedTo: null }],
    },
    include: [{ model: User, as: 'assignedUser', attributes: ['name'] }],
    order: [['dueDate', 'ASC']],
    limit: 8,
  });

  const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });

  res.json({
    stats,
    myTasks: {
      assigned: assignedToMe,
      completed: myCompleted,
      pending: myPending,
    },
    recentTasks: recentTasks.map(formatTaskResponse),
    unassignedTasks: unassignedTasks.map(formatTaskResponse),
    users: users.map((user) => ({ id: String(user.id), ...user.toJSON() })),
  });
};
