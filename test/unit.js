'use strict';

var chai = require('chai'),
    expect = chai.expect,
    Mailbuilder = require("..");

chai.Assertion.includeStack = true;

describe('unit tests', function() {
    var builder;

    beforeEach(function() {
        builder = new Mailbuilder();
    });

    afterEach(function() {});

    describe('initial setup', function() {
        it('should be correct', function() {
            expect(builder).to.exist;
            expect(builder.envelope[0].key).to.equal('MIME-Version');
            expect(builder.envelope[0].value).to.equal('1.0');
            expect(builder.envelope[1].key).to.equal('X-Mailer');
            expect(builder.envelope[1].value).to.equal('mailbuilder_0.0.1');
        });
    });

    describe('Mailbuilder.envelope', function() {
        it('should set proper values', function() {
            builder.addEnvelopeFields([{
                key: 'From',
                value: 'fred@foo.com'
            }, {
                key: 'To',
                value: 'lala@tralala.de'
            }, {
                key: 'Subject',
                value: 'Interesting subject'
            }]);

            expect(builder.envelope.length).to.equal(5);
        });
    });

    describe('Mailbuilder.createNode', function() {
        it('should create a node', function() {
            var mime = [{
                key: 'Content-Type',
                value: 'text/plain',
                parameters: {
                    charset: 'utf-8',
                    name: 'yadda.txt'
                }
            }, {
                key: 'Content-Transfer-Encoding',
                value: '7bit'
            }, {
                key: 'Content-Description',
                value: 'yadda yadda foo foo'
            }, {
                key: 'Content-Disposition',
                value: 'attachment',
                parameters: {
                    filename: 'yadda.txt'
                }
            }];

            var node = builder.createNode(mime);
            expect(node.mime[0].key).to.equal(mime[0].key);
            expect(builder.node).to.exist;
        });
    });

    describe('Node.compile', function() {
        it('should compile the node correctly', function() {
            var mime = [{
                key: 'Content-Type',
                value: 'text/plain',
                parameters: {
                    charset: 'utf-8',
                    name: 'yadda.txt'
                }
            }, {
                key: 'Content-Transfer-Encoding',
                value: '7bit'
            }, {
                key: 'Content-Description',
                value: 'yadda yadda foo foo'
            }, {
                key: 'Content-Disposition',
                value: 'attachment',
                parameters: {
                    filename: 'yadda.txt'
                }
            }];

            var node = builder.createNode(mime);
            node.content = 'yaddayadda';

            expect(node.compile()).to.equal('Content-Type: text/plain; charset="utf-8"; name="yadda.txt";\r\nContent-Transfer-Encoding: 7bit;\r\nContent-Description: yadda yadda foo foo;\r\nContent-Disposition: attachment; filename="yadda.txt";\r\n\r\nyaddayadda\r\n');
        });

        it('should compile multipart nodes correctly', function() {
            var node, text, html;

            node = builder.createNode([{
                key: 'Content-Type',
                value: 'multipart/alternative',
                parameters: {
                    boundary: 'foobarfoobarfoobarfoobarfoobar'
                }
            }]);

            text = node.createNode([{
                key: 'Content-Type',
                value: 'text/plain'
            }, {
                key: 'Content-Transfer-Encoding',
                value: 'quoted-printable'
            }]);
            text.content = 'yaddayadda';

            html = node.createNode([{
                key: 'Content-Type',
                value: 'text/html'
            }, {
                key: 'Content-Transfer-Encoding',
                value: 'quoted-printable'
            }]);
            html.content = '<div>fiifaafooo</div>';

            expect(node.compile()).to.equal('Content-Type: multipart/alternative; boundary="foobarfoobarfoobarfoobarfoobar";\r\n\r\n--foobarfoobarfoobarfoobarfoobar\r\nContent-Type: text/plain;\r\nContent-Transfer-Encoding: quoted-printable;\r\n\r\nyaddayadda\r\n--foobarfoobarfoobarfoobarfoobar\r\nContent-Type: text/html;\r\nContent-Transfer-Encoding: quoted-printable;\r\n\r\n<div>fiifaafooo</div>\r\n--foobarfoobarfoobarfoobarfoobar--\r\n');
        });
    });

    describe('Mailbuilder.build', function() {
        it('should build header', function() {
            builder.addEnvelopeFields([{
                key: 'From',
                value: 'fred@foo.com'
            }, {
                key: 'To',
                value: 'lala@tralala.de'
            }, {
                key: 'Subject',
                value: 'Interesting subject'
            }]);

            expect(builder.build()).to.equal('MIME-Version: 1.0\r\nX-Mailer: mailbuilder_0.0.1\r\nFrom: fred@foo.com\r\nTo: lala@tralala.de\r\nSubject: Interesting subject\r\n');
        });

        it('should build nodes', function() {
            builder.addEnvelopeFields([{
                key: 'From',
                value: 'fred@foo.com'
            }, {
                key: 'To',
                value: 'lala@tralala.de'
            }, {
                key: 'Subject',
                value: 'Interesting subject'
            }]);

            var node, text, html;

            node = builder.createNode([{
                key: 'Content-Type',
                value: 'multipart/alternative',
                parameters: {
                    boundary: 'foobarfoobarfoobarfoobarfoobar'
                }
            }]);

            text = node.createNode([{
                key: 'Content-Type',
                value: 'text/plain'
            }, {
                key: 'Content-Transfer-Encoding',
                value: 'quoted-printable'
            }]);
            text.content = 'yaddayadda';

            html = node.createNode([{
                key: 'Content-Type',
                value: 'text/html'
            }, {
                key: 'Content-Transfer-Encoding',
                value: 'quoted-printable'
            }]);
            html.content = '<div>fiifaafooo</div>';

            expect(builder.build()).to.equal('MIME-Version: 1.0\r\nX-Mailer: mailbuilder_0.0.1\r\nFrom: fred@foo.com\r\nTo: lala@tralala.de\r\nSubject: Interesting subject\r\nContent-Type: multipart/alternative; boundary="foobarfoobarfoobarfoobarfoobar";\r\n\r\n--foobarfoobarfoobarfoobarfoobar\r\nContent-Type: text/plain;\r\nContent-Transfer-Encoding: quoted-printable;\r\n\r\nyaddayadda\r\n--foobarfoobarfoobarfoobarfoobar\r\nContent-Type: text/html;\r\nContent-Transfer-Encoding: quoted-printable;\r\n\r\n<div>fiifaafooo</div>\r\n--foobarfoobarfoobarfoobarfoobar--\r\n');
        });
    });

    // describe('', function() {
    //     it('should ', function() {});
    // });
});