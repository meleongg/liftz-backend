const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const goalSchema = new Schema(
  {
    content: { type: String, required: true, trim: true, minLength: 1 },
    user: { type: Schema.Types.ObjectId, ref: "User" }, 
  },
  { timestamps: true }
);

goalSchema.virtual("createdAtFormatted").get(function () {
  return this.createdAt
    ? DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED)
    : "No creation date specified";
});

module.exports = mongoose.model("Goal", goalSchema);
