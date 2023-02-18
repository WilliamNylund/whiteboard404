var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors());

var http = require('http').createServer(app);
var socketIO = require('socket.io');

currData = 'null';

const io = socketIO(http, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

var corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

io.on('connection', (socket) => {
  socket.on('canvas-data', (data) => {
    console.log('emitting data');
    socket.broadcast.emit('canvas-data', data);
    currData = data;
  });
});

app.get('/canvas', cors(corsOptions), (req, res) => {
  res.send(currData);
});

var server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
http.listen(server_port, () => {
  console.log('Started on : ' + server_port);
});
