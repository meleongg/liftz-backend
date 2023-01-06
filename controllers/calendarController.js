const Session = require("../models/Session");

// dates are in MM-DD-YYYY
// gets sessions within a specified period
exports.getSessions = (req, res, next) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  Session.find({ date: { $gte: startDate, $lte: endDate } })
    .sort({ date: 1 })
    .exec((err, sessions) => {
      if (err) {
        return next(err);
      }

      res.json(sessions);
    });
};

// gets specific sessions when a calendar date is clicked
exports.getSession = (req, res, next) => {
  const targetDate = req.params.date;

  Session.find({ date: targetDate })
    .sort({ date: 1 })
    .exec((err, sessions) => {
      if (err) {
        return next;
      }

      if (sessions.length == 0) {
        const err = new Error("No workout sessions found!");
        err.status = 404;
        return next(err);
      }

      res.json(sessions);
    });
};
