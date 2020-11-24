const express = require("express");

const router = express.Router();

// @route GET api/profile
// @desc Test route
// @access public

router.get("/", async (req, res) => {
  res.send("Api profile");
});
module.exports = router;
