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

    let downloadUrl = null;

    // 🔹 Case 1: links[]
    if (data?.data?.links?.length) {
      const v1080 = data.data.links.find(v =>
        String(v.resolution || v.quality).includes("1080")
      );
      downloadUrl = v1080?.download_url || v1080?.url;
    }

    // 🔹 Case 2: videos[]
    if (!downloadUrl && data?.data?.videos?.length) {
      const v1080 = data.data.videos.find(v =>
        String(v.quality).includes("1080")
      );
      downloadUrl = v1080?.url;
    }

    // 🔹 Case 3: formats[]
    if (!downloadUrl && data?.data?.formats?.length) {
      const v1080 = data.data.formats.find(v =>
        String(v.resolution).includes("1080")
      );
      downloadUrl = v1080?.download_url || v1080?.url;
    }

    // 🔹 Case 4: direct video
    if (!downloadUrl && data?.data?.video?.url) {
      downloadUrl = data.data.video.url;
    }

    if (!downloadUrl) {
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
          download_url: downloadUrl
        },
        null,
        2 // ✅ PRETTY PRINT
      )
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
