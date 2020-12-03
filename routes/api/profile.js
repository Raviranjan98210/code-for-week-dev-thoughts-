const express = require("express");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const config = require("config");
const request = require("request");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");

const router = express.Router();

// @route GET api/profile/me
// @desc get profile
// @access public

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "Profile is not find for this user" });
    }

    res.send(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

// @route POST api/profile
// @desc create and update profile
// @access private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skil is required").not().isEmpty(),
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
      status,
      skills,
      bio,
      githubusername,
      twitter,
      facebook,
      youtube,
      instagram,
      linkdin,
    } = req.body;

    let profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkdin) profileFields.social.linkdin = linkdin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      profile = new Profile(profileFields);

      await profile.save();

      res.send(profile);
    } catch (err) {
      console.error(err);
      return res.status(500).send("server error");
    }
  }
);

// @route GET api/profile
// @desc get all the profiles
// @access public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);

    if (!profiles) {
      res.status(400).json({ msg: "No profile created yet" });
    }

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route GET api/profile/user/:user_id
// @desc get all user profile by user id
// @access public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.find({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);

    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }

    res.status(500).send("Server error");
  }
});

// @route DELETE api/profile
// @desc Delete profile,user and posts
// @access private

router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });

    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route PUT api/profile/experience
// @desc Add experience to the user profile...we handle the experience on seprate route because Id need to be there for each experience object so that deleting
// and updating could be handle easily.
// @access private

router.post(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From is required").not().isEmpty(),
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
      from,
      location,
      to,
      current,
      description,
    } = req.body;

    const newExperince = {
      title,
      company,
      from,
      location,
      to,
      current,
      description,
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (!profile.experience) {
        return res.status(400).json({ msg: "Profile not found" });
      }

      profile.experience.unshift(newExperince);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  }
);

// @route PUT api/profile/experience
// @desc Updating experience
// @access private

// router.put(
//   "/experience/:id",
//   [
//     auth,
//     [
//       check("title", "Title is required").not().isEmpty(),
//       check("company", "Company is required").not().isEmpty(),
//       check("from", "From is required").not().isEmpty(),
//     ],
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const {
//       title,
//       company,
//       from,
//       location,
//       to,
//       current,
//       description,
//     } = req.body;

//     let updatedExperience = {};

//     if (title) updatedExperience.title = title;
//     if (company) updatedExperience.company = company;
//     if (from) updatedExperience.from = from;
//     if (location) updatedExperience.location = location;
//     if (to) updatedExperience.to = to;
//     if (current) updatedExperience.current = current;
//     if (description) updatedExperience.description = description;

//     try {
//       let profile = await Profile.findOne({ user: req.user.id });

//       if (!profile.experience) {
//         return res.status(400).json({ msg: "Add experience" });
//       }

//       profile.experience = profile.experience.map((expObj) => {
//         if (JSON.stringify(expObj._id) === JSON.stringify(req.params.id)) {
//           return { ...expObj, ...updatedExperience };
//         }
//         return expObj;
//       });

//       console.log(newa);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).send("Server error");
//     }
//   }
// );

// @route DELETE api/profile/experience/exp_id
// @desc Deleting experience
// @access private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    const experienceToRemove = profile.experience
      .map((experienceObj) => experienceObj._id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(experienceToRemove, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

router.post(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("from", "From is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
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
      from,
      fieldofstudy,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      from,
      fieldofstudy,
      to,
      current,
      description,
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (!profile.education) {
        return res.status(400).json({ msg: "Profile not found" });
      }

      profile.education.unshift(newEducation);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  }
);

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    const educationToRemove = profile.education
      .map((educationObj) => educationObj._id)
      .indexOf(req.params.edu_id);

    profile.education.splice(educationToRemove, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
});

router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&cliend_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,

      method: "GET",

      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No github profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});
module.exports = router;
