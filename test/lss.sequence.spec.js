var should = require('should'),
    File = require('../lib/file'),
    Sequence = require('../lib/sequence');

var goodSequenceOfFileStrings = [
    '/path/to/a123Sequence.0001.txt',
    '/path/to/a123Sequence.0002.txt',
    '/path/to/a123Sequence.0003.txt',
    '/path/to/a123Sequence.0004.txt',
    '/path/to/a123Sequence.0005.txt'
];

var goodSequenceOfFileInstances = [
    new File('/path/to/a123Sequence.0001.txt'),
    new File('/path/to/a123Sequence.0002.txt'),
    new File('/path/to/a123Sequence.0003.txt'),
    new File('/path/to/a123Sequence.0004.txt'),
    new File('/path/to/a123Sequence.0005.txt')
];

var badSequenceOfFileStrings = [
    '/path/to/a123Sequence.0001.txt',
    '/path/to/a123Sequence.0002.txt',
    '/path/to/a123Sequence.0003.txt',
    '/path/to/a123Sequence.0004.txt',
    '/path/to/a124Sequence.0005.txt'
];

var badSequenceOfFileInstances = [
    new File('/path/to/a123Sequence.0001.txt'),
    new File('/path/to/a123Sequence.0002.txt'),
    new File('/path/to/a123Sequence.0003.txt'),
    new File('/path/to/a123Sequence.0004.txt'),
    new File('/path/to/a124Sequence.0005.txt')
];

var singleFileString = [
    '/path/to/singleFile123sequence.0001.txt'
];

var singleFileStringNoDigits = [
    '/path/to/nodigits.txt'
];

describe('new Sequence([File | String])', function() {

    describe('given an array of Files belonging to the same sequence',
        function() {

        var seq = new Sequence(goodSequenceOfFileInstances);

        it('should add all Files to \'.files\' array', function() {
            seq.files.should.have.length(5);
        });

        it('should set \'.start\' and \'.end\' to reflect the sequence ' +
           'range', function() {
            seq.start.should.equal(1);
            seq.end.should.equal(5);
        });
    });

    describe('given an Array of Files not all belonging to the same sequence',
        function() {

        it('should throw an error', function() {
            (function() {
                var seq = new Sequence(badSequenceOfFileInstances);
            }).should.throw();
        });
    });

    describe('given an Array of Strings belonging to the same sequence',
        function() {
        
        var seq = new Sequence(goodSequenceOfFileStrings);

        it('should create Files, adding them to \'.files\' array', function() {
            seq.files.should.have.length(5);
            seq.files[0].should.be.an.instanceof(File);
        });

        it('should set \'.start\' and \'.end\' to reflect the sequence ' +
           'range', function() {
            seq.start.should.equal(1);
            seq.end.should.equal(5);
        });
    });

    describe('given an Array of Strings not all belonging to the same sequence',
        function() {

        it('should throw an error', function() {
            (function() {
                var seq = new Sequence(badSequenceOfFileStrings);
            }).should.throw();
        });
    });

    describe('given an empty Array or nothing', function() {
        
        it('should create an empty \'.files\' array', function() {
            var seqA = new Sequence([]);
            seqA.files.should.have.length(0);

            var seqB = new Sequence();
            seqB.files.should.have.length(0);
        });
    });

    describe('given an Array of a single string',
        function() {

        var seq = new Sequence(singleFileString);

        it('should create File and add it to the \'.files\' array', function() {
            seq.files.should.have.length(1);
            seq.files[0].should.be.an.instanceof(File);
        });
    });

    describe('given an Array of a single string with no digits',
        function() {

        var seq = new Sequence(singleFileStringNoDigits);

        it('should create File and add it to the \'.files\' array', function() {
            seq.files.should.have.length(1);
            seq.files[0].should.be.an.instanceof(File);
        });
    });
});

describe('Sequence.prototype.contains(File | String)', function() {

    describe('given a String or File with a single difference element and ' +
        'matching non-digit characters', function() {

        var seq = new Sequence(goodSequenceOfFileStrings),
            fileString = '/path/to/a123Sequence.0006.txt',
            fileInstance = new File(fileString);

        it('should return true when the argument is a String', function() {
            seq.contains(fileString).should.be.true;
        });

        it('should return true when the argument is a File', function() {
            seq.contains(fileInstance).should.be.true;
        });

    });

    describe('given a String or File with a single difference element with ' +
        'index unequal to the sequence\'s significantGroup index', function() {

        var seq = new Sequence(goodSequenceOfFileStrings),
            fileString = '/path/to/a124Sequence.0001.txt',
            fileInstance = new File(fileString);

        it('should return false when the argument is a String', function() {
          seq.contains(fileString).should.be.false;
        });
        it('should return false when the argument is a String', function() {
          seq.contains(fileInstance).should.be.false;
        });
    });

    describe('given a String or File with a more than one difference element ' +
        'and matching non-digit characters', function() {

        var seq = new Sequence(goodSequenceOfFileStrings),
            fileString = '/path/to/a123Seq456uence.0006.txt',
            fileInstance = new File(fileString);

        it('should return false when the argument is a String', function() {
            seq.contains(fileString).should.be.false;
        });

        it('should return false when the argument is a File', function() {
            seq.contains(fileInstance).should.be.false;
        });
    });

    describe('given a String or File with one difference element and ' +
        'non-matching non-digit characters', function() {

        var seq = new Sequence(goodSequenceOfFileStrings),
            fileString = '/path/to/b123Sequence.0006.txt',
            fileInstance = new File(fileString);

        it('should return false when the argument is a String', function() {
            seq.contains(fileString).should.be.false;
        });

        it('should return false when the argument is a File', function() {
            seq.contains(fileInstance).should.be.false;
        });
    });

    describe('given a single file sequence and the same filename', function() {
        var seq = new Sequence(singleFileString),
            fileString = singleFileString[0],
            fileInstance = new File(singleFileString[0]);

        it('should return true when the argument is a string', function() {
            seq.contains(fileString).should.be.true;
        })
    });
});

describe('Sequence.prototype.push(File | String)', function() {
    var seq;
    
    beforeEach(function() {
        seq = new Sequence(goodSequenceOfFileStrings);
    });

    describe('given a String or File contained in the sequence', function() {
        
        it('should add a File instance to the \'.files\' array, sorted by ' +
           'its significant digit group', function() {

            seq.files.should.have.length(5);
            seq.push('/path/to/a123Sequence.0007.txt');
            seq.files.should.have.length(6);
            seq.files[5].should.be.an.instanceof(File);
            seq.files[5].basename.should.equal('a123Sequence.0007.txt');

            seq.push(new File('/path/to/a123Sequence.0006.txt'));
            seq.files.should.have.length(7);
            seq.files[5].should.be.an.instanceof(File);
            seq.files[5].basename.should.equal('a123Sequence.0006.txt');
            seq.files[6].basename.should.equal('a123Sequence.0007.txt');
        });

        it('should update \'.start\' and \'.end\' to reflect the sequence ' +
           'range', function() {

            seq.start.should.equal(1);
            seq.end.should.equal(5);

            seq.push('/path/to/a123Sequence.0007.txt');
            seq.end.should.equal(7);
            
            seq.push('/path/to/a123Sequence.0006.txt');
            seq.end.should.equal(7);
        });

        it('should note the significant digit group, having an index and ' +
           'length', function() {
            seq._significantGroup.index.should.equal(13);
            seq._significantGroup.length.should.equal(4);
        });
    });

    describe('given a String or File not contained in the sequence', function() {

        it('should throw an error', function() {
            (function() {
                seq.push('/path/to/b123Sequence.0006.txt');
            }).should.throw();

            (function() {
                seq.push('/path/toward/a123Sequence.0006.txt');
            }).should.throw();
        });
    });
});

describe('Sequence.prototype.format()', function() {

    var seq = new Sequence(goodSequenceOfFileStrings);

    describe('given no arguments', function() {

        it('should output a string in default format ' +
           '(%b%p%a)', function() {
            seq.format().should.equal('a123Sequence.%04d.txt');
        });
    });

    describe('given a format string', function() {

        it('should replace directives with pertinent information', function() {
            seq.format('%04l %b%r%a').should.equal('0005 a123Sequence.1-5.txt');
            seq.format('%s %e').should.equal('1 5');
            seq.format('%02s %02e').should.equal('01 05');
            seq.format('%04r').should.equal('0001-0005');
            seq.format('%b%#%a').should.equal('a123Sequence.####.txt');
            seq.format('%r %p %r').should.equal('1-5 %04d 1-5');
        });

        it('should replace unknown directives with the literal ' +
           'directive', function() {
            seq.format('%b%c%a').should.equal('a123Sequence.c.txt');
            seq.format('%b%%c%a').should.equal('a123Sequence.%c.txt');
            seq.format('%b%%%a').should.equal('a123Sequence.%.txt');
        });

        it('should not replace non-directives', function() {
            seq.format('s').should.equal('s');
        });
    });
});

describe('Sequence.prototype.format() for single sequences', function() {
    //console.log('xxx');
    var seq = new Sequence(singleFileString);
    //console.log("XXX");
    //console.log(seq._significantGroup);
    describe('given no arguments', function() {

        it('should output a string in default format ' +
           '(%b%p%a)', function() {
            seq.format().should.equal('singleFile123sequence.0001.txt');
        });
    });

    describe('given a format string', function() {

        it('should replace directives with pertinent information', function() {
            //console.log(seq._significantGroup);
            seq.format('%04l %b%r%a').should.equal('0001 singleFile123sequence.1-1.txt');
            seq.format('%s %e').should.equal('1 1');
            seq.format('%02s %02e').should.equal('01 01');
            seq.format('%04r').should.equal('0001-0001');
            seq.format('%b%#%a').should.equal('singleFile123sequence.####.txt');
            seq.format('%r %p %r').should.equal('1-1 %04d 1-1');
        });

        it('should replace unknown directives with the literal ' +
           'directive', function() {
            seq.format('%b%c%a').should.equal('a123Sequence.c.txt');
            seq.format('%b%%c%a').should.equal('a123Sequence.%c.txt');
            seq.format('%b%%%a').should.equal('a123Sequence.%.txt');
        });

        it('should not replace non-directives', function() {
            seq.format('s').should.equal('s');
        });
    });
});

describe('Sequence.prototype.format() for single non-digit sequences (a file)', function() {

    var seq = new Sequence(goodSequenceOfFileStrings);

    describe('given no arguments', function() {

        it('should output a string in default format ' +
           '(%b%p%a)', function() {
            seq.format().should.equal('a123Sequence.%04d.txt');
        });
    });

    describe('given a format string', function() {

        it('should replace directives with pertinent information', function() {
            seq.format('%04l %b%r%a').should.equal('0005 a123Sequence.1-5.txt');
            seq.format('%s %e').should.equal('1 5');
            seq.format('%02s %02e').should.equal('01 05');
            seq.format('%04r').should.equal('0001-0005');
            seq.format('%b%#%a').should.equal('a123Sequence.####.txt');
            seq.format('%r %p %r').should.equal('1-5 %04d 1-5');
        });

        it('should replace unknown directives with the literal ' +
           'directive', function() {
            seq.format('%b%c%a').should.equal('a123Sequence.c.txt');
            seq.format('%b%%c%a').should.equal('a123Sequence.%c.txt');
            seq.format('%b%%%a').should.equal('a123Sequence.%.txt');
        });

        it('should not replace non-directives', function() {
            seq.format('s').should.equal('s');
        });
    });
});
