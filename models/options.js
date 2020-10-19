const mongoose = require("mongoose");
const schema = mongoose.Schema({
  title: String,
  optionsType: String,
  amount: Number,
  status: { type: Boolean, default: false },
});

module.exports = mongoose.model("options", schema, "options");
