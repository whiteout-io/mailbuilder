"use strict";

(function(define) {
    define(function(require, exports, module) {

        var Mailbuilder, Node;

        module.exports = Mailbuilder = function() {
            this.nodes = [];
            this.headers = [];
        };

        Mailbuilder.prototype.createNode = function() {
            var node = new Node();
            this.nodes.push(node);
            return node;
        };

        Node = function() {
            this.nodes = [];
        };

        //
        // Helper functions
        //

        // function generateBoundary() {
        //     return 'mailbuilder-xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        //         var r = Math.random() * 16 | 0,
        //             v = c === 'x' ? r : (r & 0x3 | 0x8);
        //         return v.toString(16);
        //     });
        // }
    });

}(typeof define === 'function' && define.amd ? define : function(factory) {
    factory(require, exports, module);
}));