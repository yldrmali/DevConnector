const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt=require('jsonwebtoken');
const config=require('config');


//@route  GET api/auth
//@desc   Test route
//@access Public



router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
});

//@route  POST api/auth
//@desc   get jwt of auth
//@access Public


router.post(
  '/',
  [
    check('email', 'please pass valid email address').isEmail(),
    check('password', 'invalid credentials').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ msg: 'No user found' });
      }
      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(500).json({msg:'password compare has failed'});
      }

      jwt.sign(
        { user: user.id},
        config.get('secret'),
        { expiresIn: 360000},
        (err, encoded) => {
          if (err) {
            return res
              .status(400)
              .json({msg: 'Problem with jwt token encoding' });
          }
          return res.status(201).json({ token: encoded });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).json({msg:'inside catch'});
    }
  }
);

module.exports = router;
