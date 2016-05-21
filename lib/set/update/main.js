"use strict";

let _ = require("lodash");
let Q = require("q");
let fs = require("fs");
let path = require("path");
let wrench = require("wrench");
let AdmZip = require("adm-zip");

let fsCommons = require("nodebb-plugin-emoji-extended/lib/commons/fs");
let downloadCommons = require("nodebb-plugin-emoji-extended/lib/commons/download");
let index = require("./index");

const BASE_PATH = "twemoji-lean-master";
const ARCHIVE = "https://codeload.github.com/leovoel/twemoji-lean/zip/master";
const IMAGES = BASE_PATH + "/svg";
const LICENSE = BASE_PATH + "/LICENSE";

let updating = null;

/*===================================================== Exports  =====================================================*/

module.exports = update;

/*==================================================== Functions  ====================================================*/

function update(assetsPath) {
  if (updating == null) {
    updating = flow(assetsPath);
    updating.done(updateDone, updateDone);
  }
  return updating;
}

function flow(assetsPath) {
  return downloadFiles(assetsPath)
      .then(function (tmpPath) {
        return index
            .build(assetsPath, path.join(tmpPath, BASE_PATH))
            .then(function (index) {
              wrench.rmdirRecursive(tmpPath);
              return index;
            });
      });
}

function downloadFiles(assetsPath) {
  wrench.mkdirSyncRecursive(path.resolve(assetsPath, ".."));
  let tmpPath = path.join(assetsPath, "..", "." + path.basename(assetsPath));
  return Q.nfcall(fsCommons.access, tmpPath, fs.F_OK)
      .then(function () { wrench.rmdirSyncRecursive(tmpPath); }, _.noop)
      .then(function () { return downloadCommons.buffer(ARCHIVE, true); })
      .then(function (buf) {
        let zip = new AdmZip(buf);
        zip.extractAllTo(tmpPath, true);
        return Q
            .nfcall(fsCommons.access, assetsPath, fs.F_OK)
            .then(function () { wrench.rmdirSyncRecursive(assetsPath); }, _.noop)
            .then(function () { return Q.nfcall(fs.rename, path.join(tmpPath, IMAGES), assetsPath); })
            .then(function () {
              return Q.nfcall(fs.rename, path.join(tmpPath, LICENSE), path.join(assetsPath, "LICENSE"));
            })
            .then(_.constant(tmpPath));
      });
}

function updateDone() { updating = null; }
