'use strict';

var chai = require('chai'),
    expect = chai.expect,
    Mailbuilder = require("..");

chai.Assertion.includeStack = true;

describe('mailbuilder unit tests', function() {
    var sut;

    beforeEach(function() {
        sut = new Mailbuilder();
    });

    afterEach(function() {});

    describe('initial setup', function() {
        it('should be correct', function() {
            expect(sut).to.exist;
            expect(sut.nodes).to.be.instanceof.Array;
            expect(sut.nodes).to.be.empty;
        });
    });
});