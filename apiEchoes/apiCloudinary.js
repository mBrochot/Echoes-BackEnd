// Route avec CREATE, FIND ONE, FIND ALL, UPDATE, DELETE
const express = require("express");
const router = express.Router();

router.post("/api/cloudinary", async (req, res) => {
  try {
    console.log(req.body);
    res.json(req.body);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
