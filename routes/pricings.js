const express = require("express");
const {
  PermissionMiddlewareCreator,
  RecordCreator,
  RecordUpdater,
  RecordRemover,
  RecordsRemover,
  RecordsGetter,
} = require("forest-express-mongoose");
const { pricings } = require("../models");

const pricing = require("../models/pricings");

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator("pricings");

// This file contains the logic of every route in Forest Admin for the collection pricings:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a pricing
router.post(
  "/pricings",
  permissionMiddlewareCreator.create(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
    // next();
    const recordCreator = new RecordCreator(pricings);
    recordCreator.deserialize(request.body).then((recordToCreate) =>
      recordToCreate.amount <= 0 || !recordToCreate.amount
        ? response
            .status(400)
            .send("Vous ne pouvez pas entrer un montant nul ou inférieur à 0")
        : !recordToCreate.nbMotsInf || !recordToCreate.nbMotsSup
        ? response.status(400).send("Valeur(s) d'intervalle manquante(s)")
        : recordCreator
            .create(recordToCreate, request.params.recordId)
            .then((record) => recordCreator.serialize(record))
            .then((recordSerialized) => response.send(recordSerialized))
            .catch(next)
    );
  }
);

// Update a pricing
router.put(
  "/pricings/:recordId",
  permissionMiddlewareCreator.update(),
  (request, response, next) => {
    const recordUpdater = new RecordUpdater(pricings);
    recordUpdater.deserialize(request.body).then((recordToUpdate) =>
      recordToUpdate.amount <= 0 || recordToUpdate.amount === null
        ? response
            .status(400)
            .send("Vous ne pouvez pas entrer un montant nul ou inférieur à 0")
        : recordToUpdate.nbMotsInf === null || recordToUpdate.nbMotsSup === null
        ? response.status(400).send("Valeur(s) d'intervalle manquante(s)")
        : recordUpdater
            .update(recordToUpdate, request.params.recordId)
            .then((record) => recordUpdater.serialize(record))
            .then((recordSerialized) => response.send(recordSerialized))
            // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
            .catch(next)
    );
  }
);

// Delete a pricing
router.delete(
  "/pricings/:recordId",
  permissionMiddlewareCreator.delete(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
    next();
  }
);

// Get a list of pricings
router.get(
  "/pricings",
  permissionMiddlewareCreator.list(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
    next();
  }
);

// Get a number of pricings
router.get(
  "/pricings/count",
  permissionMiddlewareCreator.list(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
    next();
  }
);

// Get a pricing
router.get(
  "/pricings/:recordId",
  permissionMiddlewareCreator.details(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
    next();
  }
);

// Export a list of pricings
router.get(
  "/pricings.csv",
  permissionMiddlewareCreator.export(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
    next();
  }
);

// Delete a list of pricings
router.delete(
  "/pricings",
  permissionMiddlewareCreator.delete(),
  (request, response, next) => {
    next;

    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  }
);

module.exports = router;
