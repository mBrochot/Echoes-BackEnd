const mongoose = require("mongoose");

const schema = mongoose.Schema({
  timestamp: Date,
  programmeName: String,
  podcastUse: String,
  podcastType: String,
  podcastTone: String,
  minPrice: Number,
  maxPrice: Number,
  reference: String,
  launch: String,
  frequence: String,
  other: String,
  email: String,
  status: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = mongoose.model("devis", schema, "devis");
