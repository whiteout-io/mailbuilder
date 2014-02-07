# mailbuilder

`mailbuilder` is a low-level UMD module for generating raw ASCII e-mail source for [rfc2822](http://tools.ietf.org/html/rfc2822) 
compatible messages.

## API

### Constructor

*Disclaimer: If nothing else is noted, the `mailbuilder` assumes that you will use UTF-8 strings.*

    var Mailbuilder = require("mailbuilder"),
        mailbuilder = new Mailbuilder();

The constructor takes no arguments, so nothing fancy here.

### Add sender, recipient, cc, bcc

    mailbuilder.setFrom(address)
    mailbuilder.addTo(address)
    mailbuilder.addCc(address)
    mailbuilder.addBcc(address)

`address` is just a string in the form of `'foo@bar.com'`. *If you use unicode chars in the display name in the form of `'Foo Bar <foo@bar.com>'`, you must take care to encode them properly yourself!* The mailbuilder *does not sanitize the addresses*. They must be provided as 7-bit ASCII strings.

### Add a subject

    mailbuilder.setSubject(subject)

Takes a string, transforms it into a MIME Q-encoded-word, and sets it as the subject.

### Add custom envelope fields

    mailbuilder.addEnvelopeFields(fields)

Takes an object and adds its content to the envelope information. Example:
    
    mailbuilder.addEnvelopeFields({
        'X-FANCY-STUFF': 'WOWTHATISFANCY',
        'X-1337-HACKERMAIL': 'hack0rz mail for teh win'
    });

### Retrieve the SMTP envelope 

    mailbuilder.getEnvelope() // returns { from: 'sender@example.com', to:[ 'receiver@example.com' ] }

Returns only the sender and the receivers. Useful for sending an email SMTP.

### Build the whole thing

    mailbuilder.build() // returns the raw message that can be sent via SMTP

### Create a MIME-node

    mailbuilder.createNode(mimeHeaders)

Creates a MIME node. A MIME node contains information about the content it contains, e.g. the MIME-type, the transfer-encoding, information if it is an attachment, a description, and optional parameters. You can either supply all the MIME headers when you create the node or create a plain node and add them later.

    var node = mailbuilder.createNode([{
        key: 'Content-Type',
        value: 'text/plain',
        parameters: {
            charset: 'utf-8'
        }
    }, {
        key: 'Content-Transfer-Encoding',
        value: 'quoted-printable'
    }]);

    // or

    var node = mailbuilder.createNode()
    node.addMimeHeaders(...);

**NB!** The MIME headers *must be 7-bit ASCII strings*.

The following content transfer encodings are supported:
* `quoted-printable`
* `base64`
* anything else will is assumed to be 7-bit

To add content, just set it as the node's `content`. Since attachments are usually provided in binary for, the `mailbuilder` supports content if type `String` and `Uint8Array`. Example:

    node.content = 'This is some fancy plain text content';
    node.content = new Uint8Array(...);

Apart from the whole message, you can also access MIME-subtrees:

`mailbuilder.node` exposes the top-level MIME node, `node.nodes` exposes an array of child MIME nodes

    builder.node.build() // compiles the top level node and its childres
    node.nodes[1].build() // ... you get the idea ...

### Direct access to the MIME node API?

In case you need direct access to the MIME nodes, e.g. for testing, here you go:
    
    var Mailbuilder = require("mailbuilder");
        
    // --> Mailbuilder.Node

## Example

To run the following example, hit `grunt example` and watch your console output.
        
    // fire up a mailbuilder instance
    var Mailbuilder = require("mailbuilder"),
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

    attachment = mailbuilder.createNode([{
        key: 'Content-Type',
        value: 'text/plain',
    }, {
        key: 'Content-Transfer-Encoding',
        value: 'base64'
    }]);
    attachment.content = new Uint8Array(...); 

    var raw = mailbuilder.build();

This is what the mailbuilder compiles:
    
    MIME-Version: 1.0
    X-Mailer: mailbuilder_0.0.1
    From: sender@foobar.com
    To: receiver@foobar.com
    Cc: some.guy@foobar.com
    Bcc: some.guy.that.should.not.show.up@foobar.com
    Subject: this is the subject
    Content-Type: multipart/mixed; boundary="a266a582677dee8fe53b0c863dfb54"

    --a266a582677dee8fe53b0c863dfb54
    Content-Type: text/plain
    Content-Transfer-Encoding: quoted-printable

    yaddayadda

    --a266a582677dee8fe53b0c863dfb54
    Content-Type: text/plain
    Content-Transfer-Encoding: base64
    Content-Disposition: attachment; filename="stuff.txt"

    d2VsbHRoaXNpc2FuaW5jcmVkaWJseWxvbmdzdHJpbmdwcm9iYWJseXNvbWVzb3J0b2ZmaWxleW91
    cmV0cmlldmVkZnJvbXRoZWZpbGVwaWNrZXJvcnNvbWV0aGluZ2FuZGlkb25vdG5vd3doYXR0b3dy
    aXRlaGVyZQ==

    --a266a582677dee8fe53b0c863dfb54--

## Hands on

    npm install && grunt