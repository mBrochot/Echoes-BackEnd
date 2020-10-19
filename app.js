const express = require("express");
const requireAll = require("require-all");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("express-jwt");
const morgan = require("morgan");
const { errorHandler, logger } = require("forest-express");
const {
  ensureAuthenticated,
  PUBLIC_ROUTES,
} = require("forest-express-mongoose");

const app = express();

// Call des routes API
const userRoutes = require("./apiEchoes/apiUsers");
const episodeRoutes = require("./apiEchoes/apiEpisodes");
const transactionRoutes = require("./apiEchoes/apiTransactions");
const devisRoutes = require("./apiEchoes/apiDevis");
const cloudinaryRoutes = require("./apiEchoes/apiCloudinary");
const optionsRoutes = require("./apiEchoes/apiOptions");
const pricingsRoutes = require("./apiEchoes/apiPricings");
const statusRoutes = require("./apiEchoes/apiStatus");

app.use(morgan("tiny"));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

let allowedOrigins = [/\.forestadmin\.com$/, /\.netlify\.app$/, /\.ngrok\.io$/];

if (process.env.CORS_ORIGINS) {
  allowedOrigins = allowedOrigins.concat(process.env.CORS_ORIGINS.split(","));
}

app.use(
  cors({
    origin: allowedOrigins,
    allowedHeaders: ["Authorization", "X-Requested-With", "Content-Type"],
    maxAge: 86400, // NOTICE: 1 day
    credentials: true,
  })
);

app.use(userRoutes);
app.use(episodeRoutes);
app.use(transactionRoutes);
app.use(devisRoutes);
app.use(cloudinaryRoutes);
app.use(optionsRoutes);
app.use(pricingsRoutes);
app.use(statusRoutes);

app.use(
  jwt({
    secret: process.env.FOREST_AUTH_SECRET,
    credentialsRequired: false,
  })
);

app.use("/forest", (request, response, next) => {
  if (PUBLIC_ROUTES.includes(request.url)) {
    return next();
  }
  return ensureAuthenticated(request, response, next);
});

requireAll({
  dirname: path.join(__dirname, "routes"),
  recursive: true,
  resolve: (Module) => app.use("/forest", Module),
});

requireAll({
  dirname: path.join(__dirname, "middlewares"),
  recursive: true,
  resolve: (Module) => Module(app),
});

app.use(errorHandler({ logger }));

module.exports = app;
