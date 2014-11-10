var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var browserify = require('browserify-middleware');
var serverPort = parseInt(process.env.PORT, 10) || 3000;
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent');
var nodemailer = require('nodemailer');

// Liste des participants
var participants = [];

// create the switchboard
var switchboard = require('rtc-switchboard')(server);

app.get('/', function(req, res) {
  res.redirect(req.uri.pathname + 'room/main/');
});

browserify.settings.development('debug', true);

// force development mode for browserify given this is a demo
browserify.settings('mode', 'development');

// serve the rest statically
app.use(browserify('./site'));
app.use(express.static(__dirname + '/site'));

// we need to expose the primus library
app.get('/rtc.io/primus.js', switchboard.library());
app.get('/room/:roomname', function(req, res, next) {
  res.writeHead(200);
  fs.createReadStream(path.resolve(__dirname, 'site', 'index.html')).pipe(res);
});

// creation d'un transporteur reutilisable utilisant SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'webrtcevry@gmail.com',
        pass: 'webrtcevry91'
    }
});

// on utilise socket.io pour créer deux variables de session à transférer aux clients
io.sockets.on('connection', function (socket, pseudo) {
  
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.set('pseudo', pseudo);
        socket.broadcast.emit('nouveau_client', pseudo);
        //Ajout du nouveau participant a la liste
        participants.push(pseudo);
            // On donne la liste des participants (événement créé du côté client)
            socket.emit('recupererParticipants', participants);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        socket.get('pseudo', function (error, pseudo) {
            message = ent.encode(message);
            socket.broadcast.emit('message', {pseudo: pseudo, message: message});
        });
    });
	
	// Vider l'objet à la déconnexion
	socket.on('disconnect', function () {
		socket.get('pseudo', function (error, pseudo) {
			socket.broadcast.emit('disconnect', pseudo);
			// mettre à jour la liste des participants et la renvoyer aux autres clients
			var index = participants.indexOf(pseudo);
			participants.splice(index, 1);
			socket.broadcast.emit('recupererParticipants', participants);
		});
	});
	
  // Invitation d'un participant par envoi de mail
  socket.on('invitation', function (data) {

      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: 'Web RTC <webrtcevry@gmail.com>', // sender address
        to: data.destinataire, // list of receivers
        subject: 'Invitation WebRTC', // Subject line
        text: 'Bonjour, '+ data.pseudo +' vous invite à rejoindre une room web RTC à cette adresse : '+ data.url, // plaintext body
        html: '<b>Bonjour, '+ data.pseudo +' vous invite à rejoindre une room web RTC à cette adresse : '+ data.url +'</b>' // html body
      };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
           console.log(error);
         }else{
           console.log('Message sent: ' + info.response);
          }
        });
    });
});

// start the server
server.listen(serverPort, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('running @ http://localhost:' + serverPort + '/');
});