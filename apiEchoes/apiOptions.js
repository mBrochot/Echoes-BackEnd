const express = require("express");
const router = express.Router();
const _ = require("lodash");

const Options = require("../models/options");

router.get("/api/options", async (req, res) => {
  function precise_round(num, decimals) {
    var t = Math.pow(10, decimals);
    return (
      Math.round(
        num * t +
          (decimals > 0 ? 1 : 0) *
            (Math.sign(num) * (10 / Math.pow(100, decimals)))
      ) / t
    ).toFixed(decimals);
  }

  try {
    let allOptions = await Options.find();
    for (let i = 0; i < allOptions.length; i++) {
      const element = allOptions[i];
      element.amount = precise_round(element.amount, 2);
      // console.log(element.amount);
    }
    allOptions = _.orderBy(allOptions, ["optionsType"], ["desc"]);
    res.json(allOptions);
  } catch (err) {
    console.log(err);
  }
});

// router.get("/api/optionsListForest", async (req, res) => {
//   try {
//     let optionList = [];
//     const wordValue = await Options.findOne({ optionsType: "Prix par mot" });

//     // const allOptions = await Options.find();
//     // console.log(wordValue);
//     // console.log(allOptions);
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
