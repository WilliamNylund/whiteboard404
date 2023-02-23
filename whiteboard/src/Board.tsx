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
  size: string
  isMobile: boolean;
};
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const socket = io(BASE_URL);

const Board = (props: Iprops) => {
  let timeout = undefined;
  let ctx = undefined;

  let isDrawing = false;

  const typeOfInteraction = props.isMobile ? ['touchmove', 'touchstart', 'touchend'] : ['mousemove', 'mousedown', 'mouseup']

  const fetchCanvas = async () => {
    axios.get(props.isMobile ? BASE_URL + '/mobile-canvas' : BASE_URL + '/canvas').then((res) => {
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

    socket.on(props.isMobile ? 'canvas-mobile-data' : 'canvas-data' , function (data) {
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
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
    
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
    console.log(props.size);
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
      typeOfInteraction[0],
      function (e) {
        e.preventDefault();
        e.preventDefault();
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;
        if (props.isMobile) {
            mouse.x = e.changedTouches[0].pageX - this.offsetLeft;
            mouse.y = e.changedTouches[0].pageY - this.offsetTop;
        } else {
            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }
        
      },
      false
    );

    /* Drawing on Paint App */
    ctx.lineWidth = props.size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = props.color;

    canvas.addEventListener(
      typeOfInteraction[1],
      function (e) {
        e.preventDefault();
        e.preventDefault();
        console.log(typeOfInteraction[1]);
        canvas.addEventListener(typeOfInteraction[0], onPaint, false);
      },
      false
    );

    canvas.addEventListener(
      typeOfInteraction[2],
      function (e) {
        e.preventDefault();
        e.preventDefault();
        console.log(typeOfInteraction[2]);
        mouse = { x: undefined, y: undefined };
        canvas.removeEventListener(typeOfInteraction[0], onPaint, false);
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
        socket.emit(props.isMobile ? 'canvas-mobile-data' : 'canvas-data', base64ImageData);
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
