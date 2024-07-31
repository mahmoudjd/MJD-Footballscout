import mongoose, { Schema } from "mongoose";

const PlayerSchema = new Schema({
  title: { type: String, trim: true },
  name: { type: String, trim: true },
  age: { type: Number, trim: true },
  number: { type: Number },
  fullName: { type: String, trim: true },
  currentClub: { type: String, trim: true },
  image: { type: String, trim: true },
  caps: { type: String, trim: true },
  country: { type: String, trim: true },
  birthCountry: { type: String, trim: true },
  weight: { type: Number },
  height: { type: Number },
  status: { type: String, trim: true },
  position: { type: String, trim: true },
  preferredFoot: { type: String, trim: true },
  value: { type: String, trim: true },
  website: { type: String, trim: true },
  currency: { type: String, trim: true },
  highstValue: { type: String, trim: true },
  otherNation: { type: String, trim: true },
  elo: { type: String },
  born: { type: String, trim: true },
  playerAttributes: [
    {
      name: String,
      value: String,
    },
  ],
  titles: [
    {
      name: String,
      number: String,
    },
  ],
  awards: [
    {
      name: String,
      number: String,
    },
  ],
  transfers: [
    {
      season: String,
      team: String,
      amount: String,
    },
  ],
  timestamp: { type: Date },
});

const PlayerModel = mongoose.model("Player", PlayerSchema);

export default PlayerModel;
