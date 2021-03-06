// Twitch API stuff
require("dotenv").config();
var axios = require("axios");
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

var getPubsubUrl = channelId =>
  "https://api.twitch.tv/extensions/message/" + channelId;

var getHeaders = channelId => ({
  "Content-Type": "application/json",
  "Client-Id": clientId,
  Authorization: "Bearer " + getToken(channelId)
});

var getPubsubBody = obj => ({
  content_type: "application/json",
  message: JSON.stringify(obj),
  targets: ["broadcast"]
});

var getChannelId = channelName =>
  axios({
    method: "get",
    url: `https://api.twitch.tv/kraken/users?login=${channelName}`,
    headers: {
      Accept: "application/vnd.twitchtv.v5+json",
      "Client-Id": clientId
    }
  })
    .then(({ data }) => {
      const {
        users: [{ _id: channelId }]
      } = data;
      return channelId;
    })
    .catch(err => {
      console.log(err);
      return undefined;
    });

module.exports = {
  getToken,
  getPubsubUrl,
  getHeaders,
  getPubsubBody,
  getChannelId
};
