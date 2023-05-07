const PR = require("../models/PR");

exports.getPrs = (req, res, next) => {
  const userId = req.params.userId;

  PR.find({ user: userId }).exec((err, stats) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.json(stats);
  });
};
