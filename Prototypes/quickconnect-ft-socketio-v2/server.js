var fs = require('fs');
var path = require('path');
var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var app = express();
var server = require('http').Server(app);
var browserify = require('browserify-middleware');
var serverPort = parseInt(process.env.PORT, 10) || 3000;
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent');

// Liste des participants
var participants = [];

// create the switchboard
var switchboard = require('rtc-switchboard')(server);

// convert stylus stylesheets
app.use(stylus.middleware({
  src: __dirname + '/site',
  compile: function(str, sourcePath) {
    return stylus(str)
      .set('filename', sourcePath)
      .set('compress', false)
      .use(nib());
  }
}));


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
		});
		// mettre à jour la liste des participants et la renvoyer aux autres clients
		var index = participants.indexOf(pseudo);
		participants.splice(index, 1);
		socket.broadcast.emit('recupererParticipants', participants);
	});
	
});

// start the server
server.listen(serverPort, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('running @ http://localhost:' + serverPort + '/');
});