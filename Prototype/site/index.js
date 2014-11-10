var quickconnect = require('rtc-quickconnect');
var captureConfig = require('rtc-captureconfig');
var media = require('rtc-media');
var crel = require('crel');
var qsa = require('fdom/qsa');
var tweak = require('fdom/classtweak');
var reRoomName = /^\/room\/(.*?)\/?$/;
var room = location.pathname.replace(reRoomName, '$1').replace('/', '');

// local & remote video areas
var local = qsa('.local')[0];
var remotes = qsa('.remote');

// data channel & peers
var channel;
var peerMedia = {};

// use google's ice servers
var iceServers = [
  { url: 'stun:stun.l.google.com:19302' }
  // { url: 'turn:192.158.29.39:3478?transport=udp',
  //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //  username: '28224511:1379330808'
  // },
  // { url: 'turn:192.158.29.39:3478?transport=tcp',
  //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //   username: '28224511:1379330808'
  // }
];

// capture local media
var localMedia = media({
  constraints: captureConfig('camera min:1280x720').toConstraints()
});

// Connexion à socket.io
var socket = io.connect('http://'+location.hostname + ':3000');

// On demande le pseudo, on l'envoie au serveur et on l'affiche dans le titre
var pseudo = prompt('Quel est votre pseudo ?');
socket.emit('nouveau_client', pseudo);
document.title = pseudo + ' - ' + document.title;

// On crée l'événement recupererParticipants pour récupérer directement les participants sur le serveur
socket.on('recupererParticipants', function(participants) {
  //réinitialisation de la liste des participants au niveau graphique lors des éventuelles màj de cette dernière
  $('#list_parts').children('li').remove();
  // participants est le tableau contenant tous les participants qui ont été écris sur le serveur
  for (var i = 0; i < participants.length; i++){
    $('#list_parts').prepend('<li><em>' + participants[i] + '</em></li>');
  }
});

// Quand on reçoit un message, on l'insère dans la page
socket.on('message', function(data) {
  insereMessage(data.pseudo, data.message)
})

// Quand un nouveau client se connecte, on affiche l'information
socket.on('nouveau_client', function(pseudo) {
  $('#list_chat').prepend('<li><em>' + pseudo + ' a rejoint le Chat !</em></li>');
  $('#list_parts').prepend('<li><em>' + pseudo + '</em></li>');
})

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
$('#formulaire_chat').submit(function () {
  var message = $('#message').val();
  socket.emit('message', message); // Transmet le message aux autres
  insereMyMessage(pseudo, message); // Affiche le message aussi sur notre page
  $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
  return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// Ajoute un message venant de l'exterieur
function insereMessage(pseudo, message) {
  $('#list_chat').prepend('<li><strong>>> ' + pseudo + ' : </strong> ' + message + '</li>');
}
// Ajoute un message interne dans la page
function insereMyMessage(pseudo, message) {
  $('#list_chat').prepend('<li style="color:green"><strong>> ' + pseudo + ' : </strong> ' + message + '</li>');
}

// Quand un client se déconnecte, on affiche l'information
socket.on('disconnect', function(pseudo) {
  $('#list_chat').prepend('<li><em>' + pseudo + ' a quitte le Chat !</em></li>');
  //$('#list_parts>li').remove( ":contains('" + pseudo +"')" );
})
//////////////////////
$('#invitation').click(function() {
  var dest = prompt('Entrez le mail du destinataire');
  var url = 'http://'+location.hostname + ':3000';
  socket.emit('invitation', {pseudo: pseudo, destinataire: dest, url: url});
});
////////////////////////////////////////////////////////////////

// render a remote video
function renderRemote(id, stream) {
  var activeStreams;

  // create the peer videos list
  peerMedia[id] = peerMedia[id] || [];

  activeStreams = Object.keys(peerMedia).filter(function(id) {
    return peerMedia[id];
  }).length;

  console.log('current active stream count = ' + activeStreams);
  peerMedia[id] = peerMedia[id].concat(media(stream).render(remotes[activeStreams % 2]));
}

function removeRemote(id) {
  var elements = peerMedia[id] || [];

  // remove old streams
  console.log('peer ' + id + ' left, removing ' + elements.length + ' elements');
  elements.forEach(function(el) {
    el.parentNode.removeChild(el);
  });
  peerMedia[id] = undefined;
}

// render our local media to the target element
localMedia.render(local);

// once the local media is captured broadcast the media
localMedia.once('capture', function(stream) {
  // handle the connection stuff
  quickconnect(location.href + '../../', {
    // debug: true,
    room: room,
    iceServers: iceServers
  })
  .addStream(stream)
  .createDataChannel('chat')
  .on('stream:added', renderRemote)
  .on('stream:removed', removeRemote)
  .on('channel:opened:chat', function(id, dc) {
    qsa('.chat').forEach(tweak('+open'));
  });
});