"use strict";

let settings = require("../settings");

/*===================================================== Exports  =====================================================*/

exports.description = "Twitter Emoji for Everyone <br/>" +
    "<a href=\"http://twitter.github.io/twemoji\" target=\"_blank\">http://twitter.github.io/twemoji</a>";

exports.attribution = null;

exports.preview = settings.urlBase + "/preview.png";

exports.url = [settings.urlBase + "/images/", {key: "file", encode: true}, ".svg"];
