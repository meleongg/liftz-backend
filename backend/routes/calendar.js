const express = require('express');
const router = express.Router();

const calendarController = require("../controllers/calendarController")

router.get("/", calendarController.getSessions);

router.get("/:date", calendarController.getSession);

module.exports = router;