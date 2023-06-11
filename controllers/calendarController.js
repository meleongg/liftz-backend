const Session = require("../models/Session");

const { DateTime } = require("luxon");

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
        const timezone = req.body.timezone;
        const userId = req.params.userId;
        const date = req.params.date;

        const [month, day, year] = date.split("-");

        // Create a Luxon DateTime object using the user's time zone and the provided date components
        const userDateTime = DateTime.fromObject(
            {
                year: Number(year),
                month: Number(month),
                day: Number(day),
            },
            { zone: timezone }
        );

        const startOfDay = userDateTime.startOf("day");
        const endOfDay = userDateTime.endOf("day");

        const sessions = await Session.find({
            user: userId,
            date: { $gte: startOfDay.toJSDate(), $lt: endOfDay.toJSDate() },
        })
            .populate("workout")
            .exec();

        res.json(sessions);
    } catch (error) {
        console.log(error);
        next(error);
    }
};
