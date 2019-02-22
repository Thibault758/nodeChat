class Client {
    constructor() {
        /*
            Initialisation de la connexion au serveur Websocket
            
            Note : Si le serveur web socket est accessible via la même adresse,
            on peut utiliser le raccourci vers le webroot : "/", qui équivaut 
            ici à : http://localhost:9000/
        */
        this.socket = io.connect('/'); // "socket" est un objet représentant ce socket client unique

        this.nickname = window.prompt('Choisissez un pseudonyme');
        this._setNickname(this.nickname);

        // Dom elements
        this.$form     = $('form#chat');
        this.$message  = $('input#message');
        this.$messages = $('ul#messages');
        
        /*
            La syntaxe ({nickname, message}) est appelée en ES6 "Object param destructuring"
            Elle permet de décomposer les propriétés de l'objet littéral en paramètre.
        
            En ES5, cela équivaudrait à écrire :
            (obj) => {
                let nickname = obj.nickname
                let message = obj.message
            }
        
            Avec ES6, on peut décomposer l'objet directement en paramètre pour créer les 2 variables :
            ({nickname, message}) => {
                ...
            }
        */
        this.socket.on('message:new', ({nickname, message}) => this.receiveMessage(nickname, message));
        this.socket.on('user:list', (usernamesList) => this.updateUsersList(usernamesList));
    }

    /*
        Cette méthode :
        - notifie le serveur du changement de nickname de ce client
    */
    _setNickname(nickname) {
        this.socket.emit('user:nickname', nickname);
    }

    updateUsersList(usernamesList) {
        let template = '';
        usernamesList.forEach(username => {
            template += `<li>
                            ${username === this.nickname 
                                ? `<strong>${username}</strong>`
                                : username
                            }
                        </li>`;
            $('#usersList').html(template);
        })
    }

    /**
     * Permet d'initialiser les gestionnaires d'événément pour le client
     * (validation du formulaire, clic sur un channel ... etc)
     */
    init() {
        // À la soumission du formulaire, on envoie le contenu du message au serveur
        this.$form.on('submit', (event) => {
            event.preventDefault();
            this.sendMessage(this.$message.val());
            this.$message.val('')[0].focus();
        });
    }

    /**
     * Émet un message de ce client vers le serveur
     */
    sendMessage(message) {
        this.socket.emit('message:new', message);
    }

    /**
     * Reçoit un message d'un autre tchatteur de la part du serveur
     */
    receiveMessage(nickname, message) {
        const html = `<li class="list-group-item">
                        <span class="badge badge-dark">${nickname}</span>
                        ${message}
                    </li>`;
        this.$messages.prepend(html);
    }
}
