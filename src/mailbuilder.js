"use strict";

(function(define) {
    define(function(require, exports, module) {
        var Mailbuilder, Node,
            VERSION = '0.0.1',
            NAME = 'mailbuilder';



        // 
        // Node
        // 

        Node = function() {
            this.nodes = [];
        };

        /**
         * Example:
         * {
         *     'contentType': {
         *         type: 'text/plain',
         *         parameters: {
         *             charset: 'utf-8',
         *             name: 'yadda.txt'
         *         }
         *     },
         *     'contentTransferEncoding': '7bit',
         *     'contentDescription': 'yadda yadda foo foo',
         *     'contentDisposition': {
         *         type: 'attachment',
         *         parameters: {
         *             filename: 'yadda.txt'
         *         }
         *     }
         * }
         */
        Node.prototype.setMimeHeaders = function(mimeHeaders) {
            var self = this;

            Object.keys(mimeHeaders).forEach(function(header) {
                if (!mimeHeaders[header]) {
                    return;
                }

                self[header] = mimeHeaders[header];
            });
        };

        Node.prototype.createNode = function(mimeHeaders) {
            var node = new Node();

            node.setMimeHeaders(mimeHeaders);
            this.nodes.push(node);

            return node;
        };


        // 
        // MailBuilder
        // 

        module.exports = Mailbuilder = function() {
            this.nodes = [];
        };

        Mailbuilder.prototype.setEnvelope = function(envelope) {
            this.envelope = {
                from: envelope.from || [],
                to: envelope.to || [],
                cc: envelope.cc || [],
                bcc: envelope.bcc || [],
                date: envelope.date || new Date(),
                subject: envelope.subject || '',
                messageId: envelope.messageId || randomString(20) + '@' + NAME,
                'X-Mailer': NAME + '_' + VERSION
            };
        };

        Mailbuilder.prototype.createNode = Node.prototype.createNode;
        Mailbuilder.prototype.build = function() {};

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
    });

}(typeof define === 'function' && define.amd ? define : function(factory) {
    factory(require, exports, module);
}));