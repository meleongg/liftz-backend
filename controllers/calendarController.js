const Session = require("../models/Session");

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

exports.getSessionsByDate = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const isoDate = req.params.date;

    const date = new Date(isoDate);
    const startOfDay = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    );
    const endOfDay = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 2)
    );

    const sessions = await Session.find({
      user: userId,
      date: { $gte: startOfDay.toISOString(), $lt: endOfDay.toISOString() },
    })
      .populate("workout")
      .exec();

    res.json(sessions);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
