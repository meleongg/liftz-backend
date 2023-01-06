const express = require('express');
const router = express.Router();

const statsController = require("../controllers/statsController");

router.get("/", statsController.getPrs);

module.exports = router;