const express = require("express");
const {
  PermissionMiddlewareCreator,
  RecordUpdater,
  RecordsGetter,
} = require("forest-express-mongoose");
const { episodes, users } = require("../models");
const cloudinary = require("cloudinary").v2;

const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator("episodes");

// This file contains the logic of every route in Forest Admin for the collection episodes:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

/* router.post(
  "/actions/updateSerena",
  permissionMiddlewareCreator.smartAction(),
  async (req, res) => {
    console.log(req.body.data.attributes);
    const update = await episodes.updateMany(
      {},
      { user: "5f3e715628c70400177a73fa" }
    );
    if (update) return res.status(204).send({ success: "ok" });
  }
); */

// Envoyer extrait audio
router.post(
  "/actions/send/:type",
  permissionMiddlewareCreator.smartAction(),
  (req, res) => {
    // console.log(req.body.data.attributes);
    return new RecordsGetter(episodes)
      .getIdsFromRequest(req)
      .then(async (episodesIds) => {
        const episodeId = episodesIds[0];
        const {
          "Titre de l'épisode": title,
          "Texte de l'épisode": text,
          "Voix sélectionnée": voice,
          "Lien de l'extrait audio": linkExtract,
          "Lien de l'audio final": linkFinal,
          "Message d'accompagnement": message,
        } = req.body.data.attributes.values;

        const episode = await episodes.findById(episodeId);
        let status = episode.status;
        /* console.log(status); */
        let canUpdate = false;
        let dataToUpdate = {};

        if (req.params.type === "extract") {
          if (status === "1 - En attente Echoes") {
            status = "2 - En attente validation";
            canUpdate = true;
            //
            {
              title && (dataToUpdate["echoesInfos.nameEchoes"] = title);
            }
            {
              message && (dataToUpdate["echoesInfos.messageEchoes"] = message);
            }
            {
              voice && (dataToUpdate["echoesInfos.voiceNameEchoes"] = voice);
            }
            {
              text &&
                (dataToUpdate["echoesInfos.textToTransformEchoes"] = text);
            }
            dataToUpdate["echoesInfos.audioEchoes.extractEchoes"] = linkExtract;
          }
        } else {
          if (status === "3 - En production") {
            status = "4 - En attente validation";
            canUpdate = true;
            //
            {
              message && (dataToUpdate["echoesInfos.messageEchoes"] = message);
            }
            dataToUpdate["echoesInfos.audioEchoes.finalEchoes"] = linkFinal;
          }
        }
        dataToUpdate.status = status;
        dataToUpdate.timestamp = Date.now();
        /* console.log(dataToUpdate); */
        if (canUpdate) {
          const updateEpisode = await episodes.findByIdAndUpdate(
            episodeId,
            dataToUpdate
          );
          if (updateEpisode) {
            res
              .status(200)
              .send({ success: "L'épisode a bien été mis à jour" });

            // création de transporter nodemailer
            const transporter = nodemailer.createTransport({
              service: `gmail`,
              auth: {
                user: `${process.env.EMAIL_ADDRESS}`,
                pass: `${process.env.EMAIL_PASSWORD}`,
              },
            });

            // model du mail qui va etre transmis au client
            const mailData = {
              from: "Echoes.com",
              to: `${episode.user.email}`,
              subject: `L'épisode "${episode.clientInfos.name}" à changé de statut`,
              text: `Bonjour ${
                episode.user.name
              },\n\n\nIl y a du nouveau concernant vôtre épisode ${
                episode.clientInfos.name
              }\n\nCliquez sur le liens ci-dessous pour plus de détails.\n\n\ ${
                process.env.URL
              }/production/${
                status === "2 - En attente validation"
                  ? "thumbnail"
                  : "complete"
              }/${episode._id}\n\n\n\nLa team Echoes\n\n`,
            };

            // envoie de l'email
            transporter.sendMail(mailData, (err, response) => {
              if (err) {
                console.error("there was an error: ", err);
              } else {
                console.log("here is the res: ", response);
                res.status(200).json({ status: 200 });
              }
            });
          } else {
            res.status(403).send({
              error:
                "Il y a eu un problème lors de la sauvegarde en base de données.",
            });
          }
        } else {
          res.status(403).send({ error: "Mise à jour interdite" });
        }
      });
  }
);

// Get the current user id
// const episodeId = req.body.data.attributes.ids[0];
// console.log(req);
// Get the values of the input fields entered by the user.
// const attrs = req.body.data.attributes.values;
// let audio_extract = attrs["audio_extract"];
// let audio_final_file = attrs["audio_final_file"];

// console.log(audio_extract);
// // upload the file and create the new file with the url returned from Cloudinary.
// cloudinary.uploader
//   .upload(document)
//   .then((result) => {
//     episode.update((echoesInfos.audioEchoes.extractEchoes = result.url));

//     // files.create({
//     //   entity_id: { _id: episodeId },
//     //   name: fileName,
//     //   type: result.resource_type,
//     //   url: result.url,
//     // });
//   })
//   .then(() => res.send({ success: "File uploaded" }));

// Get the values of the input fields entered by the admin user.
// let attrs = req.body.data.attributes.values;

// return P.all([
//   uploadAudioFile(companyId, audio_extract, "audio_extract_id"),
//   uploadAudioFile(companyId, audio_final_file, "audio_final_file_id"),
// ]).then(() => {
//   // Once the upload is finished, send a success message to the admin user in the UI.
//   res.send({ success: "Fichier(s) uploadés !" });
// });
//   }
// );

// Create a Episode
router.post(
  "/episodes",
  permissionMiddlewareCreator.create(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
    next();
  }
);

// Update a Episode
router.put(
  "/episodes/:recordId",
  permissionMiddlewareCreator.update(),
  (request, response, next) => {
    const recordUpdater = new RecordUpdater(episodes);
    recordUpdater
      .deserialize(request.body)
      .then(async (recordToUpdate) => {
        // A MODIFIER
        const toto = {
          nameEchoes: "echoesInfos.nameEchoes",
          messageEchoes: "echoesInfos.messageEchoes",
          textToTransformEchoes: "echoesInfos.textToTransformEchoes",
          voiceNameEchoes: "echoesInfos.voiceNameEchoes",
          extractEchoes: "echoesInfos.audioEchoes.extractEchoes",
          finalEchoes: "echoesInfos.audioEchoes.finalEchoes",
          durationEchoes: "echoesInfos.audioEchoes.durationEchoes",
        };

        const arr = Object.keys(toto);
        const recordToUpdateArr = Object.keys(recordToUpdate);
        const elementsToUpdate = {};
        for (let i = 0; i < arr.length; i++) {
          const element = arr[i];
          if (recordToUpdateArr.indexOf(element) > -1) {
            elementsToUpdate[toto[element]] = recordToUpdate[element];
          }
        }
        recordToUpdate = { ...recordToUpdate, ...elementsToUpdate };

        return recordUpdater.update(recordToUpdate, request.params.recordId);
      })
      .then((record) => recordUpdater.serialize(record))
      .then((recordSerialized) => response.send(recordSerialized))
      .catch(next);

    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
    // next();
  }
);

// Delete a Episode
//
// Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
router.delete(
  "/episodes/:recordId",
  permissionMiddlewareCreator.delete(),
  async (req, res, next) => {
    const episode = await episodes.findById(req.params.recordId);

    const updateUser = await users.findByIdAndUpdate(episode.user, {
      $pull: { episodes: req.params.recordId },
    });

    if (updateUser) {
      next();
    } else {
      return res
        .status(403)
        .send({ error: "L'épisode n'a pas pu être supprimé !" });
    }
  }
);

// Get a list of Episodes
router.get(
  "/episodes",
  permissionMiddlewareCreator.list(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
    next();
  }
);

// Get a number of Episodes
router.get(
  "/episodes/count",
  permissionMiddlewareCreator.list(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
    next();
  }
);

// Get a Episode
router.get(
  "/episodes/:recordId",
  permissionMiddlewareCreator.details(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
    next();
  }
);

// Export a list of Episodes
router.get(
  "/episodes.csv",
  permissionMiddlewareCreator.export(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
    next();
  }
);

// Delete a list of Episodes
//
// Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
router.delete(
  "/episodes",
  permissionMiddlewareCreator.delete(),
  (req, res, next) => {
    const episodesId = req.body.data.attributes.ids;
    episodesId.map(async (episodeId) => {
      const episode = await episodes.findById(episodeId);
      const updateUser = await users.findByIdAndUpdate(
        episode.user,
        {
          $pull: { episodes: episodeId },
        },
        []
      );
      if (updateUser) {
        next();
      } else {
        return res
          .status(403)
          .send({ error: "L'épisode n'a pas pu être supprimé !" });
      }
    });
  }
);

module.exports = router;
