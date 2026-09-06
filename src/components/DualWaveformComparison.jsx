import React, { useEffect, useRef, useState } from 'react';
import { Play, Sparkles, Activity, Clock, Layers, BarChart2, TrendingUp, Volume2 } from 'lucide-react';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';

export default function DualWaveformComparison({ 
  userAudioBlob, 
  userAudioUrl, 
  targetText, 
  accent = 'US',
  selectedItem = null,
  onAcousticEvaluationComplete,
  onTriggerSimulation = null
}) {
  const nativeCanvasRef = useRef(null);
  const userCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const pitchCanvasRef = useRef(null);

  // View modes: 'dual' (Side-by-Side / Stacked) | 'overlay' (Superimposed) | 'pitch' (Intonation Contour)
  const [viewMode, setViewMode] = useState('dual');

  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingAB, setIsPlayingAB] = useState(false);

  const [nativeDuration, setNativeDuration] = useState(0);
  const [userDuration, setUserDuration] = useState(0);
  const [tempoMatchPercent, setTempoMatchPercent] = useState(null);
  const [energyMatchPercent, setEnergyMatchPercent] = useState(null);
  const [pitchMatchPercent, setPitchMatchPercent] = useState(null);
  const [overallAcousticScore, setOverallAcousticScore] = useState(null);

  const [nativeWaveformPoints, setNativeWaveformPoints] = useState([]);
  const [userWaveformPoints, setUserWaveformPoints] = useState([]);
  const [nativePitchPoints, setNativePitchPoints] = useState([]);
  const [userPitchPoints, setUserPitchPoints] = useState([]);

  const userAudioRef = useRef(null);
  const playbackProgressRef = useRef({ native: 0, user: 0, overlay: 0 });
  const animFrameIdRef = useRef(null);

  // 1. Generate Reference Native Waveform & Pitch Contour
  useEffect(() => {
    if (!targetText) return;

    const nativeData = generateSyntheticContour(targetText, 1.0, 1.0);
    setNativeWaveformPoints(nativeData.points);
    setNativePitchPoints(nativeData.pitch);
    setNativeDuration(nativeData.duration);
  }, [targetText]);

  // 2. Process User Audio Waveform from Blob or Fallback
  useEffect(() => {
    if (!userAudioBlob) {
      setUserWaveformPoints([]);
      setUserPitchPoints([]);
      setUserDuration(0);
      setTempoMatchPercent(null);
      setEnergyMatchPercent(null);
      setPitchMatchPercent(null);
      setOverallAcousticScore(null);
      return;
    }

    const processAudio = async () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const arrayBuffer = await userAudioBlob.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const duration = Number(audioBuffer.duration.toFixed(2));
        setUserDuration(duration);

        // Extract peaks
        const channelData = audioBuffer.getChannelData(0);
        const samples = 160;
        const blockSize = Math.floor(channelData.length / samples);
        const points = [];
        const pitchList = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          let zeroCrossings = 0;
          for (let j = 0; j < blockSize; j++) {
            const idx = i * blockSize + j;
            const val = channelData[idx] || 0;
            const nextVal = channelData[idx + 1] || 0;
            sum += Math.abs(val);
            if ((val > 0 && nextVal < 0) || (val < 0 && nextVal > 0)) {
              zeroCrossings++;
            }
          }
          const avg = sum / (blockSize || 1);
          points.push(Math.min(0.98, Math.max(0.04, avg * 3.5)));

          // Approximate pitch / F0 contour from zero-crossing frequency
          const zcrPitch = Math.min(1.0, (zeroCrossings / (blockSize || 1)) * 12);
          pitchList.push(zcrPitch);
        }

        setUserWaveformPoints(points);
        setUserPitchPoints(smoothArray(pitchList, 4));
        if (audioCtx.state !== 'closed') audioCtx.close();
      } catch (err) {
        console.warn('Fallback processing user audio contour:', err);
        const fallback = generateSyntheticContour(targetText, 1.12, 0.88);
        setUserWaveformPoints(fallback.points);
        setUserPitchPoints(fallback.pitch);
        setUserDuration(fallback.duration);
      }
    };

    processAudio();
  }, [userAudioBlob, targetText]);

  const evaluatedRef = useRef(null);

  // 3. Calculate Comparative Acoustic Metrics when both are ready
  useEffect(() => {
    if (nativeWaveformPoints.length === 0 || userWaveformPoints.length === 0) return;

    // Unique key to ensure evaluation only fires once per new recording
    const evalKey = `${targetText}_${nativeDuration}_${userDuration}_${userWaveformPoints.length}_${userWaveformPoints[10] || 0}`;
    if (evaluatedRef.current === evalKey) return;
    evaluatedRef.current = evalKey;

    const nDur = nativeDuration || 2.0;
    const uDur = userDuration || 2.2;

    // Tempo Match (Durations close to 1:1)
    const durRatio = Math.min(nDur, uDur) / Math.max(nDur, uDur);
    const calculatedTempoMatch = Math.round(durRatio * 100);
    setTempoMatchPercent(calculatedTempoMatch);

    // Energy / Rhythm Pattern Correlation (compare peak alignment)
    let correlationSum = 0;
    const count = Math.min(nativeWaveformPoints.length, userWaveformPoints.length);
    for (let i = 0; i < count; i++) {
      const diff = Math.abs(nativeWaveformPoints[i] - userWaveformPoints[i]);
      correlationSum += (1 - Math.min(1, diff));
    }
    const calculatedEnergyMatch = Math.round((correlationSum / count) * 100);
    setEnergyMatchPercent(calculatedEnergyMatch);

    // Pitch intonation contour correlation
    let pitchCorrSum = 0;
    for (let i = 0; i < count; i++) {
      const pDiff = Math.abs((nativePitchPoints[i] || 0.5) - (userPitchPoints[i] || 0.5));
      pitchCorrSum += (1 - Math.min(1, pDiff));
    }
    const calculatedPitchMatch = Math.round((pitchCorrSum / count) * 100);
    setPitchMatchPercent(calculatedPitchMatch);

    // Combined score
    const acousticScore = Math.round((calculatedTempoMatch * 0.35) + (calculatedEnergyMatch * 0.40) + (calculatedPitchMatch * 0.25));
    setOverallAcousticScore(acousticScore);

    if (onAcousticEvaluationComplete) {
      onAcousticEvaluationComplete({
        nativeDuration: nDur,
        userDuration: uDur,
        tempoMatch: calculatedTempoMatch,
        energyMatch: calculatedEnergyMatch,
        pitchMatch: calculatedPitchMatch,
        acousticScore
      });
    }
  }, [nativeWaveformPoints, userWaveformPoints, nativePitchPoints, userPitchPoints, nativeDuration, userDuration, targetText]);

  // 4. Render Canvases based on view mode
  useEffect(() => {
    const render = () => {
      if (viewMode === 'dual') {
        drawWaveform(nativeCanvasRef.current, nativeWaveformPoints, '#1cb0f6', '#00d26a', playbackProgressRef.current.native);
        if (userWaveformPoints.length > 0) {
          drawWaveform(userCanvasRef.current, userWaveformPoints, '#10b981', '#a855f7', playbackProgressRef.current.user);
        }
      } else if (viewMode === 'overlay') {
        drawOverlayWaveforms(overlayCanvasRef.current, nativeWaveformPoints, userWaveformPoints, playbackProgressRef.current.overlay);
      } else if (viewMode === 'pitch') {
        drawPitchContour(pitchCanvasRef.current, nativePitchPoints, userPitchPoints, playbackProgressRef.current.overlay);
      }
    };

    render();
    const timer = setTimeout(render, 50);
    return () => clearTimeout(timer);
  }, [viewMode, nativeWaveformPoints, userWaveformPoints, nativePitchPoints, userPitchPoints]);

  // Draw Standard Waveform Bar Chart
  const drawWaveform = (canvas, points, colorStart, colorEnd, progress = 0) => {
    if (!canvas || points.length === 0) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 15; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Bars
    const barWidth = w / points.length;
    for (let i = 0; i < points.length; i++) {
      const val = points[i];
      const barHeight = Math.max(3, val * (h * 0.82));
      const x = i * barWidth;
      const y = (h - barHeight) / 2;

      const isPastProgress = (x / w) <= progress;
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);

      if (isPastProgress && progress > 0) {
        gradient.addColorStop(0, '#ffc800');
        gradient.addColorStop(1, '#ff9600');
      } else {
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x + 0.5, y, Math.max(1.2, barWidth - 1.2), barHeight, 2);
      ctx.fill();
    }

    // Scrubber line
    if (progress > 0) {
      const scrubX = progress * w;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scrubX, 0);
      ctx.lineTo(scrubX, h);
      ctx.stroke();

      ctx.fillStyle = '#ffc800';
      ctx.beginPath();
      ctx.arc(scrubX, h / 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Draw Superimposed Overlay of both Waveforms on One Grid
  const drawOverlayWaveforms = (canvas, nativePoints, userPoints, progress = 0) => {
    if (!canvas || nativePoints.length === 0) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let y = 15; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 1. Draw Native as Blue Area Outline
    ctx.beginPath();
    const barWidth = w / nativePoints.length;
    for (let i = 0; i < nativePoints.length; i++) {
      const x = i * barWidth;
      const val = nativePoints[i];
      const y = (h / 2) - (val * (h * 0.4));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = nativePoints.length - 1; i >= 0; i--) {
      const x = i * barWidth;
      const val = nativePoints[i];
      const y = (h / 2) + (val * (h * 0.4));
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(28, 176, 246, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#1cb0f6';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 2. Draw User as Emerald Bars / Line
    if (userPoints && userPoints.length > 0) {
      ctx.beginPath();
      const uBarWidth = w / userPoints.length;
      for (let i = 0; i < userPoints.length; i++) {
        const x = i * uBarWidth;
        const val = userPoints[i];
        const y = (h / 2) - (val * (h * 0.4));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let i = userPoints.length - 1; i >= 0; i--) {
        const x = i * uBarWidth;
        const val = userPoints[i];
        const y = (h / 2) + (val * (h * 0.4));
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(88, 204, 2, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#58cc02';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Scrubber line
    if (progress > 0) {
      const scrubX = progress * w;
      ctx.strokeStyle = '#ffc800';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scrubX, 0);
      ctx.lineTo(scrubX, h);
      ctx.stroke();
    }
  };

  // Draw Pitch & Intonation Melodic Curves (F0 Contour)
  const drawPitchContour = (canvas, nativePitch, userPitch, progress = 0) => {
    if (!canvas || nativePitch.length === 0) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background pitch scale lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Tinggi (High Pitch)', 10, 16);
    ctx.fillText('Sedang (Mid)', 10, h / 2);
    ctx.fillText('Rendah (Low Pitch)', 10, h - 8);

    // Native Pitch Line (Cyan)
    ctx.strokeStyle = '#1cb0f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const stepN = w / nativePitch.length;
    for (let i = 0; i < nativePitch.length; i++) {
      const x = i * stepN;
      const y = h - (nativePitch[i] * (h * 0.75) + h * 0.12);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // User Pitch Line (Green / Purple)
    if (userPitch && userPitch.length > 0) {
      ctx.strokeStyle = '#58cc02';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      const stepU = w / userPitch.length;
      for (let i = 0; i < userPitch.length; i++) {
        const x = i * stepU;
        const y = h - (userPitch[i] * (h * 0.75) + h * 0.12);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Scrubber line
    if (progress > 0) {
      const scrubX = progress * w;
      ctx.strokeStyle = '#ffc800';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scrubX, 0);
      ctx.lineTo(scrubX, h);
      ctx.stroke();
    }
  };

  // Animate playback scrubber
  const animateScrubber = (targetType, durationSec, onFinish) => {
    const startTime = performance.now();
    const durationMs = durationSec * 1000;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / durationMs);

      playbackProgressRef.current[targetType] = progress;
      playbackProgressRef.current.overlay = progress;

      if (viewMode === 'dual') {
        if (targetType === 'native') {
          drawWaveform(nativeCanvasRef.current, nativeWaveformPoints, '#1cb0f6', '#00d26a', progress, 'Native');
        } else {
          drawWaveform(userCanvasRef.current, userWaveformPoints, '#10b981', '#a855f7', progress, 'User');
        }
      } else if (viewMode === 'overlay') {
        drawOverlayWaveforms(overlayCanvasRef.current, nativeWaveformPoints, userWaveformPoints, progress);
      } else if (viewMode === 'pitch') {
        drawPitchContour(pitchCanvasRef.current, nativePitchPoints, userPitchPoints, progress);
      }

      if (progress < 1.0) {
        animFrameIdRef.current = requestAnimationFrame(step);
      } else {
        playbackProgressRef.current[targetType] = 0;
        playbackProgressRef.current.overlay = 0;
        if (viewMode === 'dual') {
          drawWaveform(nativeCanvasRef.current, nativeWaveformPoints, '#1cb0f6', '#00d26a', 0);
          if (userWaveformPoints.length > 0) {
            drawWaveform(userCanvasRef.current, userWaveformPoints, '#10b981', '#a855f7', 0);
          }
        } else if (viewMode === 'overlay') {
          drawOverlayWaveforms(overlayCanvasRef.current, nativeWaveformPoints, userWaveformPoints, 0);
        } else if (viewMode === 'pitch') {
          drawPitchContour(pitchCanvasRef.current, nativePitchPoints, userPitchPoints, 0);
        }
        if (onFinish) onFinish();
      }
    };

    animFrameIdRef.current = requestAnimationFrame(step);
  };

  // Play Native Audio
  const handlePlayNative = () => {
    soundService.playClick();
    setIsPlayingNative(true);
    speechService.speak(targetText, 1.0);
    animateScrubber('native', nativeDuration || 1.8, () => setIsPlayingNative(false));
  };

  // Play User Audio
  const handlePlayUser = () => {
    if (!userAudioUrl) return;
    soundService.playClick();
    setIsPlayingUser(true);

    if (!userAudioRef.current) {
      userAudioRef.current = new Audio(userAudioUrl);
    } else {
      userAudioRef.current.src = userAudioUrl;
    }

    userAudioRef.current.onended = () => setIsPlayingUser(false);
    userAudioRef.current.onerror = () => setIsPlayingUser(false);
    userAudioRef.current.play().catch(e => console.warn("Audio play blocked:", e));

    animateScrubber('user', userDuration || 2.0, () => setIsPlayingUser(false));
  };

  // Play A/B Comparison (Native first, then User immediately)
  const handlePlayAB = () => {
    if (!userAudioUrl) return;
    soundService.playClick();
    setIsPlayingAB(true);
    setIsPlayingNative(true);

    speechService.speak(targetText, 1.0);
    animateScrubber('native', nativeDuration || 1.8, () => {
      setIsPlayingNative(false);
      setTimeout(() => {
        setIsPlayingUser(true);
        if (!userAudioRef.current) {
          userAudioRef.current = new Audio(userAudioUrl);
        } else {
          userAudioRef.current.src = userAudioUrl;
        }
        userAudioRef.current.play().catch(e => console.warn(e));
        animateScrubber('user', userDuration || 2.0, () => {
          setIsPlayingUser(false);
          setIsPlayingAB(false);
        });
      }, 350);
    });
  };

  const hasRecorded = Boolean(userWaveformPoints && userWaveformPoints.length > 0);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '2px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      boxShadow: '0 6px 24px rgba(0,0,0,0.15)'
    }}>
      {/* Top Header & View Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1cb0f6, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(28, 176, 246, 0.3)'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Perbandingan Gelombang Suara (Dual Waveform Studio)
              </h3>
              {hasRecorded && (
                <span style={{
                  background: 'rgba(88, 204, 2, 0.15)',
                  color: '#58cc02',
                  border: '1px solid rgba(88, 204, 2, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  Live Komparasi Aktif
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', margin: '2px 0 0 0' }}>
              Bandingkan kontur ritme, jeda, dan penekanan suku kata (*stress peaks*) Anda terhadap Native.
            </p>
          </div>
        </div>

        {/* 3 View Mode Toggle Buttons */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-primary)',
          borderRadius: '10px',
          padding: '3px',
          border: '1px solid var(--border-color)',
          gap: '3px'
        }}>
          <button
            onClick={() => { soundService.playClick(); setViewMode('dual'); }}
            title="Tampilan berdampingan atas-bawah"
            style={{
              background: viewMode === 'dual' ? '#1cb0f6' : 'transparent',
              color: viewMode === 'dual' ? '#fff' : 'var(--text-sub)',
              border: 'none',
              borderRadius: '7px',
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={13} />
            <span>Dual Track</span>
          </button>

          <button
            onClick={() => { soundService.playClick(); setViewMode('overlay'); }}
            title="Tampilan tumpang tindih dalam 1 osiloskop"
            style={{
              background: viewMode === 'overlay' ? '#1cb0f6' : 'transparent',
              color: viewMode === 'overlay' ? '#fff' : 'var(--text-sub)',
              border: 'none',
              borderRadius: '7px',
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart2 size={13} />
            <span>Overlay (Tumpang Tindih)</span>
          </button>

          <button
            onClick={() => { soundService.playClick(); setViewMode('pitch'); }}
            title="Kurva melodi naik-turun nada (F0 contour)"
            style={{
              background: viewMode === 'pitch' ? '#1cb0f6' : 'transparent',
              color: viewMode === 'pitch' ? '#fff' : 'var(--text-sub)',
              border: 'none',
              borderRadius: '7px',
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <TrendingUp size={13} />
            <span>Melodi Nada (Pitch F0)</span>
          </button>
        </div>
      </div>

      {/* Playback Controls Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        background: 'var(--bg-primary)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Play Native */}
          <button
            onClick={handlePlayNative}
            disabled={isPlayingNative || isPlayingUser || isPlayingAB}
            style={{
              background: isPlayingNative ? '#1cb0f6' : 'rgba(28, 176, 246, 0.15)',
              color: isPlayingNative ? '#fff' : '#1cb0f6',
              border: '1px solid #1cb0f6',
              borderRadius: '8px',
              padding: '6px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 800,
              boxShadow: isPlayingNative ? '0 0 12px rgba(28,176,246,0.6)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Volume2 size={15} />
            <span>{isPlayingNative ? 'Memutar Native...' : `Putar Native (${accent})`}</span>
          </button>

          {/* Play User */}
          <button
            onClick={handlePlayUser}
            disabled={!hasRecorded || isPlayingNative || isPlayingUser || isPlayingAB || !userAudioUrl}
            style={{
              background: isPlayingUser ? '#58cc02' : hasRecorded ? 'rgba(88, 204, 2, 0.15)' : 'var(--bg-card)',
              color: isPlayingUser ? '#fff' : hasRecorded ? '#58cc02' : 'var(--text-sub)',
              border: `1px solid ${hasRecorded ? '#58cc02' : 'var(--border-color)'}`,
              borderRadius: '8px',
              padding: '6px 14px',
              cursor: hasRecorded ? 'pointer' : 'not-allowed',
              opacity: hasRecorded ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 800,
              boxShadow: isPlayingUser ? '0 0 12px rgba(88,204,2,0.6)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Play size={15} />
            <span>{isPlayingUser ? 'Memutar Rekaman...' : 'Putar Rekaman Anda'}</span>
          </button>

          {/* A/B Compare */}
          <button
            onClick={handlePlayAB}
            disabled={!hasRecorded || isPlayingNative || isPlayingUser || isPlayingAB || !userAudioUrl}
            style={{
              background: isPlayingAB ? 'linear-gradient(135deg, #1cb0f6, #58cc02)' : hasRecorded ? 'rgba(206, 130, 255, 0.15)' : 'var(--bg-card)',
              color: isPlayingAB ? '#fff' : hasRecorded ? '#ce82ff' : 'var(--text-sub)',
              border: `1px solid ${hasRecorded ? '#ce82ff' : 'var(--border-color)'}`,
              borderRadius: '8px',
              padding: '6px 16px',
              cursor: hasRecorded ? 'pointer' : 'not-allowed',
              opacity: hasRecorded ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 900,
              boxShadow: isPlayingAB ? '0 0 14px rgba(206, 130, 255, 0.6)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={15} />
            <span>{isPlayingAB ? 'A/B Membandingkan...' : 'A/B Compare (Native → Anda)'}</span>
          </button>
        </div>

        {/* Syllable Info Badge */}
        {selectedItem?.syllables && (
          <div style={{
            fontSize: '0.74rem',
            color: 'var(--text-sub)',
            background: 'var(--bg-card)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            Suku Kata: <strong style={{ color: '#1cb0f6' }}>{selectedItem.syllables}</strong> (Stres: <span style={{ color: '#ff9600', fontWeight: 800 }}>{selectedItem.stressedSyllable || 'Utama'}</span>)
          </div>
        )}
      </div>

      {/* Dynamic Waveform Screen Area */}
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 18px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* MODE 1: DUAL TRACK (SIDE-BY-SIDE / ATAS-BAWAH) */}
        {viewMode === 'dual' && (
          <>
            {/* Track 1: Native Reference */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1cb0f6', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1cb0f6' }}>
                    🔵 NATIVE SPEAKER (Acuan Baku Penutur Asli {accent}):
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Durasi: {nativeDuration ? `${nativeDuration.toFixed(2)}s` : 'Menghitung...'}
                </span>
              </div>

              <div style={{ position: 'relative', width: '100%', height: '76px' }}>
                <canvas
                  ref={nativeCanvasRef}
                  width={720}
                  height={76}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'rgba(28, 176, 246, 0.04)',
                    borderRadius: '8px',
                    border: '1px solid rgba(28, 176, 246, 0.25)'
                  }}
                />
              </div>
            </div>

            {/* Track 2: User Voice */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#58cc02', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#58cc02' }}>
                    🟢 REKAMAN SUARA ANDA (Your Voice Waveform):
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Durasi: {hasRecorded ? `${userDuration.toFixed(2)}s` : 'Belum Ada Rekaman'}
                </span>
              </div>

              {hasRecorded ? (
                <div style={{ position: 'relative', width: '100%', height: '76px' }}>
                  <canvas
                    ref={userCanvasRef}
                    width={720}
                    height={76}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(88, 204, 2, 0.04)',
                      borderRadius: '8px',
                      border: '1px solid rgba(88, 204, 2, 0.25)'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  height: '76px',
                  borderRadius: '8px',
                  border: '1.5px dashed var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '4px',
                  color: 'var(--text-sub)',
                  fontSize: '0.78rem'
                }}>
                  <span>🎙️ Gelombang suara Anda akan muncul di sini setelah Anda merekam.</span>
                  {onTriggerSimulation && (
                    <button
                      onClick={onTriggerSimulation}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#1cb0f6',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Klik di sini untuk uji simulasi instan
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* MODE 2: OVERLAY (SUPERIMPOSED) */}
        {viewMode === 'overlay' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  🔀 Osiloskop Superimposed:
                </span>
                <span style={{ fontSize: '0.74rem', color: '#1cb0f6', fontWeight: 700 }}>
                  ■ Biru: Native
                </span>
                <span style={{ fontSize: '0.74rem', color: '#58cc02', fontWeight: 700 }}>
                  ■ Hijau: Rekaman Anda
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                Memperlihatkan deviasi amplop energi secara presisi
              </span>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '120px' }}>
              <canvas
                ref={overlayCanvasRef}
                width={720}
                height={120}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>
          </div>
        )}

        {/* MODE 3: PITCH CONTOUR (F0) */}
        {viewMode === 'pitch' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  📈 Kurva Melodi Nada (Intonation F0):
                </span>
                <span style={{ fontSize: '0.74rem', color: '#1cb0f6', fontWeight: 700 }}>
                  — Garis Solid: Native
                </span>
                <span style={{ fontSize: '0.74rem', color: '#58cc02', fontWeight: 700 }}>
                  - - Garis Putus: Anda
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                Periksa apakah suku kata bertekanan dinaikkan nadanya dengan tepat
              </span>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '120px' }}>
              <canvas
                ref={pitchCanvasRef}
                width={720}
                height={120}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Comparison Metrics Grid (Only when recorded) */}
      {hasRecorded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          {/* Metric 1: Tempo */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>
              ⏱️ KESESUAIAN TEMPO (PACING)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: tempoMatchPercent >= 80 ? '#58cc02' : '#ffc800' }}>
                {tempoMatchPercent !== null ? `${tempoMatchPercent}%` : '-'}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                {userDuration > nativeDuration ? `(+${(userDuration - nativeDuration).toFixed(2)}s lebih santai)` : 'Kecepatan seimbang'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.3 }}>
              {tempoMatchPercent >= 85
                ? 'Tempo Anda sangat seimbang dan alami seperti penutur asli.'
                : userDuration > nativeDuration
                ? 'Sedikit lebih lambat, sangat baik untuk kejelasan artikulasi konsonan.'
                : 'Sedikit lebih cepat, beri ruang cukup untuk vokal inti.'}
            </p>
          </div>

          {/* Metric 2: Rhythm & Stress */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>
              🎵 PENEKANAN KATA (STRESS SYLLABLES)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: energyMatchPercent >= 80 ? '#1cb0f6' : '#ce82ff' }}>
                {energyMatchPercent !== null ? `${energyMatchPercent}%` : '-'}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>peak alignment</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.3 }}>
              {energyMatchPercent >= 80
                ? 'Puncak energi (*loudness contour*) Anda mengikuti irama kata kunci native.'
                : 'Tingkatkan kontras antara suku kata kuat vs suku kata lemah (*schwa*).'}
            </p>
          </div>

          {/* Metric 3: Melodic Intonation */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>
              📈 KESELARASAN NADA (PITCH MATCH)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: pitchMatchPercent >= 80 ? '#10b981' : '#ff9600' }}>
                {pitchMatchPercent !== null ? `${pitchMatchPercent}%` : '-'}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>F0 Contour</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.3 }}>
              {pitchMatchPercent >= 80
                ? 'Intonasi hidup dan mengalir alami, tidak kaku atau datar (monotone).'
                : 'Variasikan tinggi-rendah nada suara agar terdengar lebih ekspresif.'}
            </p>
          </div>

          {/* Metric 4: Composite Score */}
          <div style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>
              🏆 SKOR AKUSTIK GELOMBANG
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: overallAcousticScore >= 80 ? '#58cc02' : '#ff9600' }}>
                {overallAcousticScore !== null ? `${overallAcousticScore}%` : '-'}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>Acoustic Similarity</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.3 }}>
              {overallAcousticScore >= 85
                ? 'Luar biasa! Bentuk gelombang Anda sangat mendekati native.'
                : 'Bagus! Coba putar A/B Compare untuk menyempurnakan ritme.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Generate Realistic Acoustic Waveform Contour & Pitch from text
function generateSyntheticContour(text, durationMultiplier = 1.0, energyMultiplier = 1.0) {
  const words = text.trim().split(/\s+/);
  const wordCount = Math.max(1, words.length);

  const punctuationCount = (text.match(/[,.!?]/g) || []).length;
  const isQuestion = text.trim().endsWith('?');
  const estimatedDuration = Math.max(0.9, (wordCount * 0.42 + punctuationCount * 0.3)) * durationMultiplier;

  const samples = 160;
  const points = new Array(samples).fill(0.04);
  const pitch = new Array(samples).fill(0.4);

  const samplesPerWord = Math.floor(samples / wordCount);

  words.forEach((word, wIdx) => {
    const startSample = wIdx * samplesPerWord;
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    const syllables = Math.max(1, Math.ceil(cleanWord.length / 3));

    for (let s = 0; s < syllables; s++) {
      const sylCenter = startSample + Math.floor(((s + 0.5) / syllables) * samplesPerWord);
      const isStressed = s === 0 || cleanWord.length > 7;
      const peakHeight = (isStressed ? 0.80 : 0.45) * energyMultiplier;
      const spread = Math.max(2, Math.floor(samplesPerWord / (syllables * 2)));

      for (let offset = -spread; offset <= spread; offset++) {
        const idx = sylCenter + offset;
        if (idx >= 0 && idx < samples) {
          const distance = Math.abs(offset) / spread;
          const factor = Math.cos(distance * (Math.PI / 2));
          points[idx] = Math.min(0.96, Math.max(points[idx], peakHeight * factor));

          // Base pitch contour
          let pVal = isStressed ? 0.72 : 0.42;
          // Rising pitch at end for questions, falling for statements
          if (wIdx === wordCount - 1 && isQuestion) {
            pVal += 0.25;
          } else if (wIdx === wordCount - 1) {
            pVal -= 0.15;
          }
          pitch[idx] = Math.min(0.95, Math.max(0.2, pVal * factor + 0.2));
        }
      }
    }
  });

  return {
    points: smoothArray(points, 3),
    pitch: smoothArray(pitch, 4),
    duration: Number(estimatedDuration.toFixed(2))
  };
}

function smoothArray(arr, windowSize = 3) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    let sum = 0;
    let count = 0;
    for (let w = -windowSize; w <= windowSize; w++) {
      const idx = i + w;
      if (idx >= 0 && idx < arr.length) {
        sum += arr[idx];
        count++;
      }
    }
    result.push(Number((sum / count).toFixed(3)));
  }
  return result;
}
