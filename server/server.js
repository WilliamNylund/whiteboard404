require('dotenv').config()
var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors());

clientUrl = process.env.CLIENT_URL
console.log(clientUrl)
var http = require('http').createServer(app);
var socketIO = require('socket.io');

currBoard = null;

const io = socketIO(http, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

io.on('connection', (socket) => {
  socket.on('canvas-data', (data) => {
    console.log('emitting data');
    socket.broadcast.emit('canvas-data', data);
    currBoard = data;
  });
});

app.get('/canvas', cors(corsOptions), (req, res) => {
  res.send(currBoard);
});


app.get('/super-secret-board-clear', cors(corsOptions), (req, res) => {
      currBoard = null
      return res.send('cleared')
    });
    

var server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
http.listen(server_port, () => {
  console.log('Started on : ' + server_port);
});
