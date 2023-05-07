const express = require('express');
const router = express.Router();

const calendarController = require("../controllers/calendarController")

router.get("/", calendarController.getSessions);

router.get("/:userId", calendarController.getSessions);

router.get("/:userId/:date", calendarController.getSessionsByDate);

router.get("/:sessionId", calendarController.getSession);

module.exports = router;