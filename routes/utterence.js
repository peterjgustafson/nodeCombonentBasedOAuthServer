var natural = require('natural');

var path = require("path");

const keywords = require("./keywords");

var base_folder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
var rulesFilename = base_folder + "/data/English/tr_from_posjs.txt";
var lexiconFilename = base_folder + "/data/English/lexicon_from_posjs.json";
var defaultCategory = 'N';
var defaultCategory2 = 'X';

var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var orderLexicon = new natural.Lexicon(path.join(__dirname, "order-parts-rose.json"), defaultCategory2);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);
var orderRules = new natural.RuleSet(path.join(__dirname, "rules.txt"));
var orderTagger = new natural.BrillPOSTagger(orderLexicon, orderRules);


// deserialize
var sentenceTxt = "a triple cheeseburger with double cheese ketchup no lettuce a large fries with light salt and a large chocolate shake";
for(var keyword = 0; keyword < keywords.length; keyword++) {
    if(sentenceTxt.indexOf(keywords[keyword])) {
        var currentKeyword = keywords[keyword].replace(" ", "-");
        sentenceTxt = sentenceTxt.replace(keywords[keyword], currentKeyword);
    }
}

var sentence = sentenceTxt.split(" ");


//console.log(JSON.stringify(tagger.tag(sentence)));
console.log(sentenceTxt);
var taggedSentence = orderTagger.tag(sentence);
console.log(taggedSentence[0]);
var last_item;
var last_action;
var last_qty;
for (var i = 0; i < taggedSentence.length; i++) {
    // is a cancel word detected
    //console.log(taggedSentence[i][1]);
    if(taggedSentence[i][1] == "REMOVE_FROM_ORDER")
        console.log("Action: Cancel Item");

    if(taggedSentence[i][1] == "ADD_TO_ORDER")
        console.log("Action: Add Item");

    if(i != 0) {
        if(taggedSentence[i][1] == "QTY" && taggedSentence[i-1][1] != "REMOVE_FROM_ORDER" && taggedSentence[i-1][1] != "ADD_TO_ORDER")
            console.log("Action: Add Item", "QTY: ", taggedSentence[i][0]);
        else if (taggedSentence[i][1] == "QTY")
            console.log("Action: Add Item");
    }
    else if(taggedSentence[i][1] == "QTY") {
        console.log("Action: Add Item", "QTY: ", taggedSentence[i][0]);
    }
}

console.log(JSON.stringify(taggedSentence));



