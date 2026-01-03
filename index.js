const axios = require("axios");
const FormData = require("form-data");

module.exports = async (req, res) => {
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
        },
        timeout: 20000
      }
    );

    const data = response.data;
    const urls = [];

    // helper to push safely
    const pushUrl = (u) => {
      if (u && typeof u === "string" && u.startsWith("http")) {
        urls.push(u);
      }
    };

    // 🔍 Scan ALL known structures
    if (data?.data?.links) {
      data.data.links.forEach(v => {
        pushUrl(v.url);
        pushUrl(v.download_url);
      });
    }

    if (data?.data?.videos) {
      data.data.videos.forEach(v => {
        pushUrl(v.url);
      });
    }

    if (data?.data?.formats) {
      data.data.formats.forEach(v => {
        pushUrl(v.url);
        pushUrl(v.download_url);
      });
    }

    if (data?.data?.video?.url) {
      pushUrl(data.data.video.url);
    }

    // remove duplicates
    const uniqueUrls = [...new Set(urls)];

    if (uniqueUrls.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No media found"
      });
    }

    res.setHeader("Content-Type", "application/json");

    return res.end(
      JSON.stringify(
        {
          success: true,
          author: "ItachiXD",
          platform: "YouTube",
          download_urls: uniqueUrls
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
