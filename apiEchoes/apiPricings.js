const express = require("express");
const router = express.Router();

const Pricings = require("../models/pricings");

router.get("/api/pricings", async (req, res) => {
  try {
    const allpricings = await Pricings.find();
    res.json(allpricings);
  } catch (err) {
    console.log(err);
  }
});

// router.get("/api/pricingsListForest", async (req, res) => {
//   try {
//     let optionList = [];
//     const wordValue = await pricings.findOne({ pricingsType: "Prix par mot" });

//     // const allpricings = await pricings.find();
//     // console.log(wordValue);
//     // console.log(allpricings);
//     if (wordValue) {
//       optionList = ["Option"];
//     } else {
//       optionList = ["Option", "Prix par mot"];
//     }
//     // console.log(optionList);
//     res.json({ data: optionList });
//   } catch (err) {
//     console.log(err);
//   }
// });

module.exports = router;
