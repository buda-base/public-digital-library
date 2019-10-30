/*
 * This file contains utilities to auto detect the lang tag of a string
 * in the context of BUDA. While many lang tags are obvious and based
 * on the Unicode range, the various types of transliterations are much more
 * difficult to handle.
 *
 * We rely on several criteria:
 *  - Unicode range
 *  - possible non-ascii characters and impossible ascii characters
 *  - length of char sequences with no space
 *  - character frequency
 */

var nativeranges = [
	{"range": [0x0900, 0x097F], "lt": "deva"},
	{"range": [0x0F00, 0x0FFF], "lt": "tibt"},
	{"range": [0x1780, 0x17FF], "lt": "khmr"},
	{"range": [0x2E80, 0x2EFF], "lt": "hani"},
	{"range": [0x3000, 0x303F], "lt": "hani"},
	{"range": [0x3200, 0x9FFF], "lt": "hani"},
	{"range": [0xF900, 0xFAFF], "lt": "hani"},
	{"range": [0x20000, 0x2CEAF], "lt": "hani"},
	{"range": [0x0900, 0x097F], "lt": "hani"}
];

var transinfos = {
	"ewts": {
		"nonalphaok": "*@#+-~'`?&/;:=().",
		"alphanok": "xqfv",
		"maxlen": 10 // quite conservative
	},
	"pinyin": {
		"nonalphaok": "(),-üÜāēīōūǖĀĒĪŌŪǕáéíóúǘÁÉÍÓÚǗǎěǐǒǔǚǍĚǏǑǓǙàèìòùǜÀÈÌÒÙǛ◌̄◌́◌̌◌̀",
		"alphanok": ""
	},
	"iast": {
		"nonalphaok": "ṁṀm̐M̐ṃṂ-|āĀīĪūŪṛṚṝṜḷḶḹḸḥḤṅṄñÑṭṬḍḌṇṆśŚṣṢḻḺ",
		"alphanok": "fx"
	}
};

function guessFromRange(char) {
	var cp = char.codePointAt(0);
	for (const nl of nativeranges) {
		if (cp > nl['range'][0] && cp < nl['range'][1]) {
			return nl['lt'];
		}
	}
	return null;
}

function okforlt(char, wordlen, transname) {
	var transinfo = transinfos[transname];
	if (wordlen && transinfo["maxlen"] && wordlen >= transinfo["maxlen"]) {
		return false;
	}
	var codepoint = char.codePointAt(0);
	// [0-9a-zA-Z]
	var isalpha = ((codepoint >= 48 && codepoint <= 57) || (codepoint >= 65 && codepoint <= 90) || (codepoint >= 97 && codepoint <= 122));
	if (isalpha && transinfo["alphanok"].includes(char)) {
		return false;
	}
	if (!isalpha && !transinfo["nonalphaok"].includes(char)) {
		return false;
	}
	return true;
}

function narrowWithChar(char, wordlen, lttotest) {
	return lttotest.filter(lt => okforlt(char, wordlen, lt));
}

export function narrowWithString(strtoguess, transtotest) {
	var wordlen = 0;
	var triedrange = false;
	for (let char of strtoguess) { // iterates on Unicode code points, not code units
		if (char == " ") {
			wordlen = 0;
			continue
		}
		if (!triedrange) {
			triedrange = true;
			var resFromRange = guessFromRange(char);
			if (resFromRange) {
				return [resFromRange];
			}
		}
		transtotest = narrowWithChar(char, wordlen, transtotest);
		if (transtotest.length < 2)
			return transtotest; 
	}
	return transtotest;
}
