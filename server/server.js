var express = require('express')
var cors = require('cors')
var app = express()
app.use(cors())

var http = require('http').createServer(app);
var socketIO = require('socket.io');

const io = socketIO(http, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }});

io.on('connection', (socket)=> {
      console.log('User Online');

      socket.on('canvas-data', (data)=> {
            console.log("emitting data")
            socket.broadcast.emit('canvas-data', data);
            
      })
})

var server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
http.listen(server_port, () => {
    console.log("Started on : "+ server_port);
})