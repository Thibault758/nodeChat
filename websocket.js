const Chat = require('./Chat');

module.exports = function(io){

    const chat = new Chat(io);

    io.on('connection', (socket) => {
        chat.onConnection(socket);
    })
}