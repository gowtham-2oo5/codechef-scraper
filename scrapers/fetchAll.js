const axios = require("axios");
const cheerio = require("cheerio");
const fetchRecent = require("./fetchRecent");
const fetchRatings = require("./fetchRatings");

module.exports = async (handle) => {
  try {
    const { data } = await axios.get(
      `https://www.codechef.com/users/${handle}`
    );
    const $ = cheerio.load(data);

    const profile = $(".user-details-container");
    const ratingRanks = $(".rating-ranks");

    const name = profile.find("h2").text().trim();
    const profileImage = profile.find("img").attr("src");
    const currentRating = parseInt($(".rating-number").first().text());
    const highestRating = parseInt(
      $(".rating-number").parent().find("small").text().replace(/[^\d]/g, "")
    );
    const stars = $(".rating").first().text().trim();
    const countryName = $(".user-country-name").text().trim();
    const countryFlag = $(".user-country-flag").attr("src");
    const globalRank = parseInt(ratingRanks.find("td").eq(0).text());
    const countryRank = parseInt(ratingRanks.find("td").eq(1).text());

    const ratingData = (await fetchRatings(handle)).ratingData;
    const recentActivity = (await fetchRecent(handle)).recentActivity;

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
      ratingData,
      recentActivity,
    };
  } catch (err) {
    return {
      success: false,
      error: "Error fetching profile data.",
      message: err?.message || "Unknown error",
    };
  }
};
