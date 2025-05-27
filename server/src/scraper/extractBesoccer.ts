import * as cheerio from "cheerio";
import axios from "axios";
import PlayerType, { Attribute, Award, Title, Transfer } from "../types";

const cheerioConfig = {
  decodeEntities: false,
  xmlMode: true,
  _useHtmlParser2: true,
  _useHtmlParser: false,
};

export const getLinksBesoccer = async (name: string): Promise<string[]> => {
  try {
    name = name.toLowerCase().replace(" ", "-");
    console.log("starting extract besoccer links for name: ", name);
    const response = await axios.get(`https://www.besoccer.com/search/${name}`);
    console.log("response.status: ", response.status);
    const html = response.data;
    const $ = cheerio.load(html, cheerioConfig);

    const urlLinks: string[] = [];
    $(".results .player-result > .row.info > .pr0").each((index, element) => {
      const link: string | undefined = $(element)
        .find(".pr0 > a")
        .attr("href");
      console.log("--->url", index, ": ", link);
      if (link) urlLinks.push(link);
      console.log("--->url", index, ": ", link);
    });
    return urlLinks;
  } catch (err) {
    console.error(err.message);
    return [];
  }
};

// get url from Besoccer.com
export const getSingleLinkBesoccer = async (name: string) => {
  try {
    name = name.toLowerCase().replace(" ", "-");
    const response = await axios.get(`https://www.besoccer.com/search/${name}`);
    const html = response.data;
    const $ = cheerio.load(html, cheerioConfig);
    console.log("getting single link for name: ", name);
    const urlOfPlayer: string | undefined = $(
      ".player-result > .info > .pr0 > a.block",
    ).attr("href");
    console.log("url1 ---> ", urlOfPlayer);
    return urlOfPlayer;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return "";
  }
};

// get Data from Besoccer
export const extractDataBesoccer = async (
  url: string,
): Promise<PlayerType | undefined> => {
  try {
    if (!url || url.includes("undefined")) throw new Error("Invalid URL");

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
    }

    const response = await axios.get(url, { headers });
    const html = response.data;
    const $ = cheerio.load(html, cheerioConfig);

    const name: string = $("#mod_player_stats > .panel")
      .find(".panel-title")
      .text()
      .trim();

    const title: string = $(".head-title > h2.title").text();

    let number = $(
      "section.sub-header > .head-info > .head-content > .bottom-row > .data-boxes > .data-box > div.black ",
    ).text();

    const fullName = $("#mod_player_stats > .panel")
      .find(".panel-subtitle")
      .text()
      .trim();

    const image: string | undefined = $(".player-head > .bottom-row")
      .find(".img-wrapper > img")
      .attr("src");

    const age = $(".stat:nth-child(1) .big-row").text().trim();

    const country = $(".stat:nth-child(1) .small-row").eq(1).text().trim();

    const weight = $(".stat:nth-child(2) .big-row").text().trim();

    const position = $(".stat:nth-child(2) .round-row.mb5 span").text().trim();

    const height = $(".stat:nth-child(3) .big-row").text().trim();

    if (!number)
      number = $(".stat:nth-child(3) .round-row.mb5 span").text().trim();

    const value = $(".stat:nth-child(4) .big-row").text().trim();

    const currency = $(".stat:nth-child(4) .small-row")
      .text()
      .trim()
      .replace("ELO", "");

    const elo = $(".stat:nth-child(4) .round-row.mb5.green span").text().trim();

    const born = $("#mod_player_stats > .panel > .panel-body > p").text();

    const caps1 = $(
      "#mod_player_sel_info > .player-sel > .panel-body > .box-content",
    )
      .find("div > .main-text")
      .text()
      .trim();

    const caps2 = $("#mod_player_sel_info > .player-sel > .item-column-list ")
      .find(".item-col:eq(0) > .main-line")
      .text()
      .trim();

    const caps = "played " + caps1 + " / " + caps2 + " Goals";

    const $personalData = $("#mod_player_stats > .panel> .table-list")
      .find('div:contains("Personal data")')
      .next();

    const birthCountry = $personalData
      .find('div:contains("Country of birth")')
      .first()
      .find("a")
      .text()
      .trim();

    const preferredFootText = $personalData
      .find('div:contains("Preferred foot")')
      .first()
      .text()
      .toLowerCase()
      .trim();

    const preferredFoot = preferredFootText.includes("right")
      ? "right"
      : preferredFootText.includes("left")
        ? "left"
        : "";

    const $carrierDetails = $("#mod_player_stats > .panel> .table-list")
      .find('div:contains("Career details")')
      .next();

    const currentClub = $carrierDetails
      .find('div:contains("Current club")')
      .find("a.link")
      .text()
      .trim();

    const market = $(".player-market > .panel-body > .table-body > .table-row");

    const highstValue: string = $(market)
      .find('div:contains("Highest value in career")')
      .next()
      .text();

    const playerAttributes: Attribute[] = [];

    $(".cl-name").each((index, element) => {
      const value: string = $(element).find(".cvalue").text().trim();
      const name: string = $(element).find(".cname div").text().trim();
      playerAttributes.push({ name, value });
    });

    // console.log("Attributes: ", playerAttributes);

    const urlTitles = $(
      "#mod_palmares > .panel > .panel-head > .btn-toggle > a",
    ).attr("href");

    const urlTransfers = $(
      "#mod_player_last_transfers > .pl-signings > .panel-head > .btn-toggle > a",
    ).attr("href");

    const titles = urlTitles ? await extractTitles(urlTitles) : [];

    const transfers = urlTransfers ? await extractTransfers(urlTransfers) : [];

    const objPlayer: PlayerType = {
      title,
      name,
      age: parseInt(age) || 0,
      number: parseInt(number) || 0,
      fullName,
      currentClub,
      image,
      caps,
      status: "",
      otherNation: "",
      website: "",
      country,
      birthCountry,
      weight: parseInt(weight) || 0,
      height: parseInt(height) || 0,
      position: getPosition(position),
      preferredFoot,
      value,
      currency,
      highstValue,
      elo: parseInt(elo) || 0,
      born,
      playerAttributes,
      titles,
      awards: [],
      transfers,
      timestamp: new Date(),
    };

    // console.log("-- obj1: ", objPlayer);
    return objPlayer;
  } catch (err) {
    console.error(err.message);
  }
};

// Extrahieren der Awardsdaten
const extractTitles = async (url: string): Promise<Title[]> => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const honors: Award[] = [];

    $("ul.item-list > li").each((_, element) => {
      const number: string = $(element).find(".bg-green").text().trim() || "1";

      const name: string = $(element).find(".desc-boxes .t-up").text().trim();

      honors.push({ number, name });
    });

    return honors;
  } catch (error) {
    console.error(error.message);
    return [];
  }
};

// Extrahieren der Transfersdaten
const extractTransfers = async (url: string): Promise<Transfer[]> => {
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const transfers: Transfer[] = [];

    $("#mod_transfers .row-body").each((_, element) => {
      const $row = $(element);

      const season = $row
        .find("td:nth-child(1) > .arranged > strong > span")
        .text()
        .trim();

      const origin = $row.find("td:nth-child(2) span").text().trim();

      const destination = $row.find("td:nth-child(3) span").text().trim();

      const amount = $row
        .find("td:nth-child(4) > div > strong > span")
        .text()
        .trim();

      // get the name of the team, if transfer
      const team =
        origin && destination ? destination : !origin ? destination : origin;

      if (season) {
        transfers.push({ season, team, amount });
      }
    });
    return transfers;
  } catch (error) {
    console.error(error.message);
    return [];
  }
};
//
// helper-function to get the Position
const getPosition = (position: string) => {
  return position.includes("For")
    ? "Forward"
    : position === "Def"
      ? "Defender"
      : position === "Mid"
        ? "Midfielder"
        : position === "Goa"
          ? "Goalkeeper"
          : position;
};
