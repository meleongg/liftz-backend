const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// TODO: add password

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, minLength: 1 },
    lastName: { type: String, required: true, trim: true, minLength: 1 },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
    },
    workouts: [{ type: Schema.Types.ObjectId, ref: "Workout" }],
    goals: [{ type: Schema.Types.ObjectId, ref: "Goal" }],
    stats: [{ type: Schema.Types.ObjectId, ref: "Stats" }],
  },
  { timestamps: true }
);

userSchema.virtual("createdAtFormatted").get(function () {
  return this.createdAt
    ? DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED)
    : "No creation date specified";
});

module.exports = mongoose.model("User", userSchema);
