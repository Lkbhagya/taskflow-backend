const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name, email: user.email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '8h',
  });
}

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user);

  res.json({ token, user: { id: String(user.id), name: user.name, role: user.role } });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  const exists = await User.findOne({ where: { email: email.toLowerCase().trim() } });

  if (exists) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash });

  const token = signToken(newUser);

  res.status(201).json({ token, user: { id: String(newUser.id), name: newUser.name, role: newUser.role } });
};

exports.forgotPassword = async (req, res) => {
  // Placeholder: implement email-based reset in production
  res.status(501).json({ message: 'Forgot password is not implemented yet.' });
};
