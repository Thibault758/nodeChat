class User {
    constructor(socket, nickname, photoUrl) {
        this.id        = socket.id
        this.nickname  = nickname
        this.socket    = socket
        this.channelId
        this.photoUrl = photoUrl
    }

    destroy() {
        this.id = null
        this.nickname = null
        this.channelId = null
        this.socket.disconnect()
    }
}

module.exports = User