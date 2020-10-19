const { collection } = require("forest-express-mongoose");

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection("users", {
  actions: [],
  fields: [
    {
      field: "fullname",
      type: "String",
      get: (user) => {
        if (user.name) {
          return user.firstName + " " + user.name.toUpperCase();
        }
      },
    },
    {
      field: "companyName",
      type: "String",
      get: (user) => {
        if (user.company) {
          if (user.company.companyName) return user.company.companyName;
        }
      },
    },
  ],
  segments: [],
});
