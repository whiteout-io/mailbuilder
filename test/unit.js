'use strict';

if (typeof module === 'object' && typeof define !== 'function') {
    var define = function(factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function(require) {
    var chai = require('chai'),
        expect = chai.expect,
        Mailbuilder = require("../src/mailbuilder");

    chai.Assertion.includeStack = true;

    describe('unit tests', function() {
        var builder;

        beforeEach(function() {
            builder = new Mailbuilder();
        });

        afterEach(function() {});

        describe('initial setup', function() {
            it('should be correct', function() {
                expect(Mailbuilder.Node).to.exist;

                expect(builder).to.exist;
                expect(builder.envelope['MIME-Version']).to.equal('1.0');
                expect(builder.envelope['X-Mailer']).to.equal('mailbuilder_0.0.1');
                expect(builder.from).to.deep.equal({});
                expect(builder.to).to.deep.equal([]);
                expect(builder.cc).to.deep.equal([]);
                expect(builder.bcc).to.deep.equal([]);
                expect(builder.subject).to.equal('(no subject)');
            });
        });

        describe('Mailbuilder.envelope', function() {
            it('should set proper values', function() {
                builder.addEnvelopeFields({
                    bli: 'bla',
                    foo: 'bar',
                    bang: 'ow'
                });

                expect(Object.keys(builder.envelope).length).to.equal(5);
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

        describe('Node.build', function() {
            it('should build the node correctly', function() {
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

                expect(node.build()).to.equal('Content-Type: text/plain; charset="utf-8"; name="yadda.txt";\r\nContent-Transfer-Encoding: 7bit;\r\nContent-Description: yadda yadda foo foo;\r\nContent-Disposition: attachment; filename="yadda.txt";\r\n\r\nyaddayadda\r\n');
            });

            it('should build multipart nodes correctly', function() {
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

                expect(node.build()).to.equal('Content-Type: multipart/alternative; boundary="foobarfoobarfoobarfoobarfoobar";\r\n\r\n--foobarfoobarfoobarfoobarfoobar\r\nContent-Type: text/plain;\r\nContent-Transfer-Encoding: quoted-printable;\r\n\r\nyaddayadda\r\n--foobarfoobarfoobarfoobarfoobar\r\nContent-Type: text/html;\r\nContent-Transfer-Encoding: quoted-printable;\r\n\r\n<div>fiifaafooo</div>\r\n--foobarfoobarfoobarfoobarfoobar--\r\n');
            });

            it('should build base64 nodes correctly', function() {
                var node;

                node = builder.createNode([{
                    key: 'Content-Type',
                    value: 'text/plain',
                }, {
                    key: 'Content-Transfer-Encoding',
                    value: 'base64'
                }]);
                node.content = 'wellthisisanincrediblylongstringprobablysomesortofstringrepresentationofabrowserthingyohmyidonotnowwhattowritehere';

                expect(node.build()).to.equal('Content-Type: text/plain;\r\nContent-Transfer-Encoding: base64;\r\n\r\nd2VsbHRoaXNpc2FuaW5jcmVkaWJseWxvbmdzdHJpbmdwcm9iYWJseXNvbWVzb3J0b2ZzdHJpbmdy\r\nZXByZXNlbnRhdGlvbm9mYWJyb3dzZXJ0aGluZ3lvaG15aWRvbm90bm93d2hhdHRvd3JpdGVoZXJl\r\n\r\n');
            });

            it('should build quoted-printable nodes correctly', function() {
                var node;

                node = builder.createNode([{
                    key: 'Content-Type',
                    value: 'text/plain',
                }, {
                    key: 'Content-Transfer-Encoding',
                    value: 'quoted-printable'
                }]);
                node.content = 'Interested in having a direct impact on hundreds of millions of users? Join Mozilla, and become part of a global community that’s helping to build a brighter future for the Web.';

                expect(node.build()).to.equal('Content-Type: text/plain;\r\nContent-Transfer-Encoding: quoted-printable;\r\n\r\nInterested in having a direct impact on hundreds of millions of users=3F =\r\nJoin Mozilla, and become part of a global community that=E2=80=99s helping =\r\nto build a brighter future for the Web.\r\n');
            });

            it('should build nodes with other encodings with line breaks after 76 chars correctly', function() {
                var node;

                node = builder.createNode([{
                    key: 'Content-Type',
                    value: 'text/plain',
                }, {
                    key: 'Content-Transfer-Encoding',
                    value: '7bit'
                }]);
                node.content = '1qazxsw23edcvfr45tgbnhy67ujmki89olp01qazxsw23edcvfr45tgbnhy67ujmki89olp01qazxsw23edcvfr45tgbnhy67ujmki89olp01qazxsw23edcvfr45tgbnhy67ujmki89olp0';

                expect(node.build()).to.equal('Content-Type: text/plain;\r\nContent-Transfer-Encoding: 7bit;\r\n\r\n1qazxsw23edcvfr45tgbnhy67ujmki89olp01qazxsw23edcvfr45tgbnhy67ujmki89olp01qaz\r\nxsw23edcvfr45tgbnhy67ujmki89olp01qazxsw23edcvfr45tgbnhy67ujmki89olp0\r\n');
            });
        });

        describe('Mailbuilder.build', function() {
            it('should build header', function() {
                builder.setFrom('fred@foo.com');
                builder.addTo('lala@tralala.de');
                builder.setSubject('¡Hola, señor!');

                expect(builder.build()).to.equal('MIME-Version: 1.0\r\nX-Mailer: mailbuilder_0.0.1\r\nFrom: fred@foo.com\r\nTo: lala@tralala.de\r\nSubject: =?UTF-8?Q?=C2=A1Hola,_se=C3=B1or!?=\r\n');
            });

            it('should build nodes', function() {
                builder.setFrom('fred@foo.com');
                builder.addTo('lala@tralala.de');
                builder.setSubject('Interesting subject');

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

        describe('Mailbuilder.getEnvelope', function() {
            it('should get envelope', function() {
                builder.setFrom('fred@foo.com');
                builder.addTo('lala@tralala.de');
                builder.addCc('a@z.de');
                builder.addCc('b@z.de');
                builder.addBcc('c@z.de');
                builder.setSubject('Interesting subject');

                expect(builder.getEnvelope()).to.deep.equal({
                    "from": 'fred@foo.com',
                    "to": ["lala@tralala.de", "a@z.de", "b@z.de", "c@z.de"]
                });
            });
        });
    });
});