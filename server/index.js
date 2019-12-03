require("dotenv").config();
const express = require("express");
var bodyParser = require("body-parser");
var axios = require("axios");
var cors = require("cors");
var { getPubsubUrl, getHeaders, getPubsubBody } = require("./twitch-api");

const app = express();
const port = process.env.PORT || 4000;
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(cors());

app.post("/gamestate/:channelId", (req, res) => {
  const channelId = req.params.channelId;
  const { items, provider } = req.body;
  if (typeof items == "object") {
    const itemNames = Object.values(items)
      .map(({ name = "empty" }) => name)
      .filter(name => name != "empty");
    var timestamp =
      provider && provider.timestamp
        ? provider.timestamp
        : Math.round(new Date().getTime() / 1000);
    if (provider && provider.timestamp)
      console.log("channel", channelId, "timestamp", provider.timestamp);
    else console.log("channel", channelId, "no timestamp? so", timestamp);
    const namesWithoutPrefix = itemNames.map(name => String(name).substring(5));
    // console.log(namesWithoutPrefix);
    axios({
      method: "post",
      url: getPubsubUrl(channelId),
      headers: getHeaders(channelId),
      data: getPubsubBody({ timestamp: timestamp, items: namesWithoutPrefix })
    })
      // .then(function(response) {
      //   console.log(response.status);
      // })
      .catch(function(error) {
        console.log(error);
      });
  }
  res.send("ok");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
