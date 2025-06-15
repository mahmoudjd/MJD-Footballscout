export interface Award {
    name: string;
    number: string;
}

export interface Attribute {
    name: string;
    value: string;
}

export interface Title {
    name: string;
    number: string;
}

export interface Transfer {
    season: string;
    team: string;
    amount: string;
}

export default interface PlayerType {
    _id: string;
    title: string;
    name: string;
    age: number;
    number: number;
    fullName: string;
    currentClub: string;
    image: string;
    caps: string;
    country: string;
    birthCountry: string | undefined;
    weight: number;
    height: number;
    status: string;
    position: string;
    preferredFoot: string | undefined;
    value: string;
    website: string;
    currency: string;
    highstValue: string;
    otherNation: string;
    elo: number;
    born: string;
    playerAttributes: Attribute[];
    titles: Title[];
    awards: Award[];
    transfers: Transfer[];
    timestamp: Date;
}
