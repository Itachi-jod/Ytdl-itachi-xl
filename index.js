const axios = require("axios");
const FormData = require("form-data");

module.exports = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Missing url parameter"
      });
    }

    const form = new FormData();
    form.append("url", url);

    const response = await axios.post(
      "https://tools.xrespond.com/api/youtube/video/downloader",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "Accept": "application/json",
          "Origin": "https://downsocial.io",
          "Referer": "https://downsocial.io/",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
        },
        timeout: 30000
      }
    );

    const links = response?.data?.data?.data?.links;

    if (!Array.isArray(links)) {
      return res.status(404).json({
        success: false,
        message: "No media links found"
      });
    }

    // 🎯 ONLY 1080p
    const video1080 = links.find(
      v => v.type === "video" && String(v.resolution).includes("1080")
    );

    if (!video1080) {
      return res.status(404).json({
        success: false,
        message: "1080p link not found"
      });
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");

    return res.status(200).json({
      success: true,
      author: "ItachiXD",
      platform: "Youtube",
      download_url: video1080.download_url
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch media",
      error: err.message
    });
  }
};
