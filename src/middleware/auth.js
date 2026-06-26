const jwt = require('jsonwebtoken');

exports.requireAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token.' });

  const token = auth.slice(7);

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.sub, role: payload.role, name: payload.name, email: payload.email };
    // Optionally load full user from DB
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

exports.requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
  if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden.' });
  next();
};
