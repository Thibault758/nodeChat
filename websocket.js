const Chat = require('./Chat');

module.exports = function(io){

    var gamming = io.of('/gamming');
    var random = io.of('/random');

    const chat = new Chat(io);

    io.on('connection', (socket) => {
        chat.onConnection(socket);
    })
}