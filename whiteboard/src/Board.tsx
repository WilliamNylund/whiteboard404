// @ts-nocheck

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';
import axios from 'axios';
/* 
1. Shit kommer probably att blir overwritten, probably not a problem tbh
2. Mobile dimensions
2.1 Dimensions

*/

type Iprops = {
  color: string;
  size: string;
};

const socket = io('http://localhost:5000');

const Board = (props: Iprops) => {
  let timeout = undefined;
  let ctx = undefined;

  let isDrawing = false;
  console.log(props.color);
  console.log(props.size);
  const fetchCanvas = async () => {
    axios.get('http://localhost:5000/canvas').then((res) => {
      var image = new Image();
      var canvas = document.querySelector('#board');
      var ctx = canvas.getContext('2d');
      image.onload = function () {
        ctx.drawImage(image, 0, 0);
        isDrawing = false;
      };
      image.src = res.data;
    });
  };

  useEffect(() => {
    fetchCanvas();

    socket.on('canvas-data', function (data) {
      var interval = setInterval(function () {
        if (isDrawing) return;
        isDrawing = true;
        clearInterval(interval);
        var image = new Image();
        var canvas = document.querySelector('#board');
        var ctx = canvas.getContext('2d');
        image.onload = function () {
          ctx.drawImage(image, 0, 0);
          isDrawing = false;
        };
        image.src = data;
      }, 200);
    });
    drawOnCanvas();
  }, []);

  useEffect(() => {
    var canvas = document.querySelector('#board');
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = props.color;
    ctx.lineWidth = props.size;
  }, [props.color, props.size]);

  const drawOnCanvas = () => {
    console.log('drawOnCanvas');
    var canvas = document.querySelector('#board');
    ctx = canvas.getContext('2d');
    console.log(props.size)
    ctx.strokeStyle = props.color;
    ctx.lineWidth = props.size;
    var sketch = document.querySelector('#sketch');
    var sketch_style = getComputedStyle(sketch);
    canvas.width = parseInt(sketch_style.getPropertyValue('width'));
    canvas.height = parseInt(sketch_style.getPropertyValue('height'));

    var mouse = { x: undefined, y: undefined };
    var last_mouse = { x: 0, y: 0 };

    /* Mouse Capturing Work */
    canvas.addEventListener(
      'touchmove',
      function (e) {
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;
        mouse.x = e.changedTouches[0].pageX - this.offsetLeft;
        mouse.y = e.changedTouches[0].pageY - this.offsetTop;
      },
      false
    );

    /* Drawing on Paint App */
    ctx.lineWidth = props.size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = props.color;

    canvas.addEventListener(
      'touchstart',
      function (e) {
        console.log('mousedown');
        canvas.addEventListener('touchmove', onPaint, false);
      },
      false
    );

    canvas.addEventListener(
      'touchend',
      function () {
        console.log('mouseup');
        mouse = { x: undefined, y: undefined };
        canvas.removeEventListener('touchmove', onPaint, false);
      },
      false
    );

    const onPaint = () => {
      ctx.beginPath();
      ctx.moveTo(last_mouse.x, last_mouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.closePath();
      ctx.stroke();

      if (timeout != undefined) clearTimeout(timeout);
      timeout = setTimeout(function () {
        console.log('sending canvas data');

        var base64ImageData = canvas.toDataURL('image/png');
        socket.emit('canvas-data', base64ImageData);
      }, 1000);
    };
  };

  return (
    <div className="sketch" id="sketch">
      <canvas className="board" id="board"></canvas>
    </div>
  );
};

export default Board;
