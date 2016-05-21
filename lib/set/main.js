"use strict";

let _ = require("lodash");
let Q = require("q");
let fs = require("fs");
let path = require("path");
let wrench = require("wrench");

let fsCommons = require("nodebb-plugin-emoji-extended/lib/commons/fs");
let parserCommons = require("nodebb-plugin-emoji-extended/lib/commons/parser");
let meta = require("./meta");
let index = require("./update/index");
let update = require("./update/main");
let mapping = require("./mapping");
let settings = require("../settings");

const BASE_PATH = path.resolve(path.dirname(module.filename), "../..");
const ASSETS_PATH = path.join(BASE_PATH, "public/static/images");
const URL = settings.urlBase + "/images";

let opts = {};
let aliasMap = {};

/*===================================================== Exports  =====================================================*/

exports.url = meta.url;
exports.name = settings.pkg.nbbpm.name;
exports.preview = meta.preview;
exports.mapping = mapping;
exports.license = null;
exports.moduleId = settings.name;
exports.description = meta.description;
exports.attribution = meta.attribution;

exports.mainStyles = function () { return fs.readFileSync(path.join(BASE_PATH, "public/static/styles/main.css")); };
exports.emailStyles = function () { return fs.readFileSync(path.join(BASE_PATH, "public/static/styles/email.css")); };

exports.use = use;
exports.parse = _.identity;
exports.purge = function () { wrench.rmdirSyncRecursive(ASSETS_PATH, true); };
exports.update = updateWrapper;
exports.prepared = prepared;

/*==================================================== Functions  ====================================================*/

function use(options) {
  opts = options;
  opts.parser = parser;
  // generate emoji list
  return generateList()
      .then(function (list) {
        // export new parse function
        exports.parse = parserCommons.genParser(URL, opts);
        return list;
      });
}

function parser(match, url, options) {
  // TODO: use cdn links instead of having to download files?
  let id = match[1], isAlias = aliasMap.hasOwnProperty(id), realId = isAlias ? aliasMap[id] : id;
  let res = "<img src=\"" + url + "/" + encodeURIComponent(options.fileById[realId]) + ".svg\" ";
  for (let key in options.attributes) {
    res += key + "=\"" + options.attributes[key].apply(options, match) + "\" ";
  }
  if (isAlias) {
    res += "data-alias-of=\"" + realId + "\"";
  }
  return res + "/>";
}

function updateWrapper() { return update(ASSETS_PATH).then(generateList); }

function prepared() {
  try {
    fsCommons.accessSync(path.join(ASSETS_PATH, "index.json"), fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function generateList() {
  return index
      .read(ASSETS_PATH)
      .then(function (list) {
        list = _.filter(list, function (item) { return !_.includes(opts.excludes, item.id); });
        opts.fileById = _.chain(list).mapKeys("id").mapValues("file").value();
        opts.list = _.chain(list)
            .map("id")
            .concat(_.chain(list)
                .map(function (item) {
                  return _.each(item.aliases, function (alias) { aliasMap[alias] = item.id; }) || [];
                })
                .flatten()
                .value())
            .value();
        return list;
      })
      .then(function (list) { return readLicense().then(_.constant(list)); });
}

function readLicense() {
  return Q
      .nfcall(fs.readFile, path.join(ASSETS_PATH, "LICENSE"))
      .then(function (license) { exports.license = license.toString(); });
}
