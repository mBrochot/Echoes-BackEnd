// Route avec CREATE, FIND ONE, FIND ALL, UPDATE, DELETE
const express = require("express");
const router = express.Router();
const apiIsAuthenticated = require("./apiIsAuthenticated");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const User = require("../models/users");
const Episode = require("../models/episodes");
const Transaction = require("../models/transactions");

router.post("/api/payment", apiIsAuthenticated, async (req, res) => {
  const stripeToken = req.body.stripeToken;
  // console.log({ stripeToken });
  try {
    const arrondi = Math.round(req.body.amount);
    //   Créer la transaction
    const response = await stripe.charges.create({
      amount: arrondi,
      currency: "eur",
      description: req.body.description,
      source: stripeToken,
    });

    return res.json(response);

    // const userData = await User.findById(req.body.userRefId);
    // const episodeData = await Episode.findOne({
    //   episodeId: req.body.episodeId,
    // });

    // if (userData && episodeData) {
    //   const transaction = new Transaction({
    //     date: Date.now,
    //     episodeId: episodeData.episodeId,
    //     userId: userData._id,
    //     amount: {
    //       totalAmount: req.body.amount,
    //     },
    //     paymentToken: req.body.token,
    //     status: "success",
    //   });
    //   await transaction.save();

    //   res.status(200).json(response);
    // }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
