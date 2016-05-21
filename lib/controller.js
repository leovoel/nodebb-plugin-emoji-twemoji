"use strict";

let semver = require("semver");
let winston = require("winston");

let settings = require("./settings");
let eePkg = null;

const SET_ID = "twemoji";
const EMOJI_EXTENDED = "nodebb-plugin-emoji-extended";
const REQUIRED_VERSION = settings.pkg.peerDependencies[EMOJI_EXTENDED];
const REQUIRED_PACKAGE = "'" + EMOJI_EXTENDED + "@" + REQUIRED_VERSION + "'";

try { eePkg = require(EMOJI_EXTENDED + "/package.json"); } catch (e) {}

if (eePkg == null) {
  winston.error("[plugins/" + settings.id + "] " + REQUIRED_PACKAGE + " not installed.");
} else if (semver.satisfies(eePkg.version, REQUIRED_VERSION)) {
  safeInit();
} else {
  let foundPackage = "'" + EMOJI_EXTENDED + "@" + eePkg.version + "'";
  winston.error("[plugins/" + settings.id + "] " + foundPackage + " found, but " + REQUIRED_PACKAGE + " required.");
}

function safeInit() {
  let setsCtrl = require(EMOJI_EXTENDED + "/lib/sets/controller");

  setsCtrl.register(require("./set/main"), SET_ID);

  settings.checkInit(function () {
    winston.info("[plugins/" + settings.id + "] Initial startup detected. Downloading twemoji assets...");
    let parser = require(EMOJI_EXTENDED + "/lib/parser/main");
    setsCtrl
        .getSetById(SET_ID)
        .update()
        .done(function () {
          winston.verbose("[plugins/" + settings.id + "] Download finished.");
          setsCtrl
              .setActive([SET_ID])
              .then(function () { return parser.refresh(); })
              .done(function () { winston.info("[plugins/" + settings.id + "] Emoji are ready."); });
        });
  });
}
