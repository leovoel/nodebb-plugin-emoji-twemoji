"use strict";

module.exports = {
  separationLeading: {
    no_mouth: /:[-=]?#/i,
    cry: /:[-=]?[\*']\(/i,
    grinning: /:[-=]?\)/,
    frowning: /:[-=]?\(/,
    sunglasses: /[8b][-=]?[\|\)]/i,
    wink: /;[-=]?\)/,
    relieved: /;[-=]?\(/,
    expressionless: /:[-=]?\|/,
    blush: /:[-=]?\$|:&quot;/,
    smirk: /:\^\)/,
    sleeping: /[\|i][-=]?\)/,
    pensive: /\|[-=]?\(/,
    mask: /:[-=]?&amp;/,
    trollface: /;\/\)/,
    rage: [/:[-=]?@/, /x[-=]?\(/i],
    confused: /:[-=]?\?/,
    question: /\?\?\?/,
    exclamation: /!!!/
  },
  separationWrapped: {
    heart: /&lt;3/,
    broken_heart: /&lt;[\/\\\|!]3/,
    laughing: /x[-=]?d/i,
    zzz: /zzz/i,
    eyes: /o_o/i,
    smiley: /:[-=]?d/i,
    hushed: /:[-=]?o/i,
    stuck_out_tongue_winking_eye: /:[-=]?p/i,
    confounded: /:[-=]?s/i,
    no_mouth: /:[-=]?x/i
  }
};
