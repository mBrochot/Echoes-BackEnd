const mongoose = require("mongoose");
const requireAll = require("require-all");

const models = {};

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

function filterFile(filename) {
  if (filename.endsWith(".js") && filename !== "index.js") {
    return filename;
  }

  return false;
}

const modelsList = requireAll({
  dirname: __dirname,
  filter: (filename) => filterFile(filename),
});

Object.keys(modelsList).forEach((filename) => {
  const model = modelsList[filename];
  models[model.modelName] = model;
});

module.exports = models;
