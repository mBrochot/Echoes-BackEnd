const { collection } = require("forest-express-mongoose");
const Options = require("../models/options");

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection("options", {
  actions: [],
  fields: [],
  segments: [
    {
      name: "Prix / mots",
      where: (options) => {
        return Options.find({ optionsType: "Prix par mot" }).then((options) => {
          let optionsIds = [];
          options.forEach((options) => {
            optionsIds.push(options._id);
          });
          return { _id: { $in: optionsIds } };
        });
      },
    },
    {
      name: "Prix / épisodes",
      where: (options) => {
        return Options.find({ optionsType: "Prix par épisode" }).then(
          (options) => {
            let optionsIds = [];
            options.forEach((options) => {
              optionsIds.push(options._id);
            });
            return { _id: { $in: optionsIds } };
          }
        );
      },
    },
  ],
});
