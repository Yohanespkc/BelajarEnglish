// Utility to generate valid 16-bit Mono PCM WAV Blobs for audio playback and acoustic simulation

export function createValidWavBlob(durationSec = 1.8, sampleRate = 22050, f0 = 150, syllables = 2) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true); // ChunkSize
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true); // Subchunk2Size

  // Generate harmonic speech-like audio signal
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // Envelope modulated by syllables
    const sylFreq = syllables / durationSec;
    const envelope = Math.max(0.05, Math.sin(Math.PI * t * sylFreq) ** 2) * Math.min(1.0, t * 8) * Math.min(1.0, (durationSec - t) * 8);

    // Harmonic vocal sound (Fundamental F0 + Formants)
    const harmonic1 = Math.sin(2 * Math.PI * f0 * t);
    const harmonic2 = 0.5 * Math.sin(2 * Math.PI * (f0 * 2.1) * t);
    const harmonic3 = 0.25 * Math.sin(2 * Math.PI * (f0 * 3.4) * t);
    const noise = (Math.random() * 2 - 1) * 0.08;

    const sample = (harmonic1 + harmonic2 + harmonic3 + noise) * envelope * 0.55;
    
    // Convert to 16-bit integer (-32768 to 32767)
    const clamped = Math.max(-1, Math.min(1, sample));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
