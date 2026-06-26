const { Op } = require('sequelize');
const db = require('../models');
const Task = db.Task;

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

exports.listTasks = async (req, res) => {
  const { search, status, priority } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  if (search) {
    const like = `%${search}%`;
    filter[Op.or] = [
      { title: { [Op.like]: like } },
      { description: { [Op.like]: like } },
    ];
  }

  if (req.user.role !== 'ADMIN') {
    filter.assignedTo = String(req.user.id);
  }

  const tasks = await Task.findAll({
    where: filter,
    include: [
      { model: db.User, as: 'assignedUser', attributes: ['name'] },
      { model: db.User, as: 'creator', attributes: ['name'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json(tasks.map(formatTaskResponse));
};

exports.getTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByPk(id, {
    include: [
      { model: db.User, as: 'assignedUser', attributes: ['name'] },
      { model: db.User, as: 'creator', attributes: ['name'] },
    ],
  });
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json(formatTaskResponse(task));
};

exports.createTask = async (req, res) => {
  const { title, description, priority, status, dueDate, assignedToId } = req.body;

  if (!title) return res.status(400).json({ message: 'Title is required.' });

  const assignedToValue = assignedToId === undefined || assignedToId === null
    ? req.user.role === 'ADMIN'
      ? 'Unassigned'
      : String(req.user.id)
    : String(assignedToId);

  const task = await Task.create({
    title: title.trim(),
    description: (description || '').trim(),
    priority: priority || 'MEDIUM',
    status: status || 'OPEN',
    dueDate: dueDate ? new Date(dueDate) : undefined,
    assignedTo: assignedToValue,
    createdBy: req.user && req.user.id != null ? String(req.user.id) : null,
  });

  await task.reload({ include: [{ model: db.User, as: 'assignedUser', attributes: ['name'] }] });
  res.status(201).json(formatTaskResponse(task));
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  await task.update({
    title: payload.title ?? task.title,
    description: payload.description ?? task.description,
    priority: payload.priority ?? task.priority,
    status: payload.status ?? task.status,
    dueDate: payload.dueDate ? new Date(payload.dueDate) : task.dueDate,
    assignedTo:
      payload.assignedToId !== undefined
        ? payload.assignedToId != null
          ? String(payload.assignedToId)
          : 'Unassigned'
        : task.assignedTo,
  });

  await task.reload({ include: [{ model: db.User, as: 'assignedUser', attributes: ['name'] }] });
  res.json(formatTaskResponse(task));
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  await task.destroy();
  res.status(204).end();
};

exports.getStats = async (req, res) => {
  const filter = req.user.role === 'ADMIN' ? {} : { assignedTo: String(req.user.id) };
  const total = await Task.count({ where: filter });
  const open = await Task.count({ where: { ...filter, status: 'OPEN' } });
  const inProgress = await Task.count({ where: { ...filter, status: 'IN_PROGRESS' } });
  const completed = await Task.count({ where: { ...filter, status: 'DONE' } });

  res.json({ total, open, inProgress, completed });
};
