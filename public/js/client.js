class Client {
    constructor(nickname, photoUrl) {

        this.timer = 0;
        /*
            Initialisation de la connexion au serveur Websocket
            
            Note : Si le serveur web socket est accessible via la mÃªme adresse,
            on peut utiliser le raccourci vers le webroot : "/", qui Ã©quivaut 
            ici Ã  : http://localhost:9000/
        */

        this.socket = io.connect('/')

        // this.nickname = window.prompt('Choisissez un pseudonyme');

        this.nickname = nickname
        this.photoUrl = photoUrl

        this._setNickname(this.nickname, this.photoUrl);
        
        /*
            La syntaxe ({nickname, message}) est appelÃ©e en ES6 "Object param destructuring"
            Elle permet de dÃ©composer les propriÃ©tÃ©s de l'objet littÃ©ral en paramÃ¨tre.
        
            En ES5, cela Ã©quivaudrait Ã  Ã©crire :
            (obj) => {
                let nickname = obj.nickname
                let message = obj.message
            }
        
            Avec ES6, on peut dÃ©composer l'objet directement en paramÃ¨tre pour crÃ©er les 2 variables :
            ({nickname, message}) => {
                ...
            }
        */
        this.socket.once('init', (data) => this._onInit(data));
       // On récupere l'historique des messages et on l'affiche
        this.socket.on('message:all', (messages) => this.HistoryMessages(messages));
        //
        this.socket.on('user:list', users => this.displayUsers(users));
        //
        this.socket.on('message:new', ({message, nickname, date, photo}) => this.receiveMessage(message, nickname, date, photo));
        //lorsqu'un utilisateur tape au clavié, on est notifié...
        this.socket.on('message:keydown', (nickname) => this.userTypeOnKeyboardAction(nickname));
        // changement de channel
        this.changeChannel();
    }

    // A l'initialisation, reçoit du serveur la liste des channels et l'ID du channel dans lequel se trouve l'utilisateur
    _onInit({channelsList, userChannelId}) {
        this.channelId = userChannelId;
    }

    // Notifie le serveur du changement de nickname de ce client et de la chaine
    _setNickname(nickname, channel, photoUrl) {
        this.socket.emit('user:new', nickname, channel, photoUrl);
    }

    // Ã‰met un message vers le serveur
    sendMessage(message)  {
        this.socket.emit('message:new', message)
    }

    // ReÃ§oit un message de la part du serveur
    receiveMessage(message, nickname, date, photo) {
        $(".new-message").prepend('<p><img src="' + photo + '"><strong class="blackFont">' + nickname + ': </strong>' + message + ' REÇU LE - ' + date + '</p>')

    }

    // on affiche l'historique des messages
    HistoryMessages(messages) {
        $(".new-message").html('');
        $.each(messages, function(index, value){
            $(".new-message").prepend('<p><strong class="blackFont">' + value.nickname + ': </strong>' + value.message + '</p>') 
        })
    }

    // notifie lorsqu'un utilisateur tape un message
    onKeyDown(){
        $('#message').keydown( () => this.socket.emit('message:keydown', this.nickname))
    }

    // notifie lorsqu'un utilisateur arrete de taper un message
    onKeyUp(){
        $('#message').keyup( () => this.socket.emit('message:keyup', this.nickname))
    }

    userTypeOnKeyboardAction(nickname){

        $(".userType").html('<p>' + nickname + ' est en train d\'écrire...</p>');

        clearTimeout(this.timer);

        this.timer =setTimeout(function(){
                        $(".userType").html(''); 
                    },
                    2000
                    );
    }

    // on affiche tous les utilisateurs connectés
    displayUsers(users){
        $(".userName").html('');
        $.each(users, function(index, value){
            $(".userName").append('<p>' + value + '</p>')
        })
    }

    changeChannel(){
        let socket = this.socket;
        $('a').click(function(e) {
            e.preventDefault();
            let channelTitle = $(this).attr('data-room');
            socket.emit('channel:change', channelTitle);
        })
    }
}