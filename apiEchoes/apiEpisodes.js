// Route avec CREATE, FIND ONE, FIND ALL, UPDATE, DELETE
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const wordsCount = require("words-count");

const uid2 = require("uid2");
const apiIsAuthenticated = require("./apiIsAuthenticated");

const Episode = require("../models/episodes");
const User = require("../models/users");
const Options = require("../models/options");
const Pricings = require("../models/pricings");

// CREER UN NOUVEL EPISODE
router.post("/api/create-episode", apiIsAuthenticated, async (req, res) => {
  try {
    const lastDate = Date.now();
    const episodeId = uid2(16);

    const userFound = await User.findOne({
      _id: req.user._id,
    });

    const optionsOrdered = await req.body.clientInfos.options.filter(
      (option) => option.status === true
    );
    const wordsNumber = wordsCount(req.body.clientInfos.textToTransform);

    // Calculer le total du texte
    let textPricing = 0;
    const priceToFind = await Pricings.find();
    for (let i = 0; i < priceToFind.length; i++) {
      if (
        wordsNumber >= priceToFind[i].nbMotsInf &&
        wordsNumber <= priceToFind[i].nbMotsSup
      ) {
        textPricing = priceToFind[i].amount;
      }
    }
    textTotalAmount = textPricing * wordsNumber;

    // Calculer le total des options
    let optionsTotalAmount = 0;
    for (let i = 0; i < optionsOrdered.length; i++) {
      // console.log(optionsOrdered[i]._id);
      const optionToFind = await Options.findById(optionsOrdered[i]._id);
      if (optionToFind.optionsType === "Prix par mot") {
        optionsTotalAmount =
          optionsTotalAmount + optionToFind.amount * wordsNumber;
      } else {
        optionsTotalAmount = optionsTotalAmount + optionToFind.amount;
      }
    }

    // Création du document Episode
    const episode = await new Episode({
      timestamp: lastDate,
      episodeId: episodeId,
      status: req.body.status,
      user: req.user._id,
      clientInfos: {
        name: req.body.clientInfos.name,
        voice: {
          voiceName: req.body.clientInfos.voice.voiceName,
          voiceType: req.body.clientInfos.voice.voiceType,
          voiceHeight: req.body.clientInfos.voice.voiceHeight,
          voiceTempo: req.body.clientInfos.voice.voiceTempo,
        },
        adjectives: req.body.clientInfos.adjectives,
        options: req.body.clientInfos.options,
        comments: {
          commentsOrder: req.body.clientInfos.comments.commentsOrder,
        },
        price: textTotalAmount + optionsTotalAmount,
        textToTransform: req.body.clientInfos.textToTransform,
      },
    });
    await episode.save();
    await userFound.episodes.push(episode);
    await userFound.save();
    res.status(200).json(episode);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// AFFICHER LES INFORMATIONS DU BROUILLON
router.get(
  "/api/episodes/draft/:episodeId",
  apiIsAuthenticated,
  async (req, res) => {
    try {
      const userFound = await User.findOne({
        _id: req.user._id,
      });
      if (userFound) {
        const episodeFound = await Episode.findOne({
          _id: req.params.episodeId,
        });
        if (episodeFound) {
          // COMPARER LA LISTE SAUVEGARDEE AVEC L'ACTUELLE
          res.status(200).json(episodeFound);
        } else {
          res
            .status(404)
            .json({ error: "This episode does not exist in the database" });
        }
      } else {
        res
          .status(404)
          .json({ error: "This user does not exist in the database" });
      }
    } catch (err) {
      res.status(400).json(err.message);
    }
  }
);

// AFFICHER LES INFORMATIONS D'UN EPISODE
router.get("/api/episodes/:episodeId", apiIsAuthenticated, async (req, res) => {
  try {
    const userFound = await User.findOne({
      _id: req.user._id,
    });
    if (userFound) {
      const episodeFound = await Episode.findOne({
        _id: req.params.episodeId,
      });
      if (episodeFound) {
        res.status(200).json(episodeFound);
      } else {
        res
          .status(404)
          .json({ error: "This episode does not exist in the database" });
      }
    } else {
      res
        .status(404)
        .json({ error: "This user does not exist in the database" });
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// UPDATER LE DRAFT D'UN EPISODE DEJA ENREGISTRE
router.post(
  "/api/episodes/update/:episodeId",
  apiIsAuthenticated,
  async (req, res) => {
    const lastDate = Date.now();

    try {
      const userFound = await User.findOne({
        _id: req.user._id,
      });
      if (userFound) {
        const episodeFound = await Episode.findOne({
          _id: req.params.episodeId,
        });
        if (episodeFound) {
          let optionsOrdered = [];
          let wordsNumber = 0;
          req.body.clientInfos.options &&
            (optionsOrdered = await req.body.clientInfos.options.filter(
              (option) => option.status === true
            ));
          req.body.clientInfos.textToTransform &&
            (wordsNumber = wordsCount(req.body.clientInfos.textToTransform));

          // Calculer le total du texte
          let textPricing = 0;
          const priceToFind = await Pricings.find();

          for (let i = 0; i < priceToFind.length; i++) {
            if (
              wordsNumber >= priceToFind[i].nbMotsInf &&
              wordsNumber <= priceToFind[i].nbMotsSup
            ) {
              textPricing = priceToFind[i].amount;
            }
          }
          textTotalAmount = textPricing * wordsNumber;

          // Calculer le total des options
          let optionsTotalAmount = 0;
          for (let i = 0; i < optionsOrdered.length; i++) {
            const optionToFind = await Options.findById(optionsOrdered[i]._id);

            if (optionsOrdered[i].status === true) {
              if (optionToFind.optionsType === "Prix par mot") {
                optionsTotalAmount =
                  optionsTotalAmount + optionToFind.amount * wordsNumber;
              } else {
                optionsTotalAmount = optionsTotalAmount + optionToFind.amount;
              }
            }
          }

          episodeFound.status = req.body.status;
          episodeFound.timestamp = lastDate;
          episodeFound.clientInfos = {
            name: req.body.clientInfos.name,
            voice: {
              voiceName: req.body.clientInfos.voice.voiceName,
              voiceType: req.body.clientInfos.voice.voiceType,
              voiceHeight: req.body.clientInfos.voice.voiceHeight,
              voiceTempo: req.body.clientInfos.voice.voiceTempo,
            },
            adjectives: req.body.clientInfos.adjectives,
            options: req.body.clientInfos.options,
            price: textTotalAmount + optionsTotalAmount,
            textToTransform: req.body.clientInfos.textToTransform,
            comments: {
              commentsOrder: req.body.clientInfos.comments.commentsOrder,
            },
          };
          await episodeFound.save();
          // console.log(episodeFound);
          res.status(200).json(episodeFound);
        } else {
          res
            .status(404)
            .json({ error: "This episode does not exist in the database" });
        }
      } else {
        res
          .status(404)
          .json({ error: "This user does not exist in the database" });
      }
    } catch (err) {
      res.status(400).json(err.message);
    }
  }
);

// VALIDER LA COMMANDE D'UN DRAFT
router.post(
  "/api/episodes/update/:episodeId",
  apiIsAuthenticated,
  async (req, res) => {
    const lastDate = Date.now();
    try {
      const userFound = await User.findOne({
        _id: req.user._id,
      });
      if (userFound) {
        const episodeFound = await Episode.findOne({
          _id: req.params.episodeId,
        });

        if (episodeFound) {
          episodeFound.status = req.body.status;
          episodeFound.timestamp = lastDate;

          await episodeFound.save();
          // console.log(episodeFound);
          res.status(200).json(episodeFound);
        } else {
          res
            .status(404)
            .json({ error: "This episode does not exist in the database" });
        }
      } else {
        res
          .status(404)
          .json({ error: "This user does not exist in the database" });
      }
    } catch (err) {
      res.status(400).json(err.message);
    }
  }
);

// LANCER LA PRODUCTION DE L'EPISODE (démo validée)
router.post(
  "/api/episodes/launchProduction/:episodeId",
  apiIsAuthenticated,
  async (req, res) => {
    const lastDate = Date.now();
    try {
      const userFound = await User.findOne({
        _id: req.user._id,
      });
      if (userFound) {
        const episodeFound = await Episode.findOne({
          _id: req.params.episodeId,
        });
        if (episodeFound) {
          episodeFound.timestamp = lastDate;
          req.body.status && (episodeFound.status = req.body.status);
          req.body.commentsDemo &&
            (episodeFound.clientInfos.comments.commentsDemo =
              req.body.commentsDemo);

          await episodeFound.save();
          res.status(200).json("Production ongoing");
        } else {
          res
            .status(404)
            .json({ error: "This episode does not exist in the database" });
        }
      } else {
        res
          .status(404)
          .json({ error: "This user does not exist in the database" });
      }
    } catch (err) {
      res.status(400).json(err.message);
    }
  }
);

// VALIDER L'EPISODE (derniere etape)
router.post(
  "/api/episodes/validate/:episodeId",
  apiIsAuthenticated,
  async (req, res) => {
    const lastDate = Date.now();
    // Recalcul du Pricing - A voir en V2 si on garde en back
    try {
      const userFound = await User.findOne({
        _id: req.user._id,
      });
      if (userFound) {
        const episodeFound = await Episode.findOne({
          _id: req.params.episodeId,
        });
        if (episodeFound) {
          episodeFound.timestamp = lastDate;
          req.body.status && (episodeFound.status = req.body.status);
          req.body.descriptionForPlatforms &&
            (episodeFound.clientInfos.descriptionForPlatforms =
              req.body.descriptionForPlatforms);
          req.body.commentsRecording &&
            (episodeFound.clientInfos.comments.commentsRecording =
              req.body.commentsRecording);

          await episodeFound.save();
          res.status(200).json("Episode completed");
        } else {
          res
            .status(404)
            .json({ error: "This episode does not exist in the database" });
        }
      } else {
        res
          .status(404)
          .json({ error: "This user does not exist in the database" });
      }
    } catch (err) {
      res.status(400).json(err.message);
    }
  }
);

// AFFICHER TOUS LES EPISODES
router.get("/api/episodes", apiIsAuthenticated, async (req, res) => {
  try {
    const userFound = await User.findOne({
      _id: req.user._id,
    }).populate("episodes");

    if (userFound) {
      let sortedEpisodes = _.orderBy(
        userFound.episodes,
        ["timestamp"],
        ["desc"]
      );

      return res.status(200).json(sortedEpisodes);
    } else {
      res
        .status(404)
        .json({ error: "This user does not exist in the database" });
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
});

router.get("/api/episodesPopulate", apiIsAuthenticated, async (req, res) => {
  try {
    const userFound = await User.findOne({
      _id: req.user._id,
    }).populate("episodes");

    if (userFound) {
      let sortedEpisodes = _.orderBy(
        userFound.episodes,
        ["timestamp"],
        ["desc"]
      );

      return res
        .status(200)
        .json(
          sortedEpisodes.length > 5
            ? sortedEpisodes.slice(0, 5)
            : sortedEpisodes
        );
    } else {
      res
        .status(404)
        .json({ error: "This user does not exist in the database" });
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// SUPPRIMER EPISODE
router.get(
  "/api/episodes/delete/:episodeId",
  apiIsAuthenticated,
  async (req, res) => {
    try {
      const userFound = await User.findOne({
        _id: req.user._id,
      });

      if (userFound) {
        const episodeFound = await Episode.findOne({
          _id: req.params.episodeId,
        });

        if (episodeFound) {
          await episodeFound.deleteOne();
          for (let i = 0; i < userFound.episodes.length; i++) {
            if (String(userFound.episodes[i]) === String(episodeFound._id)) {
              userFound.episodes.splice(i, 1);
            }
          }
          await userFound.save();
          res.status(200).json("Episode deleted");
        } else {
          res
            .status(404)
            .json({ error: "This episode does not exist in the database" });
        }
      } else {
        res
          .status(404)
          .json({ error: "This user does not exist in the database" });
      }
    } catch (err) {
      res.status(400).json(err.message);
    }
  }
);

module.exports = router;
