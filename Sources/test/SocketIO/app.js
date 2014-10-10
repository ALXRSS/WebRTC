var http = require('http');
var fs = require('fs');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Classe connectedLobby pour pallier la dépréciation des méthodes get et set de l'objet socket
var connectedLobby = {
    connected : [],
    push : function (newConnected){
        if (typeof newConnected === 'object'
            && newConnected.id
            && newConnected.pseudo){
                this.connected.push(newConnected);
        }
    },
    remove : function(pseudo){
        var conn = [];
        this.connected.forEach(function(data){
           if(data.pseudo != pseudo){
               conn.push(data);
           }
        });
        this.connected = conn;
    },
    getPseudoList : function(){
        var conn = [];
        this.connected.forEach(function(data){
                conn.push(data.pseudo);
        });
        return conn;
    },
    getPseudoById: function(id){
        var conn = null;
        this.connected.forEach(function(data){
            if(data.id == id){
                conn = data.pseudo;
            }
        });
        return conn;
    }
 
}
// Fin de la classe connectedLobby

// Chargement de socket.io
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket, pseudo) {
    // Quand on client se connecte, on lui envoie un message
    socket.emit('message', 'Vous êtes bien connecté !');
    // On signale aux autres clients qu'il y a un nouveau venu
    socket.broadcast.emit('message', 'Un autre client vient de se connecter ! ');

    // Dès qu'on nous donne un pseudo, on le stocke en variable de session
    socket.on('petit_nouveau', function(pseudo) {
        // Deprecated : socket.set('pseudo', pseudo);
		connectedLobby.push({pseudo:pseudo,id:socket.id});
    });

    // Dès qu'on reçoit un "message" (clic sur le bouton), on le note dans la console
    socket.on('message', function (message) {
        // On récupère le pseudo de celui qui a cliqué dans les variables de session
        // Deprecated : socket.get('pseudo', function (error, pseudo) {
		var pseudo = connectedLobby.getPseudoById(socket.id);
        console.log(pseudo + ' me parle ! Il me dit : ' + message);
    });
	
	// Vider l'objet à la déconnexion
	socket.on('disconnect', function () {
		var pseudo = connectedLobby.getPseudoById(socket.id);
		connectedLobby.remove(pseudo);
	});
});


server.listen(8080);