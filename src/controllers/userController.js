const db = require('../models');
const User = db.User;

exports.listUsers = async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
  res.json(users.map(u => ({ id: String(u.id), ...u.toJSON() })));
};

exports.getUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id, { attributes: ['id', 'name', 'email', 'role'] });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ id: String(user.id), ...user.toJSON() });
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['ADMIN', 'USER'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.role = role;
  await user.save();

  res.json({ id: String(user.id), name: user.name, email: user.email, role: user.role });
};
