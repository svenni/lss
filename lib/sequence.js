/**
 *  lss - Sequence class
 *  @license MIT
 */

var File = require('./file');

var Sequence = module.exports = function(files) {
    this.start = Number.POSITIVE_INFINITY;
    this.end = Number.NEGATIVE_INFINITY;
    
    if (files && files.length > 0) {
        files = files.map(function(file) {
            if (!(file instanceof File)) file = new File(file);
            return file;
        });

         if(files.length == 1){
        //      console.log('single ' + files[0].path);
              this.files = [files[0]];
        }  else {
            this.files = [files.pop()];    
        }
        files.forEach(this.push.bind(this));
    }
    else this.files = [];
};

Sequence.prototype.contains = function contains(file) {
    //console.log("containing");
    //console.log(file);
    //console.log('/\\/\\/\\');
    if (this.files.length === 0) return false;
    //console.log('2');
    if (!(file instanceof File)) file = new File(file);

    var diffs = this.files[0].diff(file);
    //console.log(diffs);
    if (diffs.length > 1) return false;
    if (!this.files[0].chars.every(function(match, i) {
        return match === file.chars[i];
    })) return false;

    if (this._significantGroup &&
        this._significantGroup.index !== diffs[0].index) return false;

    return true;
};

Sequence.prototype.push = function push(file) {
    //console.log('pushing');
    if (!(file instanceof File)) file = new File(file);
    if (!this.contains(file)) throw new NotInSequenceError(file.basename);
    var diff = this.files[this.files.length-1].diff(file)[0];
    //console.log(file.path);
    //console.log(diff);
    //console.log('-*--*-');
    var lastIndex, fileIndex;
    if(diff === undefined){ //single
        lastIndex = 1;
        fileIndex = 1;
    } else {
        lastIndex = parseInt(diff.matches[0]);
        fileIndex = parseInt(diff.matches[1]);
    }

    // maintain ordering.
    if (lastIndex < fileIndex) this.files.push(file);
    else if (lastIndex > fileIndex) this.files.splice(this.files.length-1, 0, file);

    // calculate start / end.
    this.start = Math.min(this.start, lastIndex, fileIndex);
    this.end = Math.max(this.end, lastIndex, fileIndex);

    // note the significant digit group.
    if (!this._significantGroup) {
        if (diff === undefined) {
            //console.log(file);
            //console.log('got nul');
            this._significantGroup = null;
        } else {
            this._significantGroup = {
                index: diff.index,
                length: diff.matches[0].length
            }
        }
    }
    //console.log(this._significantGroup)
};

Sequence.prototype.format = function format(fmt) {
    var str = fmt = fmt || '%b%p%a',
        re = /%(.\d)?./g,
        replacements = {},
        padding ,matches, placeholder, directive;

    while ((matches = re.exec(fmt))) {
        placeholder = matches[0];

        if (replacements[placeholder]) continue;
        
        directive = placeholder.slice(-1);
        
        if (matches[1]) {
            padding = new Array(parseInt(matches[1][1])+1).join(matches[1][0]);
        }
        else padding = false;

        replacements[placeholder] = this._replace(directive, padding);

        // replace all occurances of the placeholder at once.
        str = str.split(placeholder).join(replacements[placeholder]);
    }

    return str;
};

Sequence.prototype._replace = function(directive, padding) {
    var r, sg = this._significantGroup, file = this.files[0];

    switch (directive) {

        // start of sequence
        case 's': r = this.start; break;
        
        // end of sequence
        case 'e': r = this.end; break;

        // length of sequence
        case 'l': r = this.end - this.start + 1; break;
        
        // sequence range (e.g. 1-100)
        case 'r': r = this.start + '-' + this.end; break;

        // sequence padding (e.g. %04d)
        case 'p': 
            if(sg !== null){
                r = '%0' + sg.length + 'd';
            } else {
                r = '';
            }
            break;

        // number sign sequence padding (e.g. ####)
        case '#':
            if (sg !== null){
                r = new Array(sg.length+1).join('#');
            } else {
                r = '';
            }
            break;

        // sequence name part BEFORE the numerical index.
        case 'b': 
            if(sg !== null){
                r = file.basename.substring(0, sg.index);
            } else {
                r = file.basename;
            } 
            break;

        // sequence name part AFTER the numerical index.
        case 'a': 
            if(sg !== null) {
                r = file.basename.substring(sg.index + sg.length);
            } else {
                r = '';
            }
            break;

        // sequence directory
        case 'd': r = file.path.replace(file.basename, ''); break;

        default: return directive;
    }

    function pad(str) {
        return padding ? (padding + str).slice(-padding.length) : str;
    }

    if (directive == 'r') return r.split('-').map(pad).join('-');
    else if (['p','#','b','a','d'].indexOf(directive) > -1) return r;
    else return pad(r);
};

// Error.

var NotInSequenceError = function(file) {
    var err = Error.call(this, '\'' + file + '\' not in sequence.');
    err.name = 'NotInSequenceError';
    return err;
};

NotInSequenceError.prototype = Object.create(Error.prototype, {
    constructor: {value: NotInSequenceError}
});
