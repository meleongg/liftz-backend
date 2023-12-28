const express = require("express");
const router = express.Router();

const statsController = require("../controllers/statsController");

router.get("/:userId", statsController.getPrs);
router.delete("/:prId/delete", statsController.deletePr);

module.exports = router;
