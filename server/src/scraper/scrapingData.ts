import {
  extractDataBesoccer,
  getSingleLinkBesoccer,
  getLinksBesoccer,
} from "./extractBesoccer";

import {
  extractDataPlaymakerstats,
  getLinkPlaymakerstats,
} from "./extractPlayMarker";

import PlayerType, { Title } from "../types";

export async function extractPlayerData(name: string, one = false) {
  try {
    const convertedName = convert(name);

    // Early return if fetching only one player
    if (one) {
      return [await extractWithName(convertedName)];
    }

    const urlsBesoccer = await getLinksBesoccer(convertedName);
    if (urlsBesoccer.length === 0) {
      console.log("not found in Besoccer!");
      return [await extractWithName(convertedName)];
    }

    const urlsToAnalyse = urlsBesoccer.slice(0, 3);

    const results = await Promise.all(
      urlsToAnalyse.map((url) => extractWithBesoccerURL(name, url)),
    );

    // Filter out invalid results and create an array of players
    const players = results.filter(
      (player) => player && player.name && player.title,
    );

    return players;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function extractWithName(
  name: string,
): Promise<PlayerType | undefined> {
  try {
    name = convert(name);
    const [url1, url2] = await Promise.all([
      getSingleLinkBesoccer(name),
      getLinkPlaymakerstats(name),
    ]);

    let [player1, player2] = await Promise.all([
      extractDataBesoccer(`${url1}`),
      extractDataPlaymakerstats(url2),
    ]);

    if (!player1 && player2) {
      const newUrl = await getSingleLinkBesoccer(player2.name);
      player1 = await extractDataBesoccer(`${newUrl}`);
    }

    if (player1 && !player2) {
      const newUrl = await getLinkPlaymakerstats(player1.title);
      player2 = await extractDataPlaymakerstats(newUrl);
    }

    if (player1 && player2 && isEquals(player1, player2)) {
      console.log("----- check result 1 ----->");
      return await checkAndUpdate(player1, player2);
    }
    if (player1 && !player2) return player1;
    if (player2 && !player1) return player2;
  } catch (error) {
    console.error(error);
  }
}

export async function extractWithBesoccerURL(
  name: string,
  besoccerLink: string,
): Promise<PlayerType | undefined> {
  try {
    name = convert(name);

    const url1Promise = Promise.resolve(besoccerLink); // Da der link bereit eingegeben
    const url2Promise: Promise<string> = getLinkPlaymakerstats(name);

    let [url1, url2] = await Promise.all([url1Promise, url2Promise]);

    const p1: Promise<PlayerType | undefined> = extractDataBesoccer(`${url1}`);
    const p2: Promise<PlayerType | undefined> = extractDataPlaymakerstats(url2);
    let [player1, player2] = await Promise.all([
      p1,
      url2.includes("undefined") ? Promise.resolve(undefined) : p2,
    ]);

    if (player1 && !player2) {
      url2 = await getLinkPlaymakerstats(player1.title);
      player2 = await extractDataPlaymakerstats(url2);
    }

    if (player1 && player2 && isEquals(player1, player2)) {
      console.log("----- check result case 1 ----->");
      return await checkAndUpdate(player1, player2);
    }

    if (player1 && player2 && !isEquals(player1, player2)) {
      url2 = await getLinkPlaymakerstats(player1.title);
      if (!url2.includes("undefined")) {
        player2 = await extractDataPlaymakerstats(url2);
        if (player2 && isEquals(player1, player2)) {
          console.log("----- check result case 2 ----->");
          return await checkAndUpdate(player1, player2);
        }
      }
    }

    if (url2.includes("undefined") && player1) {
      url2 = await getLinkPlaymakerstats(convert(player1.name));
      if (!url2.includes("undefined")) {
        player2 = await extractDataPlaymakerstats(url2);
        if (player2 && isEquals(player1, player2)) {
          console.log("----- check result case 3 ----->");
          return await checkAndUpdate(player1, player2);
        }
      }
    }

    if (
      player1 &&
      (url2.includes("undefined") || (player2 && !isEquals(player1, player2)))
    ) {
      url2 = await getLinkPlaymakerstats(convert(player1.fullName));
      if (!url2.includes("undefined")) {
        player2 = await extractDataPlaymakerstats(url2);
        if (player2 && isEquals(player1, player2)) {
          console.log("----- check result case 4 ----->");
          return await checkAndUpdate(player1, player2);
        }
      }
    }

    if (
      player1 &&
      (url2.includes("undefined") || (player2 && !isEquals(player1, player2)))
    ) {
      url2 = await getLinkPlaymakerstats(
        `${convert(player1.title)} ${player1.position} ${player1.country} ${
          player1.age
        }`,
      );
      player2 = await extractDataPlaymakerstats(url2);
      if (player2 && isEquals(player1, player2)) {
        console.log("----- check result case 5 ----->");
        return await checkAndUpdate(player1, player2);
      }
    }

    /* check if player not not enough Information */
    if (
      player1?.age === 0 &&
      player1?.weight === 0 &&
      player1?.height === 0 &&
      !player1?.preferredFoot &&
      !player1?.currentClub
    ) {
      throw new Error("player has no data");
    }
    if (player1) {
      return player1;
    }
    if (player2 && !player1) return player2;
  } catch (error) {
    console.error(error);
  }
}

// if the same players then complete the infos
async function checkAndUpdate(
  player1: PlayerType,
  player2: PlayerType,
): Promise<PlayerType> {
  if (!player1.name) player1.name = player2.name;
  if (!player1.title) player1.title = player2.title;

  const num = player1.number;
  const num2 = player2.number;
  if (!num) player1.number = player2.number;
  if (!num && !num2) player1.number = 0;

  const weight = player1.weight;
  if (!weight) player1.weight = player2.weight;

  const height = player1.height;
  if (!height) player1.height = player2.height;

  const foot = player1.preferredFoot;
  if (!foot) player1.preferredFoot = player2.preferredFoot;

  if (!player1.currentClub) player1.currentClub = player2.currentClub;
  if (player2.currentClub?.length > player1.currentClub?.length)
    player1.currentClub = player2.currentClub;
  if (player1.image?.includes("nofoto")) player1.image = player2.image;

  if (player1.position.length < player2.position.length || !player1.position)
    player1.position = player2.position;

  if (!player1.born) player1.born = player2.born;
  if (!player1.birthCountry) player1.birthCountry = player2.birthCountry;
  if (player1.transfers?.length === 0) player1.transfers = player2.transfers;
  if (player2.titles.length > player1.titles.length)
    player1.titles = player2.titles;
  if (player2.titles === player2.titles) {
    const sumTitles = (titles: Title[]) =>
      titles.reduce(
        (total: number, title: Title): number => total + parseInt(title.number),
        0,
      );
    const numberOfTitles1 = sumTitles(player1.titles);
    const numberOfTitles2 = sumTitles(player2.titles);
    if (numberOfTitles2 > numberOfTitles1) player1.titles = player2.titles;
  }

  player1.otherNation = player2.otherNation;
  player1.website = player2.website;
  player1.status = player2.status;
  player1.awards = player2.awards;

  return player1;
}

export function isEquals(obj1: PlayerType, obj2: PlayerType) {
  if (!obj1 || !obj2) return false;

  const fullName1 = convert(obj1.fullName).toLowerCase();
  const fullName2 = convert(obj2.fullName).toLowerCase();

  const country1 = obj1.country?.toString().toLowerCase();
  const country2 = obj2.country?.toString().toLowerCase();

  const num1 = obj1.number;
  const num2 = obj2.number;

  const age1 = obj1.age;
  const age2 = obj2.age;

  const pos1 = obj1.position?.toLowerCase();
  const pos2 = obj2.position?.toLowerCase();

  let foot1 = obj1.preferredFoot?.toLowerCase();
  const foot2 = obj2.preferredFoot?.toLowerCase();

  const height1 = obj1.height;
  const height2 = obj2.height;

  if (
    fullName1 === fullName2 &&
    age1 === age2 &&
    num1 === num2 &&
    foot1 === foot2 &&
    height1 === height2
  ) {
    return true;
  }

  if (
    fullName1 === fullName2 &&
    foot1 === foot2 &&
    height1 === height2 &&
    country1 === country2 &&
    pos2.includes(pos1)
  ) {
    return true;
  }

  if (
    country1 === country2 &&
    age1 === age2 &&
    num1 === num2 &&
    foot1 === foot2 &&
    height1 === height2
  ) {
    return true;
  }

  if (
    age1 === age2 &&
    country1 === country2 &&
    (pos1.includes(pos2) ||
      pos2.includes(pos1) ||
      (foot1 === foot2 && height1 === height2))
  ) {
    return true;
  }

  return (
    (convert(fullName1) === convert(fullName2) && age1 === age2) ||
    (country1 === country2 &&
      num1 === num2 &&
      age1 === age2 &&
      foot1 === foot2 &&
      pos2.includes(pos1))
  );
}

// to make name normal
export function convert(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "");
}
