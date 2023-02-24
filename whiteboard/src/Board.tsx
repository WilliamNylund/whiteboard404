// @ts-nocheck
import { useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import axios from 'axios';

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

  const typeOfInteraction = props.isMobile
    ? ['touchmove', 'touchstart', 'touchend']
    : ['mousemove', 'mousedown', 'mouseup'];

  const fetchCanvas = async () => {
    axios.get(BASE_URL + '/canvas').then((res) => {
      let image = new Image();
      let canvas = document.querySelector('#board');
      let ctx = canvas.getContext('2d');
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
        isDrawing = false;
      };
      image.src = res.data;
    });
  };

  useEffect(() => {
    fetchCanvas();
    drawOnCanvas();

    socket.on('canvas-data', (data) => {
      let interval = setInterval(() => {
        if (isDrawing) return;
        isDrawing = true;
        clearInterval(interval);
        let image = new Image();
        let canvas = document.querySelector('#board');
        let ctx = canvas.getContext('2d');
        image.onload = () => {
          ctx.drawImage(image, 0, 0, canvas?.clientWidth, canvas?.clientHeight);
          isDrawing = false;
        };
        image.src = data;
      }, 200);
    });

    return () => {
      socket.off('canvas-data');
    };
  }, []);

  useEffect(() => {
    let canvas = document.querySelector('#board');
    let ctx = canvas.getContext('2d');
    ctx.strokeStyle = props.color;
    ctx.lineWidth = props.size;
  }, [props.color, props.size]);

  const drawOnCanvas = () => {
    let canvas = document.querySelector('#board');
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = props.color;
    ctx.lineWidth = props.size;

    canvas.width = canvas?.clientWidth;
    canvas.height = canvas?.clientHeight;
    let mouse = { x: undefined, y: undefined };
    let last_mouse = { x: 0, y: 0 };

    window.addEventListener('resize', () => {
      let inMemCanvas = document.createElement('canvas');
      let inMemCtx = inMemCanvas.getContext('2d');
      let newWidth = canvas?.clientWidth;
      let newHeight = canvas?.clientHeight;
      if (canvas.width != newWidth || canvas.height != newHeight) {
        inMemCanvas.width = canvas.width;
        inMemCanvas.height = canvas.height;
        inMemCtx.drawImage(canvas, 0, 0);
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(inMemCanvas, 0, 0, newWidth, newHeight);
        ctx.strokeStyle = props.color;
        ctx.lineWidth = props.size;
      }
    });

    // Capturing mouse movement
    canvas.addEventListener(typeOfInteraction[0], function (e) {
      e.preventDefault();
      last_mouse.x = mouse.x;
      last_mouse.y = mouse.y;
      if (props.isMobile) {
        mouse.x = e.changedTouches[0].pageX - this.offsetLeft;
        mouse.y = e.changedTouches[0].pageY - this.offsetTop;
      } else {
        mouse.x = e.pageX;
        mouse.y = e.pageY - this.offsetTop;
      }
    });

    ctx.lineWidth = props.size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = props.color;

    canvas.addEventListener(typeOfInteraction[1], (e) => {
      e.preventDefault();
      canvas.addEventListener(typeOfInteraction[0], onPaint);
    });

    canvas.addEventListener(typeOfInteraction[2], (e) => {
      e.preventDefault();
      mouse = { x: undefined, y: undefined };
      canvas.removeEventListener(typeOfInteraction[0], onPaint);
    });

    const onPaint = () => {
      ctx.beginPath();
      ctx.moveTo(last_mouse.x, last_mouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.closePath();
      ctx.stroke();

      if (timeout != undefined) clearTimeout(timeout);
      timeout = setTimeout(() => {
        let base64ImageData = canvas.toDataURL('image/png');
        socket.emit('canvas-data', base64ImageData);
      }, 1000);
    };
  };

  return (
    <div className="sketch" id="sketch">
      <div className="centered">
        <div className="error-main">
          <h2 className="header-404">404</h2>
        </div>
        <p className="text-404">
          Oops, the page you're looking for does not exist.
        </p>
        <p className="sub">Greet other lost souls with a drawing!</p>
      </div>
      <canvas className="board" id="board"></canvas>
    </div>
  );
};

export default Board;
