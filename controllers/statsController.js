const Stat = require("../models/Stats");

// TODO: make userId able to be generated per user
const tempUserId = "63a6a9224a17c73cdedb6bc3";

// called everytime the time period changes, automatically loads to all time
exports.getPrs = (req, res, next) => {
  Stat.find({ user: tempUserId })
    .populate("prs")
    .exec((err, stats) => {
      if (err) {
        return next(err);
      }

      res.json(stats);
    });
};
