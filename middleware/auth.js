const jwt = require('jsonwebtoken');
const config = require('config');


//auth verifies the token passed in the header and pass it in req.user to next recipients
module.exports = async (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(400).json({ msg: 'no token auth' });
  }
  try {
    const decoded = await jwt.verify(token, config.get('secret'));
    req.user = decoded.user;//decoded.user is equal to user.id
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({msg:[error]})
  }
};
