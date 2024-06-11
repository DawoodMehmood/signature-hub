import React, { useRef, useState, useEffect } from "react";
import "./components.css";
const SignatureBoard = () => {
  const canvasRef = useRef(null);
  const [lineColor, setLineColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [backgroundColor, setBackgroundColor] = useState("rgba(0,0,0,0.0)");
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isTransparent, setIsTransparent] = useState(false);

  useEffect(() => {
    if (!isTransparent) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = backgroundColor; // Set the background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [backgroundColor, isTransparent]);

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth; // Set line width based on state
    ctx.lineCap = "round"; // Smooth out the lines
    ctx.lineJoin = "round"; // Smooth out the curves
    canvas.isDrawing = true;
    canvas.hasMoved = false;
  };

  const draw = (event) => {
    const canvas = canvasRef.current;
    if (!canvasRef.current.isDrawing) return;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    ctx.stroke();
    canvas.hasMoved = true;
    setIsCanvasEmpty(false);
  };

  const stopDrawing = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!canvas.hasMoved) {
      // Draw a dot if the mouse didn't move
      ctx.beginPath();
      ctx.arc(
        event.nativeEvent.offsetX,
        event.nativeEvent.offsetY,
        lineWidth / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = lineColor;
      ctx.fill();
      setIsCanvasEmpty(false);
    }
    canvas.isDrawing = false;
  };

  const resetBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0.0)"; // Reset the background color
    setBackgroundColor("rgba(0,0,0,0.0)");
    setLineColor("#000");
    setLineWidth(2);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsCanvasEmpty(true);
  };

  const downloadSignature = () => {
    if (isCanvasEmpty) {
      alert("Canvas is empty");
      return;
    }

    const canvas = canvasRef.current;
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Copy the drawing without the background color
    tempCtx.drawImage(canvas, 0, 0);

    if (isTransparent) {
      const imageData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 255) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }
      }
      tempCtx.putImageData(imageData, 0, 0);
    } else {
      tempCtx.globalCompositeOperation = "destination-over";
      tempCtx.fillStyle = backgroundColor;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    const link = document.createElement("a");
    link.download = "signature.png";
    link.href = tempCanvas.toDataURL();
    link.click();
  };

  return (
    <div className="container">
      <h1>Signature Board</h1>
      <div className="controls buttons-array">
        <label>
          Line Color:&nbsp;
          <input
            type="color"
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
          />
        </label>
        <label>
          Background Color:&nbsp;
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </label>
        <label>
          Line Thickness:&nbsp;
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            title="Line Thickness"
          />
          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            title="Line Thickness"
          >
            <option value="2">Thin</option>
            <option value="5">Medium</option>
            <option value="10">Thick</option>
          </select>
        </label>
        <label>
          Transparent Background:
          <input
            type="checkbox"
            checked={isTransparent}
            onChange={(e) => setIsTransparent(e.target.checked)}
          />
        </label>
        <button onClick={resetBoard}>Reset</button>
        <button onClick={downloadSignature}>Download</button>
      </div>
      <canvas
        ref={canvasRef}
        width="800"
        height="400"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        style={{ border: "1px solid #000", backgroundColor: "#fff" }}
      ></canvas>
    </div>
  );
};

export default SignatureBoard;
