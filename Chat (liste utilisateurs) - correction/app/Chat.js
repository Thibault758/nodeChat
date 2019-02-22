const chalk = require('chalk')
const ent = require('ent')

const User = require('./User')

class Chat {
    constructor(io) {
        this.io = io
        this.users = [] // Liste des utilisateurs
        this.messages = [] // Liste des messages
    }

    onConnection(socket) {
        console.log(chalk.blue('✅  Client', socket.id, 'is connected via WebSockets'))
        
        socket.once('user:nickname', (nickname) => {
            // Création du nouvel utilisateur
            const user = new User(socket, nickname)
            // Ajoute cet utilisateur à la liste
            this.users.push(user)
            // Envoi de la nouvelle liste à tous les sockets connectés
            this.io.sockets.emit('user:list', this.getUsernamesList())

            // Mise en place des écouteurs d'événement sur ce socket
            socket.on('message:new', (message) => this._onNewMessage(user, message))
            socket.on('disconnect', () => this._onUserDisconnect(user))
        })
    }

    _onUserDisconnect(user) {
        let index = this.users.indexOf(user)
        if (index > -1) {
            this.users.splice(index, 1)

            user.destroy()

            // Envoi de la nouvelle liste à tous les sockets connectés
            this.io.sockets.emit('user:list', this.getUsernamesList())
        }
    }

    _onNewMessage(user, message) {
        // Sécurisation du message 
        message = ent.encode(message);

        this.io.sockets.emit('message:new', {message, nickname: user.nickname})
    }

    getUsernamesList() {
        return this.users.map(user => user.nickname);
    }
}

module.exports = Chat
