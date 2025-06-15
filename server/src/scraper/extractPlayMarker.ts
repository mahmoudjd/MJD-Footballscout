import * as cheerio from "cheerio";
import axios from "axios";
import PlayerType, { Award, Title, Transfer } from "../types";
// @ts-ignore
import iconv from "iconv-lite";

const cheerioConfig = {
  decodeEntities: false,
  xmlMode: true,
  _useHtmlParser2: true,
  _useHtmlParser: false,
};

// get url from playmakerstats.com
export const getLinkPlaymakerstats = async (name: string): Promise<string> => {
  try {
    const response = await axios.get(
      `https://www.playmakerstats.com/pesquisa?search_txt=${name}`,
      {
        responseType: "arraybuffer",
      },
    );
    const html = iconv.decode(response.data, "windows-1252");

    const $ = cheerio.load(html, cheerioConfig);
    const result: string = $(".zz-search-main > .zz-search-results > .player> div")
        .first()
        .find('a[href^="/player/"]')
        .attr('href')

    console.log("url2 ---> ", result);

    const urlOfPlayer = "https://www.playmakerstats.com" + result;
    // console.log("URL of Player:", urlOfPlayer);
    return urlOfPlayer;
  } catch (err) {
    console.error("Error:", err.message);
    return "";
  }
};

// extract Dataen from playmakerstats and add to player
export const extractDataPlaymakerstats = async (
  url: string,
): Promise<PlayerType | undefined> => {
  try {

    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    const html = iconv.decode(response.data, "windows-1252");
    const $ = cheerio.load(html, cheerioConfig);
    const headerContainer = $(
      "#page_header_container > .zz-entity-header > .zz-enthdr-top",
    );

    let name = $(headerContainer)
        .find(".zz-enthdr-data > h1 > span.name")
        .text()
        .trim();

    const hasNumber = /\d/.test(name);

    if (hasNumber) {
      name = name.split(".")[1];
    }

    const ageText = $(headerContainer)
      .find(".zz-enthdr-info .info")
      .text()
      .match(/\d+ -yrs-old/);

    let age: number = 0;
    if (ageText) age = parseInt(ageText[0].split(" ")[0]);
    //console.log("-----age-----:", age);
    const number = $(".zz-enthdr-data > h1 > .name > .number").text().trim();

    const bioElem = $('#page_rightbar > .rbbox > h2:contains("PROFILE")')
      .next()
      .find(".bio");

    const bioHalfElem = $('#page_rightbar > .rbbox > h2:contains("PROFILE")')
      .next()
      .find(".bio_half");

    const fullName = $('.bio')
        .filter((_, el) => $(el).find("span").text().trim() === "Name")
        .text()
        .replace("Name", "")
        .trim();

    const image ="https://www.playmakerstats.com"+ $(".profile_picture > .logo > a > img").attr("src");

    const currentClub: string = $(
      '#page_rightbar > .rbbox > h3:contains("CURRENT CLUB")',
    )
      .next()
      .find(".text > a")
      .text()
      .trim();

    const website = $('.bio')
        .filter((_, el) => $(el).find("span").text().trim() === "Official Site")
        .find("a")
        .attr("href");

    const position = $('.bio')
        .filter((_, el) => $(el).find("span").text().trim() === "Position")
        .text()
        .replace("Position", "")
        .trim();

    const country: string = $('.bio_half')
        .filter((_, el) => $(el).find("span").text().trim() === "Nationality")
        .find('.text')
        .text()
        .trim();

    const otherNation: string = $(bioHalfElem)
      .find('span:contains("Dual Nationality")')
      .next()
      .find(".micrologo_and_text > .text")
      .text();

    const caps: string = $('.bio_half')
        .filter((_, el) => $(el).find("span").first().text().trim() === "Caps")
        .first()
        .find('a').text().trim();

    const preferredFootText = $('.bio_half')
        .filter((_, el) => $(el).find("span").text().trim() === "Preferred foot")
        .text()
        .replace("Preferred foot", "")
        .trim()
        .toLowerCase();

    const preferredFoot: string = preferredFootText.includes("right")
      ? "right"
      : preferredFootText.includes("left")
        ? "left"
        : "";

    const weight: string =  $('.bio_half')
        .filter((_, el) => $(el).find("span").text().trim() === "Weight")
        .text()
        .replace("Weight", "")
        .trim();

    const height: string =  $('.bio_half')
        .filter((_, el) => $(el).find("span").text().trim() === "Height")
        .text()
        .replace("Height", "")
        .trim();

    const bornData: string = $('.bio_half')
        .filter((_, el) => $(el).find("span").first().text().trim() === "Born/Age")
        .first().text();

    const bornDateMatch = bornData.match(/\d{4}-\d{2}-\d{2}/);
    const bornDate: string = bornDateMatch ? bornDateMatch[0] : "";
    const birthCountry: string = bornData.split("Country of Birth")[1];

    const status = $('.bio')
        .filter((_, el) => $(el).find('span').text().trim() === 'Status')
        .text()
        .replace('Status', '')
        .trim();

    const transfers: Transfer[] = [];

    // Iterate over each table row (transfer)
    const transfersQuery = '#page_rightbar > .rbbox > h3:contains("TRANSFERS")';
    const transfersElems = $(transfersQuery)
      .next()
      .find("table.stats > tbody > tr");

    transfersElems.each((_, element) => {
      // Extract season, team, and amount
      const season = $(element).find("td.text").eq(0).text().trim();
      const team = $(element).find("td.text").eq(1).text().trim();
      const amount = $(element).find("td.triple").text().trim();

      transfers.push({ season, team, amount });
    });

    // Iterate over each trophy element
    const awards: { number: string; name: string }[] = [];

    $(".trophy").each((_, el) => {
      const number = $(el).find(".number").text().trim();
      const name = $(el).find(".competition a").text().trim();
      if (name) {
        awards.push({ number, name });
      }
    });

    const titles: Title[] = [];
    $("#coach_titles > .innerbox > .trophy_line  ").each((_, element) => {
      $(element)
        .find(".trophy")
        .each((_, elem) => {
          const $trophy = $(elem);
          const number = $trophy.find(".number").text().trim();
          const name = $trophy.find(".competition .text").text().trim();
          // console.log("--------------->\n", { number, name });
          titles.push({ number, name });
        });
    });
    const objPlayer: PlayerType = {
      title: name,
      name,
      age,
      born: bornDate,
      number: parseInt(number.toString().replace(".", "")) || 0,
      fullName,
      currentClub,
      image,
      caps,
      birthCountry,
      value: "",
      elo: 0,
      currency: "",
      highstValue: "",
      status,
      weight: parseInt(weight.replace("kg", "")) || 0,
      height: parseInt(height.replace("cm", "")) || 0,
      position,
      preferredFoot,
      country,
      otherNation,
      website,
      playerAttributes: [],
      titles,
      awards,
      transfers,
      timestamp: new Date(),
    };

    console.log("playmakerstats player:\n", objPlayer);

    return objPlayer;
  } catch (error) {
    console.error(error.message);
  }
};
