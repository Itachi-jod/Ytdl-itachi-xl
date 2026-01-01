const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const videoUrl = req.query.url;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing ?url parameter"
      });
    }

    const payload = new URLSearchParams({
      url: videoUrl
    }).toString();

    const response = await axios.post(
      "https://api.vidssave.com/api/contentsite_api/media/parse",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "Origin": "https://vidssave.com",
          "Referer": "https://vidssave.com/",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
          "X-Requested-With": "XMLHttpRequest"
        },
        timeout: 20000
      }
    );

    const data = response.data;

    if (!data || !Array.isArray(data.medias)) {
      return res.status(404).json({
        success: false,
        message: "No media found"
      });
    }

    const video = data.medias.find(
      m => m.url && m.ext === "mp4"
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "MP4 video not available"
      });
    }

    // ✅ Pretty printed response
    return res.status(200).json(
      {
        success: true,
        author: "ItachiXD",
        platform: data.platform || "Unknown",
        download_url: video.url
      },
      null,
      2
    );

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
