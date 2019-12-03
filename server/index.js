require("dotenv").config();
const express = require("express");
var bodyParser = require("body-parser");
var axios = require("axios");
var cors = require("cors");
var { getUrl, getHeaders, getBody } = require("./twitch-api");

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

app.post("/gamestate/:channelId", (req, res) => {
  const channelId = req.params.channelId;
  const { items } = req.body;
  if (typeof items == "object") {
    const itemNames = Object.values(items)
      .map(({ name = "empty" }) => name)
      .filter(name => name != "empty");
    const namesWithoutPrefix = itemNames.map(name => String(name).substring(5));
    // console.log(namesWithoutPrefix);
    axios({
      method: "post",
      url: getUrl(channelId),
      headers: getHeaders(channelId),
      data: getBody(namesWithoutPrefix)
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
