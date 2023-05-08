const express = require("express");
const matchController = require("../Controllers/matchController.js");
const authController = require("../Controllers/authController.js");
const router = express.Router();

router.param("id", matchController.checkID);

router.route("/").get(authController.protect, matchController.getAllMatches);
router
  .route("/number-of-matches-stadium/:year")
  .get(matchController.getMatchesAtStadium);

router.route("/:id").delete(matchController.deleteMatch);

module.exports = router;
