'use strict';

if (typeof module === 'object' && typeof define !== 'function') {
    var define = function(factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function(require) {
    var Mailbuilder, Node,
        mimelib = require('mimelib'),
        VERSION = '0.0.1',
        NAME = 'mailbuilder';


    // 
    // Node
    // 

    Node = function() {
        this.nodes = [];
        this.mime = [];
    };

    /**
     * Example:
     * node.addMimeHeaders([{
     *      key: 'Content-Type',
     *      value: 'text/plain',
     *      parameters: {
     *          charset: 'utf-8',
     *          name: 'yadda.txt'
     *      }
     *  }, {
     *      key: 'Content-Transfer-Encoding',
     *      value: '7bit'
     *  }, {
     *      key: 'Content-Description',
     *      value: 'yadda yadda foo foo'
     *  }, {
     *      key: 'Content-Disposition',
     *      value: 'attachment',
     *      parameters: {
     *          filename: 'yadda.txt'
     *      }
     *  }]);
     */
    Node.prototype.addMimeHeaders = function(headers) {
        this.mime = this.mime.concat(headers);
    };

    Node.prototype.createNode = function(mimeHeaders) {
        var node = new Node();

        node.addMimeHeaders(mimeHeaders);
        this.nodes.push(node);

        return node;
    };

    Node.prototype.compile = function() {
        var output = '',
            multipartBoundary,
            encoding,
            flowed,
            content = this.content;

        // compile the MIME info
        var mimeLines = [];
        this.mime.forEach(function(i) {
            var line = '';
            line += i.key + ': ' + i.value + ';';

            if (i.parameters) {
                Object.keys(i.parameters).forEach(function(key) {
                    line += ' ' + key + '="' + i.parameters[key] + '";';
                });
            }

            line += '\r\n';
            mimeLines.push(line);

            if (i.key === 'Content-Type') {
                // is there already a predefined boundary?
                multipartBoundary = (i.parameters && i.parameters.boundary) || randomString(30);
            } else if (i.key === 'Content-Transfer-Encoding') {
                // which encoding should be used?
                encoding = i.value;
                flowed = i.parameters && i.parameters.format && i.parameters.format === 'flowed';
            }
        });

        output += mimeLines.join('');
        output += '\r\n';

        if (content) {
            if (encoding === 'quoted-printable') {
                content = mimelib.encodeQuotedPrintable(content);
            } else if (encoding === 'base64') {
                content = b64Encode(content);
                // fold line after 76 characters
                content = content.replace(/.{76}/g, '$&\r\n');
            } else {
                content = mimelib.foldLine(content, 76, true, flowed);
                // mimelib puts a long whitespace to the beginning of the lines
                content = content.replace(/^[ ]{7}/mg, '');
            }

            output += content;
            output += '\r\n';
        }

        if (this.nodes.length > 0) {
            this.nodes.forEach(function(node) {
                output += '--' + multipartBoundary + '\r\n';
                output += node.compile();
            });
            output += '--' + multipartBoundary + '--' + '\r\n';
        }

        return output;
    };



    // 
    // MailBuilder
    // 

    Mailbuilder = function() {
        this.envelope = [{
            key: 'MIME-Version',
            value: '1.0'
        }, {
            key: 'X-Mailer',
            value: NAME + '_' + VERSION
        }, ];
    };

    /**
     * Example:
     * builder.addEnvelopeFields([{
     *      key: 'From',
     *      value: 'fred@foo.com'
     *  }, {
     *      key: 'To',
     *      value: 'lala@tralala.de'
     *  }, {
     *      key: 'Subject',
     *      value: 'Interesting subject'
     *  }]);
     */
    Mailbuilder.prototype.addEnvelopeFields = function(fields) {
        this.envelope = this.envelope.concat(fields);
    };

    Mailbuilder.prototype.createNode = function(mimeHeaders) {
        var node = new Node();

        node.addMimeHeaders(mimeHeaders);
        this.node = node;

        return node;
    };

    Mailbuilder.prototype.build = function() {
        var output = '',
            envelopeLines = [];

        this.envelope.forEach(function(i) {
            envelopeLines.push(i.key + ': ' + i.value + '\r\n');
        });
        output += envelopeLines.join('');

        if (this.node) {
            output += this.node.compile();
        }

        return output;
    };



    //
    // Helper functions
    //

    /**
     * Creates a random string with [0-9a-f] with <code>length</code> characters
     */
    function randomString(length) {
        var i = length,
            str = '';
        while (i--) {
            str += (Math.random() * 16 | 0).toString(16);
        }
        return str;
    }

    function b64Encode(data) {
        if (typeof window !== 'undefined') {
            // browser
            return window.btoa(window.unescape(window.encodeURIComponent(data)));
        } else {
            // node
            return new Buffer(data, 'utf-8').toString('base64');
        }
    }



    return Mailbuilder;
});