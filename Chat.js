const chalk = require('chalk')
const ent = require('ent')
const User = require('./User')
const Channel = require('./Channel')

class Chat {
    constructor(io) {
        this.io = io
        this.users = [] // Liste des utilisateurs
        this.nicknames = [] // Liste des noms des utilisateurs
        this.channels = [] // Le système de chat va gérer un Array de channels
        this.channels.push(
            new Channel(io, 'general'),
            new Channel(io, 'gamming'),
            new Channel(io, 'random')
        )
    }

    onConnection(socket) {
        console.log(chalk.blue('âœ…  Client', socket.id, 'is connected via WebSockets'))

        // Enregistrement du nouvel utilisateur
        socket.once('user:new', (username, photoUrl)  => {

            console.log(photoUrl)
            // Création du nouvel utilisateur
            const user = new User(socket, username, photoUrl)

            // Ajout de l'utilisateur au channel par défaut : le channel "general"
            let defaultChannel = this.getChannelByTitle('general')
            defaultChannel.addUser(user)

            // Envoi de l'événement "init" à l'utilisateur qui vient de se connecter, avec diverses informations
            socket.emit('init', {
                userChannelId: user.channelId
            })
            // changement de channel
            socket.on('channel:change', (channeltitle) => this._onChangeChannel(user, channeltitle))
            // lorsque l'on recoit un nouveau message sur le tchat
            socket.on('message:new', (message, nickname) => {
                this._onNewMessage(user, message)
            })
            // notification lorsqu'un user tape un message
            socket.on('message:keydown', (nickname) => this._onKeyDown(socket, nickname));
            // deconnection
            socket.on('disconnect', () => this._onUserDisconnect(user))
        });
    }

    _onNewMessage(user, message) {
        const userChannel = this.getChannelByTitle(user.channelId)
        userChannel.addMessage(user, message)
    }

    _setNewUser(socket, username){
        // ajout du nouvel utilisateur
        this.user = new User(socket, username);
        this.users.push(this.user);
        return this.user;
    }

    _userLeft(socket){
        this.users = this.users.filter(function(obj){
            return obj.id !== socket.id;
        })
        this.nicknames = this.users.map( u => u.nickname);
        socket.broadcast.to(this.channel).emit('users:all', this.nicknames);
    }

    _onKeyDown(socket, nickname){
        socket.broadcast.emit('message:keydown', nickname)
    }

    // Récupère un objet Channel via son titre
    getChannelByTitle(title) {
        return this.channels.find(channel => channel.title === title)
    }

    _onChangeChannel(user, channelId) {
        console.log(user.channelId, channelId)
        const oldChannel = this.getChannelByTitle(user.channelId)
        const newChannel = this.getChannelByTitle(channelId)

        if (!(oldChannel instanceof Channel) || !(newChannel instanceof Channel)) {
            return console.warn(chalk.yellow(`_onChangeChannel : Channel(s) invalide(s)`))
        }

        // Vérification si l'user n'est pas déjà dans ce channel
        if (newChannel.users.includes(user)) {
            return console.warn(chalk.yellow(`_onChangeChannel : L'utilisateur ${user.nickname} se trouve déjà dans le channel ${newChannel.title}`))
        }

        oldChannel.removeUser(user)
        newChannel.addUser(user)
    }

    _onUserDisconnect(user) {
        console.log("disconnect");
        // Récupération du channel depuis lequel l'utilisateur s'est déconnecté, pour y mettre à jour la liste
        let userChannel = this.getChannelByTitle(user.channelId)
        userChannel.removeUser(user)
        user.destroy()
    }
}

module.exports = Chat