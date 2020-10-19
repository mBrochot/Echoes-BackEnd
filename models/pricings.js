const mongoose = require("mongoose");
const schema = mongoose.Schema({
  nbMotsInf: Number,
  nbMotsSup: Number,
  amount: Number,
});

module.exports = mongoose.model("pricings", schema, "pricings");
