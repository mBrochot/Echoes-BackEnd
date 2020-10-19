const express = require("express");
const router = express.Router();

router.get("/api/status", async (req, res) => {
  try {
    let allStatus = [];
    let brouillon = "0 - Brouillon";
    let extract = "1 - En attente Echoes";
    let validExtract = "2 - En attente validation";
    let production = "3 - En production";
    let validProduction = "4 - En attente validation";
    let termine = "5 - Terminé";

    allStatus.push(
      brouillon,
      extract,
      validExtract,
      production,
      validProduction,
      termine
    );
    res.json({ data: allStatus });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
