const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const path = req.url.split("?")[0];

    // ONLY allow /api/download
    if (path !== "/api/download") {
      return res.status(200).json({
        success: true,
        author: "ItachiXD",
        message: "Social Video Downloader API",
        endpoint: "/api/download?url="
      });
    }

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

    const medias = response.data?.data?.medias;

    if (!Array.isArray(medias) || medias.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No media found"
      });
    }

    const video = medias.find(
      m => m.url && (m.ext === "mp4" || m.mime?.includes("video"))
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "MP4 video not available"
      });
    }

    // ✅ FINAL RESPONSE (PRETTY)
    return res.status(200).json(
      {
        success: true,
        author: "ItachiXD",
        platform: response.data?.data?.platform || "Unknown",
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
