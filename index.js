const axios = require("axios");
const qs = require("querystring");

module.exports = async (req, res) => {
  try {
    const pathname = req.url.split("?")[0];

    // Root
    if (pathname === "/" || pathname === "") {
      return res.status(200).json({
        success: true,
        author: "ItachiXD",
        message: "Vidssave-style Downloader API",
        endpoint: "/api/download?url="
      });
    }

    // Download endpoint
    if (pathname !== "/api/download") {
      return res.status(404).json({
        success: false,
        message: "Endpoint not found"
      });
    }

    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing url parameter"
      });
    }

    // Payload exactly like browser
    const payload = qs.stringify({
      url: targetUrl
    });

    const response = await axios.post(
      "https://api.vidssave.com/api/contentsite_api/media/parse",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json, text/plain, */*",
          "Origin": "https://vidssave.com",
          "Referer": "https://vidssave.com/",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
          "X-Requested-With": "XMLHttpRequest"
        },
        timeout: 20000
      }
    );

    const data = response.data;

    if (!data || !data.resources || !data.resources.length) {
      return res.status(200).json({
        success: false,
        message: "No media found"
      });
    }

    // Pick best video
    const video = data.resources
      .filter(r => r.type === "video" && r.download_url)
      .sort((a, b) => (b.quality || 0) - (a.quality || 0))[0];

    if (!video) {
      return res.status(200).json({
        success: false,
        message: "No downloadable video found"
      });
    }

    // FINAL RESPONSE (pretty printed)
    return res.status(200).json(
      {
        success: true,
        author: "ItachiXD",
        platform: data.platform || "Unknown",
        title: data.title || null,
        thumbnail: data.thumbnail || null,
        quality: video.quality || null,
        download_url: video.download_url
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
