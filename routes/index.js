var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");

// represents the available routes accessible from the home page and landing page

/* GET home page. */
// router.get("/", userController.userInfo);
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

router.get("/user/:userId", userController.getUserById);

// create user
router.post("/create-user", userController.addUser);

// create goal (temporary, will have form)
router.post("/:userId/create-goal", userController.addGoal);

// update goal (no need for :userId because the Goal ObjectId stays the same)
router.post("/update-goal", userController.updateGoal);

// delete goal
router.post("/:userId/delete-goal", userController.deleteGoal);

// create pr (temporary, will have form)
// router.post("/create-pr", userController.addPr);

// create stats (temporary, will be implicitly updated when data is available)
router.post("/create-stats", userController.addStats);

module.exports = router;
