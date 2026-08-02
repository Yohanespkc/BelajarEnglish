import React, { useEffect, useRef } from 'react';

export default function AudioWaveform({ audioStream, isRecording }) {
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  useEffect(() => {
    if (!isRecording || !audioStream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;

    const source = audioCtx.createMediaStreamSource(audioStream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderWaveform = () => {
      animFrameIdRef.current = requestAnimationFrame(renderWaveform);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#58cc02');
        gradient.addColorStop(1, '#1cb0f6');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 3, barHeight);

        x += barWidth;
      }
    };

    renderWaveform();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (audioCtx.state !== 'closed') audioCtx.close();
    };
  }, [isRecording, audioStream]);

  return (
    <div className="waveform-canvas-wrapper">
      <canvas ref={canvasRef} width={320} height={60} className="waveform-canvas" />
      <style>{`
        .waveform-canvas-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 12px 0;
        }

        .waveform-canvas {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
}
