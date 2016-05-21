"use strict";

let _ = require("lodash");
let Q = require("q");
let fs = require("fs");
let path = require("path");

let downloadCommons = require("nodebb-plugin-emoji-extended/lib/commons/download");

const VERSION = 1;
const EMOJI_DETAILS = "https://raw.githubusercontent.com/Ranks/emojione/master/emoji.json";
const INDEX_FIELDS = ["id", "file", "category", "aliases"];

/*===================================================== Exports  =====================================================*/

exports.build = buildIndex;
exports.read = readIndex;

/*==================================================== Functions  ====================================================*/

function readIndex(assetsPath) {
  return Q
      .nfcall(fs.readFile, path.join(assetsPath, "index.json"))
      .then(function (index) {
        let dataByFile = {};
        _.each(JSON.parse(index).categories, function (list, category) {
          _.each(list, function (emoji) {
            emoji.category = category;
            dataByFile[emoji.file] = emoji;
          });
        });
        return Q
            .nfcall(fs.readdir, assetsPath)
            .then(function (files) {
              return _
                  .chain(files)
                  .map(function (file) {
                    let fileId = path.basename(file, ".svg");
                    if (dataByFile.hasOwnProperty(fileId)) { return _.pick(dataByFile[fileId], INDEX_FIELDS); }
                  })
                  .compact()
                  .value();
            });
      });
}

function buildIndex(assetsPath) {
  return getEmojiDetails()
      .then(categorize)
      .then(function (index) {
        return Q
            .nfcall(fs.writeFile, path.join(assetsPath, "index.json"), JSON.stringify({
              _v: VERSION, categories: index.categories
            }))
            .then(_.constant(index));
      });
}

function getEmojiDetails() {
  return downloadCommons.buffer(EMOJI_DETAILS, true).then(function (buf) { return JSON.parse(buf.toString()); });
}

function categorize(emojiDetails) {
  let categories = {};
  let list = _.each(emojiDetails, function (value, key) {
    let category = value.category;
    let emoji = {id: key, file: value.unicode};
    if (value.aliases.length) {
      emoji.aliases = _.map(value.aliases, function (alias) { return alias.substring(1, alias.length - 1); });
    }
    category = categories.hasOwnProperty(category) ? categories[category] : categories[category] = [];
    category.push(emoji);
  });
  return {categories: categories, list: list};
}
