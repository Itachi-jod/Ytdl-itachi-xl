const axios = require("axios");
const FormData = require("form-data");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Only GET method allowed"
    });
  }

  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      success: false,
      message: "Missing url parameter"
    });
  }

  try {
    const form = new FormData();
    form.append("url", videoUrl);

    const response = await axios.post(
      "https://tools.xrespond.com/api/youtube/video/downloader",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/137.0.0.0 Mobile Safari/537.36",
          "Origin": "https://downsocial.io",
          "Referer": "https://downsocial.io/",
          "Accept": "application/json"
        }
      }
    );

    const data = response.data;

    if (!data?.data?.links) {
      return res.status(404).json({
        success: false,
        message: "No media found"
      });
    }

    // Pick ONLY 1080p
    const video1080 = data.data.links.find(
      v => v.type === "video" && v.resolution === "1080p"
    );

    if (!video1080) {
      return res.status(404).json({
        success: false,
        message: "1080p video not available"
      });
    }

    res.setHeader("Content-Type", "application/json");

    return res.end(
      JSON.stringify(
        {
          success: true,
          author: "ItachiXD",
          platform: "YouTube",
          title: data.data.title,
          thumbnail: data.data.thumbnail,
          download_url: video1080.download_url
        },
        null,
        2 // ✅ pretty print
      )
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
