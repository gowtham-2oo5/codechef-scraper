const axios = require("axios");

module.exports = async (handle) => {
  try {
    const { data: html } = await axios.get(
      `https://www.codechef.com/users/${handle}`
    );
    const ratingStart =
      html.indexOf("var all_rating = ") + "var all_rating = ".length;
    const ratingEnd = html.indexOf("var current_user_rating =") - 6;
    const ratingData = JSON.parse(html.substring(ratingStart, ratingEnd));

    return { success: true, ratingData };
  } catch (err) {
    return {
      success: false,
      error: "Error fetching profile data.",
      message: err?.message || "Unknown error",
    };
  }
};
