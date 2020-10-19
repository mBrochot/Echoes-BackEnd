const { collection } = require("forest-express-mongoose");

const Episodes = require("../models/episodes");

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection("episodes", {
  actions: [
    {
      name: "Mettre à jour le user",
      type: "global",
      endpoint: "/forest/actions/updateSerena",
    },
    {
      name: "Envoyer l'extrait",
      type: "single",
      fields: [
        {
          field: "Titre de l'épisode",
          isRequired: false,
          description: "",
          type: "String",
        },
        {
          field: "Texte de l'épisode",
          isRequired: false,
          description: "",
          type: "String",
          widget: "text area",
        },
        {
          field: "Voix sélectionnée",
          isRequired: false,
          description: "",
          type: "String",
        },
        {
          field: "Lien de l'extrait audio",
          isRequired: true,
          description: "",
          type: "String",
        },
        {
          field: "Message d'accompagnement",
          isRequired: false,
          description: "",
          type: "String",
          widget: "text area",
        },
      ],
      endpoint: "/forest/actions/send/extract",
    },
    {
      name: "Envoyer le fichier final",
      type: "single",
      fields: [
        {
          field: "Lien de l'audio final",
          isRequired: true,
          description: "",
          type: "String",
        },
        {
          field: "Message d'accompagnement",
          isRequired: false,
          description: "",
          type: "String",
          widget: "text area",
        },
      ],
      endpoint: "/forest/actions/send/final",
    },
  ],
  fields: [
    {
      field: "demandeClient",
      type: "String",
      get: (episode) => {
        if (episode.clientInfos.voice) {
          voix = episode.clientInfos.voice.voiceName;
        } else {
          voix =
            "Tempo : " +
            (episode.clientInfos.voice
              ? episode.clientInfos.voice.voiceTempo
              : "") +
            "\t" +
            "Hauteur : " +
            (episode.clientInfos.voice
              ? episode.clientInfos.voice.voiceHeight
              : "") +
            "\t" +
            "Type : " +
            (episode.clientInfos.voice
              ? episode.clientInfos.voice.voiceType
              : "");
        }
        return (
          "__________________________________________________________________" +
          "\n" +
          "\n" +
          "Nom de l'épisode : " +
          "\n" +
          episode.clientInfos.name +
          "\n" +
          "\n" +
          "Adjectifs de la marque : " +
          "\n" +
          episode.clientInfos.adjectives +
          "\n" +
          "\n" +
          "Voix : " +
          "\n" +
          voix +
          "\n" +
          "\n" +
          "Texte à transformer en audio : " +
          "\n" +
          episode.clientInfos.textToTransform +
          "\n" +
          "\n" +
          "Commentaires du client sur sa commande : " +
          "\n" +
          episode.clientInfos.comments.commentsOrder +
          "\n" +
          "\n" +
          "\n" +
          "Dernière update le : " +
          episode.timestamp +
          "\n" +
          "\n" +
          "Montant de la commande : " +
          episode.clientInfos.price +
          "\n" +
          "__________________________________________________________________" +
          "\n" +
          "\n"
        );
      },
    },

    {
      field: "nomDeLEpisode",
      type: "String",
      get: (episode) => {
        return episode.clientInfos.name;
      },
    },

    {
      field: "envoiDemandeEchoes",
      type: "String",
      get: (episode) => {
        return (
          "__________________________________________________________________" +
          "\n"
        );
      },
    },

    {
      field: "CommentairsDuClientSurLExtrait",
      type: "String",
      get: (episode) => {
        return (
          "__________________________________________________________________" +
          "\n" +
          "\n" +
          episode.clientInfos.comments.commentsDemo +
          "\n" +
          "__________________________________________________________________" +
          "\n" +
          "\n"
        );
      },
    },
    {
      field: "CommentairsDuClientSurLaVersionFinale",
      type: "String",
      get: (episode) => {
        return (
          "__________________________________________________________________" +
          "\n" +
          "\n" +
          "Commentaires : " +
          "\n" +
          episode.clientInfos.comments.commentsRecording +
          "\n" +
          "\n" +
          "\n" +
          "Texte pour les plateformes : " +
          "\n" +
          episode.clientInfos.descriptionForPlatforms +
          "\n" +
          "__________________________________________________________________" +
          "\n" +
          "\n"
        );
      },
    },

    {
      field: "nameEchoes",
      type: "String",
      get: (episode) => {
        return episode.echoesInfos.nameEchoes;
      },
    },
    {
      field: "messageEchoes",
      type: "String",
      get: (episode) => {
        return episode.echoesInfos.messageEchoes;
      },
    },
    {
      field: "textToTransformEchoes",
      type: "String",
      get: (episode) => {
        return episode.echoesInfos.textToTransformEchoes;
      },
    },
    {
      field: "voiceNameEchoes",
      type: "String",
      get: (episode) => {
        return episode.echoesInfos.voiceNameEchoes;
      },
    },
    {
      field: "extractEchoes",
      type: "String",
      get: (episode) => {
        return episode.echoesInfos.audioEchoes.extractEchoes;
      },
    },
    {
      field: "finalEchoes",
      type: "String",
      get: (episode) => {
        return episode.echoesInfos.audioEchoes.finalEchoes;
      },
    },
    {
      field: "durationEchoes",
      type: "String",
      get: (episode) => {
        return episode.echoesInfos.audioEchoes.durationEchoes;
      },
    },
  ],
  segments: [
    {
      name: "Brouillons",
      where: (episodes) => {
        return Episodes.find({ status: "0 - Brouillon" }).then((episodes) => {
          let episodesIds = [];
          episodes.forEach((episode) => {
            episodesIds.push(episode._id);
          });
          return { _id: { $in: episodesIds } };
        });
      },
    },
    {
      name: "En attente Echoes",
      where: (episodes) => {
        return Episodes.find({ status: "1 - En attente Echoes" }).then(
          (episodes) => {
            let episodesIds = [];
            episodes.forEach((episode) => {
              episodesIds.push(episode._id);
            });
            return { _id: { $in: episodesIds } };
          }
        );
      },
    },
    {
      name: "En attente val extrait",
      where: (episodes) => {
        return Episodes.find({ status: "2 - En attente validation" }).then(
          (episodes) => {
            let episodesIds = [];
            episodes.forEach((episode) => {
              episodesIds.push(episode._id);
            });
            return { _id: { $in: episodesIds } };
          }
        );
      },
    },
    {
      name: "En production",
      where: (episodes) => {
        return Episodes.find({ status: "3 - En production" }).then(
          (episodes) => {
            let episodesIds = [];
            episodes.forEach((episode) => {
              episodesIds.push(episode._id);
            });
            return { _id: { $in: episodesIds } };
          }
        );
      },
    },
    {
      name: "Attente val final",
      where: (episodes) => {
        return Episodes.find({ status: "4 - En attente validation" }).then(
          (episodes) => {
            let episodesIds = [];
            episodes.forEach((episode) => {
              episodesIds.push(episode._id);
            });
            return { _id: { $in: episodesIds } };
          }
        );
      },
    },
    {
      name: "Terminé",
      where: (episodes) => {
        return Episodes.find({ status: "5 - Terminé" }).then((episodes) => {
          let episodesIds = [];
          episodes.forEach((episode) => {
            episodesIds.push(episode._id);
          });
          return { _id: { $in: episodesIds } };
        });
      },
    },
  ],
});
