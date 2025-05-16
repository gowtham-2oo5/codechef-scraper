const fetchRecent = require("./fetchRecent");
const fetchProfile = require("./fetchProfile");
const fetchRatings = require("./fetchRatings");

module.exports = async (handle) => {
  try {
    const profileData = await fetchProfile(handle);

    const name = profileData.name;
    const profileImage = profileData.profileImage;
    const currentRating = profileData.currentRating;
    const highestRating = profileData.highestRating;
    const stars = profileData.stars;
    const countryName = profileData.countryName;
    const countryFlag = profileData.countryFlag;
    const globalRank = profileData.globalRank;
    const countryRank = profileData.countryRank;
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
