require("dotenv").config();
const express = require("express");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var axios = require("axios");
var cors = require("cors");
const secret = new Buffer(process.env.SECRET, "base64");
const userId = process.env.USER_ID;
const clientId = process.env.CLIENT_ID;

var itemsJson = require("./items.json");
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

// not using this endpoint, just fetching from github raw
// otherwise will have to set up SSL here
app.get("/items.json", (req, res) => {
  res.json(itemsJson);
});

app.post("/:channelId", (req, res) => {
  const channelId = req.params.channelId;
  const { items } = req.body;
  if (typeof items == "object") {
    const itemNames = Object.values(items)
      .map(({ name = "empty" }) => name)
      .filter(name => name != "empty");
    const namesWithoutPrefix = itemNames.map(name => String(name).substring(5));
    console.log(namesWithoutPrefix);
    axios({
      method: "post",
      url: getUrl(channelId),
      headers: getHeaders(channelId),
      data: getBody(namesWithoutPrefix)
    })
      .then(function(response) {
        console.log(response.status);
      })
      .catch(function(error) {
        console.log(error);
      });
  }
  res.send("ok");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// Twitch API stuff

var getToken = channelId => {
  var exp = Math.round(new Date().getTime() / 1000) + 259200; // 3 days?
  var body = {
    exp: exp,
    user_id: userId,
    role: "external",
    channel_id: channelId,
    pubsub_perms: {
      send: ["broadcast"]
    }
  };
  return jwt.sign(body, secret);
};

var getUrl = channelId =>
  "https://api.twitch.tv/extensions/message/" + channelId;

var getHeaders = channelId => ({
  "Content-Type": "application/json",
  "Client-Id": clientId,
  Authorization: "Bearer " + getToken(channelId)
});

var getBody = itemsList => ({
  content_type: "application/json",
  message: JSON.stringify({
    items: itemsList
  }),
  targets: ["broadcast"]
});
