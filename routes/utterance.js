
var watson = require('watson-developer-cloud');
var natural = require('natural');
var path = require("path");
var base_folder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
var rulesFilename = base_folder + "/data/English/tr_from_posjs.txt";
var lexiconFilename = base_folder + "/data/English/lexicon_from_posjs.json";
var defaultCategory = 'N';
var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);

exports.Utterance = module.exports.Utterance = Utterance;

function Utterance(text, nlu) {
    var self = this;
    self.text = text;
    self.nlu = nlu;
    self.textSplit = self.text.split(" ");
    self.partsOfSpeech = tagger.tag(self.textSplit);
}

Utterance.prototype.getSemanticRoles = function(callback) {
    var self = this;
    var parameters = {
    'features': {
        'semantic_roles': {}
    },
    'text': self.text
    };
    self.nlu.analyze(parameters, function(err, response) {
    if (err)
        callback(err, null);
    else
        callback(null, response);
    });
}