
// # node-email-templates

// ## Example with [Nodemailer](https://github.com/andris9/Nodemailer)

var path           = require('path')
  , templatesDir   = path.resolve(__dirname, '..', 'templates')
  , emailTemplates = require('../../node-email-templates')
  , nodemailer     = require('nodemailer');

emailTemplates(templatesDir, function(err, template) {

  if (err) {
    console.log(err);
  } else {

    // ## Send a single email

    // Prepare nodemailer transport object
    var transport = nodemailer.createTransport("SMTP", {
      service: "Gmail",
      auth: {
        user: "webrtcevry@gmail.com",
        pass: "webrtcevry91"
      }
    });

    // An example users object with formatted email function
    var locals = {
      email: 'webrtcevry@gmail.com',
      name: {
        first: 'aev',
        last: 'dpr'
      }
    };

    // Send a single email
    template('newsletter', locals, function(err, html, text) {
      if (err) {
        console.log(err);
      } else {
        transport.sendMail({
          from: 'WebRtcEvry <webrtcevry@gmail.com>',
          to: locals.email,
          subject: 'Invitation à rejoindre la conversation',
          html: html,
          // generateTextFromHTML: true,
          text: text
        }, function(err, responseStatus) {
          if (err) {
            console.log(err);
          } else {
            console.log(responseStatus.message);
          }
        });
      }
    });


    // ## Send a batch of emails and only load the template once

    // Prepare nodemailer transport object
    var transportBatch = nodemailer.createTransport("SMTP", {
      service: "Gmail",
      auth: {
        user: "webrtcevry@gmail.com",
        pass: "webrtcevry91"
      }
    });

    // An example users object
    var users = [
      {
        email: 'webrtcevry@gmail.com',
        name: {
          first: 'Emmanuel',
          last: 'Petit'
        }
      },
      {
        email: 'webrtcevry@gmail.com',
        name: {
          first: 'Alexandre',
          last: 'Rousseau'
        }
      },
      {
        email: 'webrtcevry@gmail.com',
        name: {
          first: 'Valerian',
          last: 'Dieu'
        }
      }
    ];

    // Custom function for sending emails outside the loop
    //
    // NOTE:
    //  We need to patch postmark.js module to support the API call
    //  that will let us send a batch of up to 500 messages at once.
    //  (e.g. <https://github.com/diy/trebuchet/blob/master/lib/index.js#L160>)
    var Render = function(locals) {
      this.locals = locals;
      this.send = function(err, html, text) {
        if (err) {
          console.log(err);
        } else {
          transportBatch.sendMail({
            from: 'Spicy Meatball <spicy.meatball@spaghetti.com>',
            to: locals.email,
            subject: 'Mangia gli spaghetti con polpette!',
            html: html,
            // generateTextFromHTML: true,
            text: text
          }, function(err, responseStatus) {
            if (err) {
              console.log(err);
            } else {
              console.log(responseStatus.message);
            }
          });
        }
      };
      this.batch = function(batch) {
        batch(this.locals, templatesDir, this.send);
      };
    };

    // Load the template and send the emails
    template('newsletter', true, function(err, batch) {
      for(var user in users) {
        var render = new Render(users[user]);
        render.batch(batch);
      }
    });

  }
});

