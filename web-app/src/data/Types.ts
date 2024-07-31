export interface Award {
  number: string;
  name: string;
}

export interface Title {
  number: string;
  name: string;
}

export interface Transfer {
  season: string;
  team: string;
  amount: string;
}

export interface Attribute {
  name: string;
  value: string;
}

export interface PlayerType {
  _id: string;
  name: string;
  title: string;
  number: number;
  fullName: string;
  weight: number;
  height: number;
  preferredFoot: string;
  value: string;
  currency: string;
  age: number;
  currentClub: string;
  image: string;
  position: string;
  country: string;
  birthCountry: string;
  otherNation: string;
  website: string;
  status: string;
  caps: string;
  highstValue: string;
  elo: number;
  born: string;
  playerAttributes: Array<Attribute>;
  titles: Array<Title>;
  awards: Array<Award>;
  transfers: Array<Transfer>;
  timestamp: Date;
}
