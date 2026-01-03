// Author: ItachiXD

const axios = require("axios");

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        author: "ItachiXD",
        message: "Only GET method is allowed"
      });
    }

    const videoUrl = req.query.url;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        author: "ItachiXD",
        message: "Missing url parameter"
      });
    }

    // Call the POST-only API internally
    const response = await axios.post(
      "https://tools.xrespond.com/api/youtube/video/downloader",
      { url: videoUrl },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Origin": "https://downsocial.io",
          "Referer": "https://downsocial.io/"
        }
      }
    );

    const data = response.data;

    if (!data || !data.formats) {
      return res.status(500).json({
        success: false,
        author: "ItachiXD",
        message: "Failed to fetch video formats"
      });
    }

    // Pick ONLY 1080p
    const format1080 = data.formats.find(
      f => f.quality === "1080p" && f.url
    );

    if (!format1080) {
      return res.status(404).json({
        success: false,
        author: "ItachiXD",
        message: "1080p format not available"
      });
    }

    return res.status(200).json({
      success: true,
      author: "ItachiXD",
      platform: "YouTube",
      download_url: format1080.url
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      author: "ItachiXD",
      error: err.message
    });
  }
};
