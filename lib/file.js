/**
 *  lss - File class
 *  @license MIT
 */

var npath = require('path'),
    digitsRE = /\d+/g;

var File = module.exports = function(path) {
    var basename = this.basename = npath.basename(path);
    this.chars = path.split(digitsRE);
    this.path = path;

    if (this.chars[0] === '') this.chars.shift();
    if (this.chars[this.chars.length-1] === '') this.chars.pop();

    this.digits = [];
    var match;

    while ((match = digitsRE.exec(basename)) !== null) {
        this.digits.push({
            match: match[0],
            index: match.index
        });
    }
};

File.prototype.diff = function diff(file) {
    var diffs = [], a, b, i;
    
    if (!(file instanceof File)) file = new File(file);

    if(this.path === file.path) return diffs;

    if (this.digits.length !== file.digits.length) return diffs;


    for (i = 0; i < this.digits.length; i++) {
        a = this.digits[i];
        b = file.digits[i];

        if (a.index === b.index && a.match != b.match) {
            diffs.push({index: a.index, matches: [a.match, b.match]});
        }
    }

    return diffs;
};
