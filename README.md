# mailbuilder

**mailbuilder** is a low-level UMD module for generating raw ASCII e-mail source for [rfc2822](http://tools.ietf.org/html/rfc2822) 
compatible messages.

## Usage

    // fire up a mailbuilder instance
    var Mailbuilder = require("mailbuilder"),
        builder = new Mailbuilder();

    var node = builder.createNode();
    // add content, add MIME headers, add MIME nodes, ...

    var raw = builder.build();

## Hands on

    npm install && grunt
