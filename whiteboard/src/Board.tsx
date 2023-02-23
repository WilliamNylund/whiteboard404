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
  isMobile: boolean;
};
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const socket = io(BASE_URL);

const Board = (props: Iprops) => {
  let timeout = undefined;
  let ctx = undefined;

  let isDrawing = false;
  let inMemCanvas = document.createElement('canvas');
  let inMemCtx = inMemCanvas.getContext('2d');
  const typeOfInteraction = props.isMobile
    ? ['touchmove', 'touchstart', 'touchend']
    : ['mousemove', 'mousedown', 'mouseup'];

  const fetchCanvas = async () => {
    axios
      .get(BASE_URL + '/canvas')
      .then((res) => {
        var image = new Image();
        var canvas = document.querySelector('#board');
        var ctx = canvas.getContext('2d');
        image.onload = function () {
          ctx.drawImage(image, 0, 0);
          isDrawing = false;
        };
        console.log("res.data", res.data)
        image.src = res.data;
      });
  };

  useEffect(() => {
    fetchCanvas();
    drawOnCanvas();


    socket.on(
      'canvas-data',
      function (data) {
        var interval = setInterval(function () {
          if (isDrawing) return;
          isDrawing = true;
          clearInterval(interval);
          var image = new Image();
          var canvas = document.querySelector('#board');
          var ctx = canvas.getContext('2d');
          image.onload = function () {
            ctx.drawImage(image, 0, 0, canvas?.clientWidth, canvas?.clientHeight ); //, canvas?.clientWidth, canvas?.clientHeight 
            isDrawing = false;
          };
          console.log(data);
          
          image.src = data;
        }, 200);
      }
    );
    
    
    return () => {
      socket.off('canvas-data');
    };
  }, []);

  useEffect(() => {
    var canvas = document.querySelector('#board');
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = props.color;
    ctx.lineWidth = props.size;
  }, [props.color, props.size]);

  const drawOnCanvas = () => {
    var canvas = document.querySelector('#board');
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = props.color;
    ctx.lineWidth = props.size;
    var sketch = document.querySelector('#sketch');
    var sketch_style = getComputedStyle(sketch);
    canvas.width = parseInt(sketch_style.getPropertyValue('width'));
    canvas.height = parseInt(sketch_style.getPropertyValue('height'));

    canvas.width = canvas?.clientWidth;
    canvas.height = canvas?.clientHeight;
    var mouse = { x: undefined, y: undefined };
    var last_mouse = { x: 0, y: 0 };
    

    window.addEventListener(
      'resize',
      function () {
        let inMemCanvas = document.createElement('canvas');
        let inMemCtx = inMemCanvas.getContext('2d');
        let newWidth = canvas?.clientWidth;
        let newHeight = canvas?.clientHeight;
        if (canvas.width != newWidth || canvas.height != newHeight){
          inMemCanvas.width = canvas.width;
          inMemCanvas.height = canvas.height;
          inMemCtx.drawImage(canvas, 0, 0);
          canvas.width = newWidth
          canvas.height = newHeight
          ctx.drawImage(inMemCanvas, 0, 0, newWidth, newHeight);
        }
        
      }
    );
  
    /* Mouse Capturing Work */
    canvas.addEventListener(
      typeOfInteraction[0],
      function (e) {
        e.preventDefault();
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;

        if (props.isMobile) {
          mouse.x = e.changedTouches[0].pageX - this.offsetLeft;
          mouse.y = e.changedTouches[0].pageY - this.offsetTop;
        } else {
          mouse.x = e.pageX
          mouse.y = e.pageY - this.offsetTop
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
        canvas.addEventListener(typeOfInteraction[0], onPaint, false);
      },
      false
    );

    canvas.addEventListener(
      typeOfInteraction[2],
      function (e) {
        e.preventDefault();
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
        var base64ImageData = canvas.toDataURL('image/png');
        socket.emit(
          'canvas-data',
          base64ImageData
        );
      }, 1000);
    };
  };

  return (
    <div className="sketch" id="sketch">
      <div className='centered'><h2>- 404 -</h2>
      <p>Oops! This page does not exist anymore</p>
      <p>Feel free to drop a drawing</p>
      </div>
      <canvas className="board" id="board"></canvas>
    </div>
  );
};

export default Board;
