var template =
  '"Dota 2 Integration Configuration"\r\n{\r\n    "uri"           "http://twitch.arpittarang.com/gamestate/{channel_id}"\r\n    "timeout"       "5.0"\r\n    "buffer"        "1.1"\r\n    "throttle"      "0.5"\r\n    "heartbeat"     "30.0"\r\n    "data"\r\n    {\r\n        "provider"      "1"\r\n        "player"        "1"\r\n        "items"         "1"\r\n    }\r\n}\r\n';
(function() {
  window.Twitch.ext.onAuthorized(function(auth) {
    var element = document.getElementById("downloadlink");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(template.replace(/\{channel_id\}/gi, auth.channelId))
    );
    element.setAttribute("download", "gamestate_integration_twitch.cfg");
  });
})();
