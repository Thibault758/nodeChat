class Client {
    constructor() {
        /*
            Initialisation de la connexion au serveur Websocket
            
            Note : Si le serveur web socket est accessible via la même adresse,
            on peut utiliser le raccourci vers le webroot : "/", qui équivaut 
            ici à : http://localhost:9000/
        */
        this.socket = io.connect('/'); // "socket" est un objet représentant ce socket client unique

        do {
            this.nickname = window.prompt('Choisissez un pseudonyme');
        } while (typeof this.nickname !== 'string' || this.nickname.trim() === '')
        this._setNickname(this.nickname);

        this.channelId = null;

        // Dom elements
        this.$form     = $('form#chat');
        this.$message  = $('input#message');
        this.$messages = $('ul#messages');
        this.$channelsList = $('ul#channelsList');

        this.typingNotificationTimer = 0;
        
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
        this.socket.once('init', (data) => this._onInit(data));
        this.socket.on('message:list', (messagesList) => this.updateMessagesList(messagesList))
        this.socket.on('message:new', ({nickname, message}) => this.receiveMessage(nickname, message));
        this.socket.on('user:list', (usernamesList) => this.updateUsersList(usernamesList));
        this.socket.on('notify:typing', (username) => this.someoneIsTyping(username));
    }
    // A l'initialisation, reçoit du serveur la liste des channels et l'ID du channel dans lequel se trouve l'utilisateur
    _onInit({channelsList, userChannelId}) {
        this.channelId = userChannelId;
        this.updateChannelsList(channelsList);
    }

    updateChannelsList(channelsList) {
        let template = '';
        let currentChannel = '';
        channelsList.forEach(channel => {
            if(this.channelId === channel.id) {
                currentChannel = channel
            }
            template += `<li>
                <a class="text-light ${this.channelId === channel.id && 'bg-dark'}" href="#" data-channel-id="${channel.id}" title="Accéder au channel ${channel.title}">
                    ${channel.title}
                </a>
            </li>`;
        });
        $('#channelsList').html(template);

        $('span.channelTitle').text(currentChannel.title.trim())
    }

    changeChannel(channelId) {
        this.channelId = channelId
        this.socket.emit('channel:change', channelId)
    }

    /*
        Cette méthode :
        - notifie le serveur du changement de nickname de ce client
    */
    _setNickname(nickname) {
        this.socket.emit('user:nickname', nickname);
    }

    /**
     * Met le DOM à jour avec la notification d'écriture d'un chatteur
     * @param {String} username Nom de l'utilisateur qui emet la notification
     */
    someoneIsTyping(username) {
        $('#typingNotification').text(`${username} est en train d'écrire...`);

        clearTimeout(this.typingNotificationTimer);
        this.typingNotificationTimer = window.setTimeout(() => {
            $('#typingNotification').empty();
        }, 5000);
    }

    /**
     * Met à jour le DOM avec la liste des messages précédents du tchat
     * @param {Array} messagesList Liste des messages
     */
    updateMessagesList(messagesList) {
        let html = '';

        messagesList.reverse().forEach((message) => {
            html += `<li class="list-group-item">
                        <span class="badge badge-dark">${message.nickname}</span>
                        ${message.message}
                    </li>`;
        });

        this.$messages.html(html);
    }

    /**
     * Met à jour le DOM avec la nouvelle liste des utilisateurs connectés au chat
     * @param {Array} usernamesList
     */
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

        // Lorsqu'on tape qqch, on emet un socket indiquant qu'on est en train d'écrire
        this.$message.on('input', (event) => {
            if (this.$message.val().trim() !== '') {
                this.notifyTyping();
            }
        });

        // Lorsqu'on change de channel en cliquant
        this.$channelsList.on('click', 'a[data-channel-id]', (event) => {
            event.preventDefault();

            let $linkEl = $(event.currentTarget);
            let channelId = $linkEl.data('channel-id');

            this.$channelsList.find('a[data-channel-id]').removeClass('bg-dark');
            $linkEl.addClass('bg-dark');

            $('span.channelTitle').text($linkEl.text().trim());

            // Changement du style
            this.changeChannel(channelId);
            // this.updateChannelsList();
        });
    }

    notifyTyping() {
        this.socket.emit('notify:typing');
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
        $('#typingNotification').empty();
        
        const html = `<li class="list-group-item">
                        <span class="badge badge-dark">${nickname}</span>
                        ${message}
                    </li>`;
        this.$messages.prepend(html);
    }
}
