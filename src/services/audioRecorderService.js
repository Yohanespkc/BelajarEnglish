// MediaRecorder helper service for capturing user microphone audio for playback comparison

class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioStream = null;
  }

  async startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Mikrofon tidak didukung pada browser ini.");
    }

    this.audioChunks = [];
    this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.audioStream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    return this.audioStream;
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Stop all audio tracks
        if (this.audioStream) {
          this.audioStream.getTracks().forEach((track) => track.stop());
        }

        resolve({ audioBlob, audioUrl });
      };

      this.mediaRecorder.stop();
    });
  }
}

export const audioRecorderService = new AudioRecorderService();
