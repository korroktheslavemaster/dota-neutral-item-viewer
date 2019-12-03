// Twitch API stuff
require("dotenv").config();

var jwt = require("jsonwebtoken");
const secret = Buffer.from(process.env.SECRET, "base64");
const userId = process.env.USER_ID;
const clientId = process.env.CLIENT_ID;

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

module.exports = {
  getToken,
  getUrl,
  getHeaders,
  getBody
};
