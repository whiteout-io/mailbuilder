'use strict';

if (typeof module === 'object' && typeof define !== 'function') {
    var define = function(factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function(require) {
    var Mailbuilder = require("../src/mailbuilder"),
        mailbuilder, node, text, attachment;

    mailbuilder = new Mailbuilder();

    mailbuilder.setSubject('this is the subject');
    mailbuilder.setFrom('sender@foobar.com');
    mailbuilder.addTo('receiver@foobar.com');
    mailbuilder.addCc('some.guy@foobar.com');
    mailbuilder.addBcc('some.guy.that.should.not.show.up@foobar.com');

    node = mailbuilder.createNode([{
        key: 'Content-Type',
        value: 'multipart/mixed',
    }]);

    text = node.createNode([{
        key: 'Content-Type',
        value: 'text/plain'
    }, {
        key: 'Content-Transfer-Encoding',
        value: 'quoted-printable'
    }]);
    text.content = 'yaddayadda';

    attachment = node.createNode([{
        key: 'Content-Type',
        value: 'text/plain',
    }, {
        key: 'Content-Transfer-Encoding',
        value: 'base64'
    }, {
        key: 'Content-Disposition',
        value: 'attachment',
        parameters: {
            filename: 'stuff.txt'
        }
    }]);
    attachment.content = str2arr('wellthisisanincrediblylongstringprobablysomesortoffileyouretrievedfromthefilepickerorsomethingandidonotnowwhattowritehere');

    console.log('\n\n');
    console.log(mailbuilder.build());
    console.log('\n\n');

    function str2arr(str) {
        var bufView = new Uint8Array(new ArrayBuffer(str.length));
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return bufView;
    }

});