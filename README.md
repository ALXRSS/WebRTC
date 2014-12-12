# WebRTC

## Construire un client léger WebRTC

* Serveur Node.js : création du serveur commun (server.js)
* Création du client léger (index.js, index.html)
* Langage JavaScript

### Vidéo conférence

* échange audio et vidéo entre plusieurs utilisateurs
* _module utile : rtc-quickconnect, afin de mettre en place un échange vidéo simple et rapide_

### Chat en temps réel
* échange de messages entre les différents utilisateurs connectés
* demande d'un pseudo à l'entrer sur le chat via une pop-up
* indiquer l'émetteur de chaque message
* message de connexion et de déconnexion
* liste des participants, mise à jour lors d'une connexion ou déconnexion
* _module utile : socket.io_

### Invitation
* inviter des personnes à rejoindre la vidéo conférence
* envoi d'un mail avec email du destinataire et pseudo de l'émetteur
* le destinataire reçoit l'URL de la room à rejoindre
* QR Code pour rejoidre la conversation via smartphone --> a faire ?
* _module utile : nodemailer_
  
### Transfert de fichier
* échange de fichiers entre utilisateurs (fichiers, vidéos, images) --> a faire
  
### Design
* Améliorer le design de base
* Intégrer une page d'accueil
* responsive --> a faire
  
### Accessibilité
* via le navigateur de chacun (Chrome, Firefox en priorité)
* fonctionnel en ouvrant plusieurs onglets sur la même machine
* fonctionnel sur des machines différentes sur le même réseau
* fonctionnel sur des machines différentes sur un réseau différent (paramétrage nécessaire)

Vous trouverez plus d'informations sur notre [wiki](https://github.com/ALXRSS/WebRTC/wiki)
