/* Côté serveur */

var app = require('express')();
var http = require('http').Server(app); 
var io = require('socket.io')(http);//Init socket.io with http server 

users = [];

//Route vers '/' et affiche index.html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//Listen for incoming sockets
io.on('connection', function(socket){
  socket.on('disconnect',function(data){
  	 data = socket.username;
  	 socket.broadcast.emit('disconnected', data);
  	 users.splice(users.indexOf(socket.username), 1);//Enlève le username qui vient de se déconnecter
     updateUserNames(); // Envoie la nouvelle liste d'users au client pour affichage
  })

//A  l'écoute de 'sendMessage', on récupère le message dans data
  socket.on('sendMessage', function(data){
    io.sockets.emit('newMessage', {user:socket.username, msg: data}); //Nouvel objet avec username et message
  });

  //A l'écoute de 'newUser' on vérifie si des données ont été entrées puis on récupère le username saisi
  socket.on('newUser', function(data,callback){
  	callback(true);
  	socket.username = data;
  	io.sockets.emit('connected', data); //Emission de 'connected' pour annoncer une nouvelle connexion
  	users.push(socket.username); //Ajoute un nouvel user à la liste users
  	updateUserNames();// Affichage de la liste d'users côté client
  });

 

const updateUserNames = () =>{
	io.sockets.emit('getUsers', users);
}
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});