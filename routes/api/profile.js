const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const axios = require('axios');
const config=require('config');
const request=require('request');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { populate } = require('../../models/Profile');

//@route  GET api/profile/me
//@desc   get current users profile
//@access Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user }).populate('user', [
      'name',
      'avatar',
    ]);

    if (!profile) {
      return res.status(400).json({ msg: 'no profile for this user' });
    }
    res.status(201).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

//@route  POST api/profile
//@desc   Create or update user profile
//@access Private

router.post(
  '/',
  [
    auth,
    [
      check('status').not().isEmpty(),
      check('skills', 'skills is required').not().isEmpty(),
    ],
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile object
    const profileFields = {};

    profileFields.user = req.user; //req.user is userId
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user });

      if (profile) {
        console.log('profile is found');
        profile = await Profile.findOneAndUpdate(
          { user: req.user },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //if not ,then create
      console.log('profile is not found but created');
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: [error] });
    }
  }
);


// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public

router.get('/user/:userId', async (req, res) => {
  try {
    let result = await Profile.findOne({ user: req.params.userId })
      .populate({ path: 'user', select: 'name avatar -_id' })
      .exec();
    if (result) {
      return res.status(201).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'no user found' });
  }
});
//@route  DELETE api/profile
//@desc   Delete profile,user,post
//@access Private

router.delete('/', auth, async (req, res) => {
  try {
    let doc = await User.findOneAndDelete({ _id: req.user});
    return res.status(201).json(doc);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: [error] });
  }
});

//@route  PUT api/profile/experience
//@desc   add or update experience
//@access Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required and needs to be from the past')
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      console.log(req.user, '<==req.user is');

      const profile = await Profile.findOne({ user: req.user });

      profile.experience.unshift(newExp);

      await profile.save();

      res.status(201).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: err });
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    console.log(req.user, '<==req.user');

    const foundProfile = await Profile.findOne({ user: req.user });
    foundProfile.experience = await foundProfile.experience.filter(
      (item) => item._id.toString() !== req.params.exp_id
    );
    foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: error });
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Field of study is required').not().isEmpty(),
      check('from', 'From date is required and needs to be from the past')
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user });

      profile.education.unshift(newEdu);

      await profile.save();

      res.status(201).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send({ msg: err });
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user });
    foundProfile.education = foundProfile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );
    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: encodeURI(
        `https://api.github.com/users/${
          req.params.username
        }/repos?per_page=5&sort=created:asc&client_id=${config.get(
          'githubClientId'
        )}&client_secret=${config.get('githubSecret')}`
      ),
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
