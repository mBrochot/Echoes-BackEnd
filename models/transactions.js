const mongoose = require("mongoose");
const schema = mongoose.Schema({
  date: Date,
  episodeId: String,
  userId: String,
  amount: Number,
  paymentToken: String,
  status: String,
});

module.exports = mongoose.model("transactions", schema, "transactions");
