const https = require("https");

module.exports = async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Missing url parameter"
      });
    }

    const oembedUrl =
      "https://www.youtube.com/oembed?format=json&url=" +
      encodeURIComponent(url);

    https.get(oembedUrl, (r) => {
      let data = "";

      r.on("data", chunk => (data += chunk));
      r.on("end", () => {
        try {
          JSON.parse(data); // validate JSON

          return res.status(200).setHeader("Content-Type", "application/json").end(
            JSON.stringify(
              {
                success: true,
                author: "ItachiXD",
                platform: "Youtube",
                download_url: null
              },
              null,
              2
            )
          );
        } catch {
          return res.status(500).json({
            success: false,
            message: "Invalid YouTube response"
          });
        }
      });
    }).on("error", () => {
      return res.status(500).json({
        success: false,
        message: "Request failed"
      });
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal error"
    });
  }
};
