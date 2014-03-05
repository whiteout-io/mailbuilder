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

    /**
     * Represents a MIME node, which contains content and information about the type of content it houses.
     */
    Node = function() {
        this.nodes = [];
        this.mime = [];
    };

    /**
     * Add mime header information.
     * @param {Array} headers Array of objects containing key/value pairs and additional parameters.
     */
    Node.prototype.addMimeHeaders = function(headers) {
        headers.forEach(function(header) {
            header.parameters = header.parameters || {};
        });
        this.mime = this.mime.concat(headers);
    };

    /**
     * Creates a MIME node with the provided MIME header information, see Node.addMimeHeaders
     * @param {Array} headers Array of objects containing key/value pairs and additional parameters.
     */
    Node.prototype.createNode = function(mimeHeaders) {
        var node = new Node();

        node.addMimeHeaders(mimeHeaders);
        this.nodes.push(node);

        return node;
    };

    /**
     * Builds a MIME node and its childres
     * @return {String} Outputs an RFC-compatible raw flattened MIME-tree
     */
    Node.prototype.build = function() {
        var output = '',
            multipartBoundary,
            encoding,
            flowed,
            content = this.content;

        // compile the MIME info
        var mimeLines = [];
        this.mime.forEach(function(i) {
            var line = '';
            line += i.key + ': ' + i.value;

            // some checks for the parameters: 
            // - is there a boundary? if yes, remember locally
            // - what's the encoding? do we have a flowed format?
            // 
            if (i.key === 'Content-Type' && i.value.indexOf('multipart') === 0) {
                // if there is no predefined multipart boundary, generate from random
                if (typeof i.parameters.boundary === 'undefined') {
                    i.parameters.boundary = randomString(30);
                }
                multipartBoundary = i.parameters.boundary;
            } else if (i.key === 'Content-Transfer-Encoding') {
                // which encoding should be used?
                encoding = i.value;
                flowed = i.parameters.format && i.parameters.format === 'flowed';
            }

            // enumerate the parameters
            Object.keys(i.parameters).forEach(function(key) {
                line += '; ' + key + '="' + i.parameters[key] + '"';
            });

            mimeLines.push(line);
        });

        output += mimeLines.join('\r\n') + '\r\n';

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

            output += '\r\n' + content.trim();
        }

        if (this.nodes.length > 0) {
            output += '\r\n';
            this.nodes.forEach(function(node) {
                output += '--' + multipartBoundary + '\r\n' + node.build() + '\r\n';
            });
            output += '--' + multipartBoundary + '--';
        }

        output += '\r\n';

        return output;
    };

    /**
     * Top-level object to build RFC-compatible from mail objects
     */
    Mailbuilder = function() {
        this.envelope = {
            'MIME-Version': '1.0',
            'X-Mailer': NAME + '_' + VERSION
        };

        this.from = {};
        this.to = [];
        this.cc = [];
        this.bcc = [];
        this.subject = '(no subject)';
    };

    // expose the MIME node API
    Mailbuilder.Node = Node;

    /**
     * Set an address as the sender
     * @param {String} sender The sender as a 7-bit ASCII string
     */
    Mailbuilder.prototype.setFrom = function(sender) {
        this.from = sender;
    };

    /**
     * Set the subject.
     * @param {String} subject The subject
     */
    Mailbuilder.prototype.setSubject = function(subject) {
        this.subject = subject;
    };

    /**
     * Add a recipient
     * @param {Array or String} recipients String or an array of string containing the recipients
     */
    Mailbuilder.prototype.addTo = function(recipients) {
        this.to = this.to.concat(recipients);
    };

    /**
     * Add a recipient as CC
     * @param {Array or String} recipients String or an array of string containing the recipients
     */
    Mailbuilder.prototype.addCc = function(recipients) {
        this.cc = this.cc.concat(recipients);
    };

    /**
     * Add a recipient as BCC
     * @param {Array or String} recipients String or an array of string containing the recipients
     */
    Mailbuilder.prototype.addBcc = function(recipients) {
        this.bcc = this.bcc.concat(recipients);
    };

    /**
     * Add custom envelope fields
     * @param {Object} fields Object with custom envelope field
     */
    Mailbuilder.prototype.addEnvelopeFields = function(fields) {
        var self = this;

        Object.keys(fields).forEach(function(key) {
            self.envelope[key] = fields[key];
        });
    };

    /**
     * Get the SMTP envelope of a mail
     * @return {Object} Object with the properties from {Object} and to {Array}
     */
    Mailbuilder.prototype.getEnvelope = function() {
        return {
            from: this.from,
            to: this.to.concat(this.cc.concat(this.bcc))
        };
    };

    /**
     * Create a top-level MIME node with the specified MIME headers
     * @param {Object} mimeHeaders The mime headers. See Node.addMimeHeaders
     */
    Mailbuilder.prototype.createNode = function(mimeHeaders) {
        var node = new Node();

        node.addMimeHeaders(mimeHeaders);
        this.node = node;

        return node;
    };

    /** 
     * Converts the envelope and the flattened MIME tree into RFC compatible format
     */
    Mailbuilder.prototype.build = function() {
        var self = this,
            output = '';

        Object.keys(self.envelope).forEach(function(key) {
            output += key + ': ' + self.envelope[key] + '\r\n';
        });

        output += 'From: ' + self.from + '\r\n';

        if (self.to.length > 0) {
            output += 'To: ' + self.to.join(', ') + '\r\n';
        }
        if (self.cc.length > 0) {
            output += 'Cc: ' + self.cc.join(', ') + '\r\n';
        }
        if (self.bcc.length > 0) {
            output += 'Bcc: ' + self.bcc.join(', ') + '\r\n';
        }

        output += 'Subject: ' + mimelib.encodeMimeWords(self.subject, 'Q', 52, 'utf-8') + '\r\n';

        if (self.node) {
            output += self.node.build();
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
            if (typeof(data) === 'string') {
                return btoa(unescape(encodeURIComponent( data )));
            }

            // we have a typed array
            
            return btoa(arr2str(data));
        } else {
            // node
            if (typeof(data) === 'string') {
                return new Buffer(data, 'utf-8').toString('base64');
            }

            // we have a typed array
            return new Buffer(String.fromCharCode.apply(null, data), 'binary').toString('base64');
        }
    }

    function arr2str(arr) {
        var i, l, str = '';

        for (i = 0, l = arr.length; i < l; i++) {
            str += String.fromCharCode(arr[i]);
        }

        return str;
    }

    return Mailbuilder;
});