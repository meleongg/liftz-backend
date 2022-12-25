var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");

/* GET home page. */
// router.get("/", userController.userInfo);
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// create user (temporary, will have form)
router.post("/create-user", userController.addUser);

// create goal (temporary, will have form)
router.post("/create-goal", userController.addGoal);

// create pr (temporary, will have form)
router.post("/create-pr", userController.addPr);

// create stats (temporary, will be implicitly updated when data is available)
router.post("/create-stats", userController.addStats);

module.exports = router;
