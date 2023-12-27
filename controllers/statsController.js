const PR = require("../models/PR");

exports.getPrs = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const stats = await PR.find({ user: userId }).populate("workout").exec();

    res.json(stats);
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.deletePr = async (req, res, next) => {
  const prId = req.params.prId;

  try {
    const deletedPr = await PR.findByIdAndDelete(prId);

    if (!deletedPr) {
      const err = new Error("PR not found!");
      err.status = 404;
      console.error(err);
      return next(err);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }

  res.json({ message: "PR deleted" });
};
