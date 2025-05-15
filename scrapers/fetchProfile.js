const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (handle) => {
  try {
    const { data } = await axios.get(
      `https://www.codechef.com/users/${handle}`
    );
    const $ = cheerio.load(data);

    const profile = $(".user-details-container");
    const ratingRanks = $(".rating-ranks");

    const name = profile.find("h1.h2-style").text().trim();
    const profileImage = profile.find("img").attr("src");
    const currentRating = parseInt($(".rating-number").first().text());
    const highestRating = parseInt(
      $(".rating-number").parent().find("small").text().replace(/[^\d]/g, "")
    );
    const stars = $(".rating").first().text().trim();
    const countryName = $(".user-country-name").text().trim();
    const countryFlag = $(".user-country-flag").attr("src");
    
    const globalRank = parseInt(ratingRanks.find(".inline-list li").first().find("strong").text());
    const countryRank = parseInt(ratingRanks.find(".inline-list li").last().find("strong").text());

    return {
      success: true,
      name,
      profileImage,
      currentRating,
      highestRating,
      stars,
      countryName,
      countryFlag,
      globalRank,
      countryRank,
    };
  } catch (err) {
    return {
      success: false,
      error: "Error fetching profile data.",
      message: err?.message || "Unknown error",
    };
  }
};
