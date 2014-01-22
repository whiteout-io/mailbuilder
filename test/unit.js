'use strict';

var chai = require('chai'),
    expect = chai.expect,
    Mailbuilder = require("..");

chai.Assertion.includeStack = true;

describe('mailbuilder unit tests', function() {
    var builder;

    beforeEach(function() {
        builder = new Mailbuilder();
    });

    afterEach(function() {});

    describe('initial setup', function() {
        it('should be correct', function() {
            expect(builder).to.exist;
            expect(builder.nodes).to.be.instanceof.Array;
            expect(builder.nodes).to.be.empty;
        });
    });

    describe('setEnvelope', function() {
        it('should set defaults', function() {
            builder.setEnvelope({});
            
            expect(builder.envelope.from).to.deep.equal([]);
            expect(builder.envelope.to).to.deep.equal([]);
            expect(builder.envelope.cc).to.deep.equal([]);
            expect(builder.envelope.bcc).to.deep.equal([]);
            expect(builder.envelope.date).to.be.instanceof.Date;
            expect(builder.envelope.messageId).to.not.be.empty;
            expect(builder.envelope['X-Mailer']).to.not.be.empty;
        });

        it('should set proper values', function() {
            var env = {
                from: ['a@a.com'],
                to: ['b@b.com'],
                cc: ['c@c.com'],
                bcc: ['d@d.com'],
                date: new Date(),
                messageId: 'asdasdasd'
            };

            builder.setEnvelope(env);
            
            expect(builder.envelope.from).to.equal(env.from);
            expect(builder.envelope.to).to.equal(env.to);
            expect(builder.envelope.cc).to.equal(env.cc);
            expect(builder.envelope.bcc).to.equal(env.bcc);
            expect(builder.envelope.date).to.equal(env.date);
            expect(builder.envelope.messageId).to.equal(env.messageId);
            expect(builder.envelope['X-Mailer']).to.not.be.empty;
        });
    });

    describe('createNode', function() {
        it('should create a node', function() {
            var mime = {
                'contentType': {
                    type: 'text/plain',
                    parameters: {
                        charset: 'utf-8',
                        name: 'yadda.txt'
                    }
                },
                'contentTransferEncoding': '7bit',
                'contentDescription': 'yadda yadda foo foo',
                'contentDisposition': {
                    type: 'attachment',
                    parameters: {
                        filename: 'yadda.txt'
                    }
                }
            };

            var node = builder.createNode(mime);

            expect(node.contentType).to.equal(mime.contentType);
            expect(node.contentTransferEncoding).to.equal(mime.contentTransferEncoding);
            expect(node.contentDescription).to.equal(mime.contentDescription);
            expect(node.contentDisposition).to.equal(mime.contentDisposition);
            expect(builder.nodes).to.not.be.empty;
        });
    });

    describe('', function() {
        it('should ', function() {});
    });
});