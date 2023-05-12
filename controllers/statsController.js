const PR = require("../models/PR");

exports.getPrs = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const stats = await PR.find({ user: userId }).exec();

    res.json(stats);
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
