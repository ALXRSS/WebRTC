var express = require('express');
var browserify = require('browserify-middleware');
var path = require('path');
var fs = require('fs');
var app = express();

// serve the rest statically
app.use(browserify('./site'));
app.use(express.static(__dirname + '/site'));

// les différents accès
app.get('/', function(req, res) {    
    res.writeHead(200);
 	fs.createReadStream(path.resolve(__dirname, 'site', 'index.html')).pipe(res);
});

app.get('/sol', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Vous êtes dans la cave à vins, ces bouteilles sont à moi !');
});


app.get('/etage/:etagenum', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Vous êtes à la chambre de l\'étage n°' + req.params.etagenum);
});

app.listen(8080);
console.log('running @ http://localhost:8080/');