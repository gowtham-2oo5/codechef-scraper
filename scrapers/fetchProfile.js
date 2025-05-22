const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (handle) => {
  try {
    if (!handle || typeof handle !== "string" || handle.trim() === "") {
      return {
        success: false,
        error: "Invalid Input",
        message: "Username cannot be empty",
        status: 400,
      };
    }

    const { data } = await axios.get(
      `https://www.codechef.com/users/${handle}`
    );

    if (
      data.includes("User not found") ||
      data.includes("Could not find user")
    ) {
      return {
        success: false,
        error: "User Not Found",
        message: `No CodeChef user found with handle: ${handle}`,
        status: 404,
      };
    }

    const $ = cheerio.load(data);

    const profile = $(".user-details-container");
    const ratingRanks = $(".rating-ranks");
    const totalSolved = $(".rating-data-section");

    if (!profile.length) {
      return {
        success: false,
        error: "Profile Data Error",
        message: "Could not find profile data",
        status: 500,
      };
    }

    const name = profile.find("h1.h2-style").text().trim();
    const profileImage = profile.find("img").attr("src");
    const currentRating = parseInt($(".rating-number").first().text()) || 0;
    const highestRating =
      parseInt(
        $(".rating-number").parent().find("small").text().replace(/[^\d]/g, "")
      ) || 0;
    const stars = $(".rating").first().text().trim() || "0★";
    const countryName =
      $(".user-country-name").text().trim() || "Not specified";
    const countryFlag = $(".user-country-flag").attr("src") || "";

    const globalRank =
      parseInt(
        ratingRanks.find(".inline-list li").first().find("strong").text()
      ) || 0;
    const countryRank =
      parseInt(
        ratingRanks.find(".inline-list li").last().find("strong").text()
      ) || 0;

    const totalSolvedCount = totalSolved
      .find("h3")
      .last()
      .text()
      .split(":")[1]
      .trim();
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
      totalSolvedCount,
      status: 200,
    };
  } catch (err) {
    if (err.response) {
      if (err.response.status === 404) {
        return {
          success: false,
          error: "User Not Found",
          message: `No CodeChef user found with handle: ${handle}`,
          status: 404,
        };
      }
      if (err.response.status === 403) {
        return {
          success: false,
          error: "Access Denied",
          message: "Access to CodeChef profile was denied",
          status: 403,
        };
      }
    }

    if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      return {
        success: false,
        error: "Connection Error",
        message: "Could not connect to CodeChef. Please try again later.",
        status: 503,
      };
    }

    return {
      success: false,
      error: "Error fetching profile data",
      message: err?.message || "Unknown error occurred",
      status: 500,
    };
  }
};
