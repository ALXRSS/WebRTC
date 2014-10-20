var server = require('http').createServer(app);
var app = server.listen(8080);
var io = require('socket.io').listen(app);
var app = require('express')();

/* On affiche la todolist et le formulaire */
app.get('/index', function(req, res) { 
    res.render('index.ejs', {});
})

io.sockets.on('connection', function(socket) {

    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });

    // When the user hangs up
    // broadcast bye signal to all users in the room
    socket.on('disconnect', function() {
        // close user connection
        console.log((new Date()) + " Peer disconnected.");
        socket.broadcast.emit('user disconnected');
    });
});