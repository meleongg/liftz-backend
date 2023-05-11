const express = require("express");
const router = express.Router();

const calendarController = require("../controllers/calendarController");

router.get("/:userId", calendarController.getSessions);

router.get("/:userId/:date", calendarController.getSessionsByDate);

module.exports = router;
