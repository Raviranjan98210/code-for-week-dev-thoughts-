const express = require("express");
const router = express.Router();

// @route GET api/post
// @desc Test route
// @access Public

router.get("/", async (req, res) => {
  res.send("route post");
});

module.exports = router;
