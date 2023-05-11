var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");

router.post("/check-email", userController.checkEmail);

router.post("/:userId/validate-email", userController.validateEmail);

router.post("/:userId/validate-password", userController.validatePassword);

router.get("/user/:userId", userController.getUserById);

// create user
router.post("/create-user", userController.addUser);

router.post("/:userId/update-user", userController.updateUser);

router.post("/:userId/delete-user", userController.deleteUser);

// create goal (temporary, will have form)
router.post("/:userId/create-goal", userController.addGoal);

// update goal (no need for :userId because the Goal ObjectId stays the same)
router.post("/:userId/update-goal", userController.updateGoal);

// delete goal
router.post("/:userId/delete-goal", userController.deleteGoal);

// create stats (temporary, will be implicitly updated when data is available)
router.post("/create-stats", userController.addStats);

module.exports = router;
