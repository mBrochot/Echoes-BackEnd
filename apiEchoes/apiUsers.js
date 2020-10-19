// ROUTE AVEC CREATE, UPDATE, DELETE
const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");
const { SHA256 } = require("crypto-js");

const User = require("../models/users");
const apiIsAuthenticated = require("./apiIsAuthenticated");

const nodemailer = require("nodemailer");
require("dotenv").config();

// ROUTE SIGNUP
// Requete : name, firstName, email, phone, password
// Vérifie si un utilisateur existe déjà avec ce mail. Si non, crée un nouvel user et renvoie son ID, token, firstName et crédits (pour affichage sur homepage)
// ATTENTION, bien penser à faire une intégration mailgun pour envoyer les identifiants par mail

router.post("/api/signup", async (req, res) => {
  try {
    const emailExists = await User.findOne({
      email: req.body.email,
    });
    if (emailExists) {
      return res
        .status(409)
        .json({ error: "This email is already registered" });
    } else {
      const userSalt = uid2(16);
      const newUser = await new User({
        name: req.body.name,
        firstName: req.body.firstName,
        email: req.body.email,
        phone: req.body.phone,
        token: uid2(16),
        hash: SHA256(req.body.password + userSalt).toString(encBase64),
        salt: userSalt,
      });
      await newUser.save();
      res.status(200).json({
        _id: newUser.id,
        token: newUser.token,
        firstName: newUser.firstName,
      });
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// ROUTE LOGIN
// Requete : email, password
// Vérifie si un utilisateur existe déjà avec ce mail. Si oui, vérifie le mot de passe de l'user et renvoie son ID, token, firstName et crédits (pour affichage sur homepage)

router.post("/api/login", async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });
    if (userFound) {
      const userHash = SHA256(req.body.password + userFound.salt).toString(
        encBase64
      );
      if (userHash === userFound.hash) {
        res.status(200).json({
          _id: userFound.id,
          token: userFound.token,
          firstName: userFound.firstName,
        });
      } else {
        res.status(401).json({ error: "Wrong password" });
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

// ROUTE ACCOUNT
// Requete : id
// Renvoie les données du compte de l'utilisateur en cherchant son id
// ATTENTION, bien passer l'id en state au login et signup
// ATTENTION, bien penser à rajouter les isAuthenticated

router.get("/api/account", apiIsAuthenticated, async (req, res) => {
  try {
    const userFound = await User.findOne({
      _id: req.user._id,
    });
    if (userFound) {
      res.status(200).json(userFound);
    } else {
      res
        .status(404)
        .json({ error: "This user does not exist in the database" });
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// ROUTE UPDATE ACCOUNT
// Requete : id, password
// Modifie les données du compte de l'utilisateur en cherchant son id. Ne marchera que si le user a bien rentré son mot de passe pour confirmer l'update. Si le champs newPassword n'est pas vide, on modifie le password (ici ce sera donc le hash).
// En front, il faudra faire un input avec la modification désactivée ('editModeEnabled: false' ?! Au clic sur "modifier", les champs sont modifiables, au clic sur enregister, prend la route /update)
// ATTENTION, bien penser à rajouter les isAuthenticated
// ATTENTION, bien passer l'id en state au login et signup

router.post("/api/updateaccount", apiIsAuthenticated, async (req, res) => {
  try {
    const userFound = await User.findOne({
      _id: req.user._id,
    });
    if (userFound) {
      if (
        SHA256(req.body.password + userFound.salt).toString(encBase64) ===
        userFound.hash
      ) {
        req.body.identity && (userFound.identity = req.body.identity);
        req.body.name && (userFound.name = req.body.name);
        req.body.firstName && (userFound.firstName = req.body.firstName);
        req.body.email && (userFound.email = req.body.email);
        req.body.phone && (userFound.phone = req.body.phone);
        req.body.job && (userFound.job = req.body.job);

        req.body.companyName &&
          (userFound.company.companyName = req.body.companyName);
        req.body.siret && (userFound.company.siret = req.body.siret);
        req.body.tva && (userFound.company.tva = req.body.tva);
        req.body.street && (userFound.company.address.street = req.body.street);
        req.body.postalCode &&
          (userFound.company.address.postalCode = req.body.postalCode);
        req.body.city && (userFound.company.address.city = req.body.city);

        if (req.body.newPassword) {
          userFound.hash = SHA256(
            req.body.newPassword + userFound.salt
          ).toString(encBase64);
        }
        userFound.save();
        res.status(200).json(userFound);
      } else {
        res.status(401).json({ error: "Wrong password" });
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

// ROUTE DELETE ACCOUNT
// Requete : id, password
// Supprime le compte en cherchant l'utilisateur par son id. Ne marchera que si le user a bien rentré son mot de passe pour confirmer la suppression (on vérifie que les hash correspondent).
// En front, il faudra faire un input avec la modification désactivée ('editModeEnabled: false' ?! Au clic sur "modifier", les champs sont modifiables, au clic sur enregister, prend la route /update)
// ATTENTION, bien penser à rajouter les isAuthenticated
// ATTENTION, bien passer l'id en state au login et signup

router.post("/api/deleteaccount", async (req, res) => {
  try {
    const userFound = await User.findOne({ _id: req.body.id });
    if (userFound) {
      if (
        SHA256(req.body.password + userFound.salt).toString(encBase64) ===
        userFound.hash
      ) {
        userFound.deleteOne();
        res.status(200).json("User deleted");
      } else {
        res.status(401).json({ error: "Wrong password" });
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

// ROUTE FORGOT PASSWORD
//
// réception de l'email et vérification de sa présence dans la BDD
//
// si il y est crétion dans l'Account d'un `resetPasswordToken` et d'un `resetPasswordExpires` valide 1 heure
//
router.post("/api/forgotpassword", async (req, res) => {
  try {
    const userFound = await User.findOne({
      email: req.body.email,
    });
    if (userFound) {
      // création et enregistrement du reset token
      const resetToken = uid2(24);
      (userFound.reset.resetPasswordToken = resetToken),
        (userFound.reset.resetPasswordExpires = Date.now() + 3600000);

      userFound.save();

      // création de transporter nodemailer

      const transporter = nodemailer.createTransport({
        service: `gmail`,
        auth: {
          user: `${process.env.EMAIL_ADDRESS}`,
          pass: `${process.env.EMAIL_PASSWORD}`,
        },
      });

      // model du mail qui va etre transmis au client

      const mailOptions = {
        from: "Echoes.com",
        to: `${userFound.email}`,
        subject: "Changement de Mot de Passe",
        text:
          `Bonjour ${userFound.firstName},\n\n` +
          `Ce lien vous redirigera vers la page de création d'un nouveau mot de passe.\n\n` +
          `Attention, celui-ci a une validité d'une heure.\n\n` +
          `${req.body.url}/resetpassword/${resetToken}`,
      };

      // console.log("sending mail");

      // envoie de l'email

      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.error("there was an error: ", err);
        } else {
          console.log("here is the res: ", response);
          res.status(200).json({ status: 200 });
        }
      });
    } else {
      res
        .status(404)
        .json({ error: "This user does not exist in the database" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json(err.message);
  }
});

// ROUTE RESET PASSWORD
//
// Le liens transmpis dans l'email arrive ici
// le `resetPasswordToken` est comparé et si il fonctionne renvoi `id`, `token` et `firstname`
//
router.post("/api/resetpassword", async (req, res) => {
  // console.log(req.body.resetPasswordToken);
  try {
    const userFound = await User.findOne({
      "reset.resetPasswordToken": req.body.resetPasswordToken,
      "reset.resetPasswordExpires": { $gt: Date.now() },
    });
    if (userFound) {
      res.status(200).json({
        _id: userFound.id,
        token: userFound.token,
        firstName: userFound.firstName,
      });
    } else {
      res
        .status(404)
        .json({ error: "This user does not exist in the database" });
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
});

router.post("/api/updatepassword", async (req, res) => {
  try {
    const userFound = await User.findOne({
      "reset.resetPasswordToken": req.body.resetPasswordToken,
      "reset.resetPasswordExpires": { $gt: Date.now() },
    });

    if (userFound) {
      if (req.body.newPassword) {
        userFound.hash = SHA256(req.body.newPassword + userFound.salt).toString(
          encBase64
        );
        userFound.reset.resetPasswordToken = "";
        userFound.reset.resetPasswordExpires = "";

        userFound.save();
        res.status(200).json(userFound);
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

module.exports = router;
