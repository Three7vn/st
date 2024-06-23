import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const WheelComponent = forwardRef(({
  segments,
  segmentsData,
  segColors,
  onFinished,
  onRotate,
  onRotatefinish,
  primaryColor,
  primaryColoraround,
  contrastColor,
  buttonText,
  isOnlyOnce = true,
  size = 290,
  upDuration = 1000,
  downDuration = 100,
  fontFamily = 'proxima-nova',
  width = 100,
  height = 100,
},ref) => {
  let currentSegment = '';
  let winningSegment = '';
  let isStarted = false;
  const [isFinished, setFinished] = useState(false);

  let timerHandle = 0;
  const timerDelay = segments.length;
  let angleCurrent = 0;
  let angleDelta = 0;
  let canvasContext = null;
  let maxSpeed = Math.PI / `${segments.length}`;
  const upTime = segments.length * upDuration;
  const downTime = segments.length * downDuration;
  let spinStart = 0;
  let frames = 0;
  const centerX = 300;
  const centerY = 300;
  useEffect(() => {
    wheelInit();
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 0);
  }, []);
  const wheelInit = () => {
    initCanvas();
    wheelDraw();
  };

  const initCanvas = () => {
    let canvas = document.getElementById('canvas');
    if (navigator.appVersion.indexOf('MSIE') !== -1) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      canvas.setAttribute('id', 'canvas');
      document.getElementById('wheel').appendChild(canvas);
    }
    canvas.addEventListener('click', spin, true);
    canvasContext = canvas.getContext('2d');
  };

  const calculateWinner = () => {
    const totalProbability = segmentsData.reduce((acc, segment) => acc + segment.probability, 0);
    const random = Math.random() * totalProbability;
    let cumulativeProbability = 0;

    for (let i = 0; i < segments.length; i++) {
      cumulativeProbability += segmentsData[i].probability;
      if (random < cumulativeProbability) {
        setTimeout(() => {
          winningSegment = segments[i];
        }, downDuration);
        return;
      }
    }
    setTimeout(() => {
      winningSegment = segments[segments.length - 1];
    }, downDuration);
    return;
  };

 
  const spin = () => {
    isStarted = true;
    calculateWinner();
    // onRotate();
    if (timerHandle === 0) {
      spinStart = new Date().getTime();
      maxSpeed = Math.PI / segments.length;
      frames = 0;
      timerHandle = setInterval(onTimerTick, timerDelay);
    }
  };

  useImperativeHandle(ref, () => ({
    wheelInit,
    spin
  }));
  const onTimerTick = () => {
    frames++;
    draw();
    const duration = new Date().getTime() - spinStart;
    let progress = 0;
    let finished = false;
    if (duration < upTime) {
      progress = duration / upTime;
      angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2);
    } else {
      if (winningSegment) {
        if (currentSegment === winningSegment && frames > segments.length) {
          progress = duration / upTime;
          angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
          progress = 1;
        } else {
          progress = duration / downTime;
          angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
        }
      } else {
        progress = duration / downTime;
        if (progress >= 0.8) {
          angleDelta = (maxSpeed / 1.2) * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
        } else if (progress >= 0.98) {
          angleDelta = (maxSpeed / 2) * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
        } else angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
      }
      if (progress >= 1) finished = true;
    }

    angleCurrent += angleDelta;
    while (angleCurrent >= Math.PI * 2) angleCurrent -= Math.PI * 2;
    if (finished) {
      setFinished(true);
      onFinished(currentSegment);
      clearInterval(timerHandle);
      timerHandle = 0;
      angleDelta = 0;
    }
  };

  const wheelDraw = () => {
    clear();
    drawWheel();
    drawNeedle();
  };

  const draw = () => {
    clear();
    drawWheel();
    drawNeedle();
  };

  const drawSegment = (key, lastAngle, angle) => {
    const ctx = canvasContext;
    const value = segments[key];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, size, lastAngle, angle, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    // Create gradient
    const gradient = ctx.createLinearGradient(
      centerX,
      centerY,
      centerX + size * Math.cos((lastAngle + angle) / 2),
      centerY + size * Math.sin((lastAngle + angle) / 2)
    );
    gradient.addColorStop(0.3, key % 2 !== 0 ? '#4C5368' : '#535D78');
    gradient.addColorStop(1, key % 2 !== 0 ? '#979797' : '#383F52'); // Change this to the desired second color for gradient

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((lastAngle + angle) / 2);

    // Calculate the position at the start of the segment
    const textX = size / 2 + 40; // Shift text position to be outside the center circle
    const textY = 0;
    ctx.fillStyle = contrastColor || '#383F52';
    ctx.font = 'bold 1em ' + fontFamily;
    ctx.fillText(value.substr(0, 21), textX, textY);
    ctx.restore();
  };

  const drawWheel = () => {
    const ctx = canvasContext;
    let lastAngle = angleCurrent;
    const len = segments.length;
    const PI2 = Math.PI * 2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = primaryColor || '#707070';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = '1em ' + fontFamily;
    for (let i = 1; i <= len; i++) {
      const angle = PI2 * (i / len) + angleCurrent;
      drawSegment(i - 1, lastAngle, angle);
      lastAngle = angle;
    }

    // Draw a center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, PI2, false);
    ctx.closePath();

    ctx.lineWidth = 5;
    ctx.strokeStyle = '#F0B90B' || 'white';
    ctx.fill();
    ctx.font = 'bold 2em ' + fontFamily;
    // Change buttonText color
    const buttonTextColor = '#F0B90B'; // Change this to your desired color
    ctx.fillStyle = buttonTextColor;
    ctx.textAlign = 'center';
    ctx.fillText(buttonText || '', centerX, centerY + 3);
    ctx.stroke();

    // Draw outer circle

    // Create gradient for outer circle
    const gradient = ctx.createLinearGradient(
      centerX - size,
      centerY - size,
      centerX + size,
      centerY + size
    );
    gradient.addColorStop(0, '#707070'); // Start color
    gradient.addColorStop(1, '#313131'); // End color

    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, PI2, false);
    ctx.closePath();
    ctx.lineWidth = 17;
    ctx.strokeStyle = gradient || 'white';
    ctx.stroke();
  };

  const drawNeedle = () => {
    const ctx = canvasContext;
    ctx.lineWidth = 1;
    ctx.strokeStyle = contrastColor || 'white';
    ctx.fileStyle = contrastColor || 'white';
    ctx.beginPath();
    ctx.moveTo(centerX + 10, centerY - 40);
    ctx.lineTo(centerX - 10, centerY - 40);
    ctx.lineTo(centerX, centerY - 60);
    ctx.closePath();
    ctx.fill();
    const change = angleCurrent + Math.PI / 2;
    let i = segments.length - Math.floor((change / (Math.PI * 2)) * segments.length) - 1;
    if (i < 0) i = i + segments.length;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'transparent';
    ctx.font = 'bold 1.5em ' + fontFamily;
    currentSegment = segments[i];
    isStarted && ctx.fillText(currentSegment, centerX + 10, centerY + size + 50);
  };
  const clear = () => {
    const ctx = canvasContext;
    if(ctx){

      ctx.clearRect(0, 0, 1000, 800);
    }
  };
  return (
    <div id="wheel">
      <canvas
      
        id="canvas"
        width="600"
        height="600"
        style={{
          pointerEvents: isFinished && isOnlyOnce ? 'none' : 'none',
        }}
      />
    </div>
  );
});
export default WheelComponent;
