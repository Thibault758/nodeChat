const express = require('express')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server) // Créer une instance de socket.io sur ce serveur

const PORT = process.env.PORT || 9000

//template motor
app.set('view engine', 'pug');
app.set('views', './public/views')

app.use(express.static('public'));

require('./websocket.js')(io);

app.get('/', function (req, res) {
    res.render('index');
})

app.get('/gamming', function (req, res) {
    res.render('index');
})

app.get('/random', function (req, res) {
    res.render('index');
})

server.listen(PORT, () => console.log(`✓ Le serveur écoute sur le port
${PORT}`))

