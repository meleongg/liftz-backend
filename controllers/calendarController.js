const Session = require("../models/Session");

// dates are in MM-DD-YYYY
// gets sessions within a specified period
exports.getSessions = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const sessions = await Session.find({ user: userId })
      .sort({ date: 1 })
      .exec();

    res.json(sessions);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// gets specific sessions when a calendar date is clicked
exports.getSession = async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;

    const session = await Session.findById(sessionId);

    res.json(session);
  } catch (error) {
    next(error);
  }
};
