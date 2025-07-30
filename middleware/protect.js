// middleware/protect.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  //Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      //Extract token
      token = req.headers.authorization.split(' ')[1];

      // Verify and decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info (including role) to request object
      req.user = decoded;

      next(); // Allow access
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;
