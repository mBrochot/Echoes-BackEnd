const express = require("express");
const router = express.Router();

const User = require("../models/users");
const Devis = require("../models/devis");
const apiIsAuthenticated = require("./apiIsAuthenticated");
router.post("/api/devis", apiIsAuthenticated, async (req, res) => {
  try {
    const lastDate = Date.now();
    const userFound = await User.findOne({
      _id: req.user._id,
    });

    const devis = await new Devis({
      timestamp: lastDate,
      programmeName: req.body.programmeName,
      podcastUse: req.body.podcastUse,
      podcastType: req.body.podcastType,
      podcastTone: req.body.podcastTone,
      minPrice: req.body.minPrice,
      maxPrice: req.body.maxPrice,
      reference: req.body.reference,
      launch: req.body.launch,
      frequence: req.body.frequence,
      other: req.body.other,
      email: req.body.email,
      status: "A traiter",
      user: req.user._id,
    });

    await devis.save();
    await userFound.devis.push(devis);
    await userFound.save();
    res.json(devis);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
