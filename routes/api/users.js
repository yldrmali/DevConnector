const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');


//@route  GET api/user
//@desc   Test route
//@access Public


router.post(
  '/',
  [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'please include a valid email').isEmail(),
    check('password', 'please enter a password min 6 char').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'wavatar' });
      //get users gravatar
      //encrypt password
      //return jwt
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      bcrypt.hash(user.password, 10, async (err, hash) => {
        user.password = hash;
        await user.save();
        jwt.sign(
          { user: user.id },
          config.get('secret'),
          { expiresIn: 360000 },
          (err, encoded) => {
            if (err) {
              return res
                .status(400)
                .json({ errors: [{ msg: 'Problem with jwt token encoding' }] });
            }
            return res.status(201).json({token:encoded,msg:"user is created and saved to mongodb"})
          }
        );
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({msg:[error]});
    }
  }
);

module.exports = router;
