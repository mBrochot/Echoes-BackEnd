const express = require("express");
const {
  PermissionMiddlewareCreator,
  RecordCreator,
  RecordUpdater,
  RecordRemover,
  RecordsRemover,
  RecordsGetter,
} = require("forest-express-mongoose");
const { options } = require("../models");

const Option = require("../models/options");

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator("options");

// This file contains the logic of every route in Forest Admin for the collection options:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Option
router.post(
  "/options",
  permissionMiddlewareCreator.create(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
    // next();
    const recordCreator = new RecordCreator(options);
    recordCreator.deserialize(request.body).then((recordToCreate) =>
      // Inserer les fonctions ici
      recordToCreate.amount <= 0 || !recordToCreate.amount
        ? response
            .status(400)
            .send("Vous ne pouvez pas entrer un montant nul ou inférieur à 0")
        : !recordToCreate.optionsType || !recordToCreate.title
        ? response.status(400).send("Titre ou type d'option manquant")
        : recordCreator
            .create(recordToCreate, request.params.recordId)
            .then((record) => recordCreator.serialize(record))
            .then((recordSerialized) => response.send(recordSerialized))
            .catch(next)
    );
  }
);

// Update a Option
router.put(
  "/options/:recordId",
  permissionMiddlewareCreator.update(),
  (request, response, next) => {
    const recordUpdater = new RecordUpdater(options);
    recordUpdater.deserialize(request.body).then((recordToUpdate) =>
      recordToUpdate.amount <= 0 || recordToUpdate.amount === null
        ? response
            .status(400)
            .send("Vous ne pouvez pas entrer un montant nul ou inférieur à 0")
        : !recordToCreate.optionsType || !recordToCreate.title
        ? response.status(400).send("Titre ou type d'option manquant")
        : recordUpdater
            .update(recordToUpdate, request.params.recordId)
            .then((record) => recordUpdater.serialize(record))
            .then((recordSerialized) => response.send(recordSerialized))
            // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
            .catch(next)
    );
  }
);

// Delete a Option
router.delete(
  "/options/:recordId",
  permissionMiddlewareCreator.delete(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
    next();
  }
);

// Get a list of options
router.get(
  "/options",
  permissionMiddlewareCreator.list(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
    next();
  }
);

// Get a number of options
router.get(
  "/options/count",
  permissionMiddlewareCreator.list(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
    next();
  }
);

// Get a Option
router.get(
  "/options/:recordId",
  permissionMiddlewareCreator.details(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
    next();
  }
);

// Export a list of options
router.get(
  "/options.csv",
  permissionMiddlewareCreator.export(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
    next();
  }
);

// Delete a list of options
router.delete(
  "/options",
  permissionMiddlewareCreator.delete(),
  (request, response, next) => {
    // new RecordsGetter(options)
    //   .getIdsFromRequest(request)
    //   .then(async (ids) => {
    //     for (let i = 0; i < ids.length; i++) {
    //       const id = ids[i];
    //       const opt = await options.findById(id);
    //       console.log(opt);
    //     }

    //     return response
    //       .status(403)
    //       .json({ error: "vous ne pouvez pas supprimer" });

    // const recordsRemover = new RecordsRemover(options);
    // recordsRemover.remove(ids)
    //   .then(() => response.status(204).send())
    //   .catch(next);
    // })
    // .catch(next);

    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
    next();
  }
);

module.exports = router;
