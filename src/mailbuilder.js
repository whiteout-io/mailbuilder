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
                multipartBoundary;

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

                // is there a boundary?
                if (i.key === 'Content-Type') {
                    multipartBoundary = (i.parameters && i.parameters.boundary) || randomString(30);
                }
            });

            output += mimeLines.join('');
            output += '\r\n';

            if (this.content) {
                output += this.content;
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

        module.exports = Mailbuilder = function() {
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
    });

}(typeof define === 'function' && define.amd ? define : function(factory) {
    factory(require, exports, module);
}));