import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react';

const AudioRecorder = ({ onAudioUrl, existingAudioUrl, entryId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(existingAudioUrl || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    setAudioUrl(existingAudioUrl || '');
  }, [existingAudioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // In a real app, you'd upload the blob to a server/cloud storage
        // and get back a permanent URL
        if (onAudioUrl) {
          onAudioUrl(url);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(Math.floor(audioRef.current.duration));
    }
  };

  const deleteRecording = () => {
    setAudioUrl('');
    setCurrentTime(0);
    setDuration(0);
    if (onAudioUrl) {
      onAudioUrl('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Audio recording not supported
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {!audioUrl ? (
        // Recording controls
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`
              p-3 rounded-full transition-all
              ${isRecording ? 'animate-pulse' : 'hover:shadow-md'}
            `}
            style={{
              background: isRecording ? '#ef4444' : 'var(--bg-parchment)',
              color: isRecording ? 'white' : 'var(--text-secondary)',
              border: isRecording ? 'none' : '1px solid var(--border-light)'
            }}
          >
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
          </button>

          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                {formatTime(duration)}
              </span>
            </div>
          )}

          {!isRecording && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Record audio memo
            </span>
          )}
        </div>
      ) : (
        // Playback controls
        <div className="flex items-center gap-3 flex-1">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={handleLoadedMetadata}
          />

          <button
            type="button"
            onClick={togglePlayback}
            className="p-2 rounded-full transition-colors"
            style={{ background: 'var(--app-accent)', color: 'white' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Progress bar */}
          <div className="flex-1">
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-parchment)' }}
            >
              <div
                className="h-full transition-all"
                style={{
                  background: 'var(--app-accent)',
                  width: duration ? `${(currentTime / duration) * 100}%` : '0%'
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatTime(currentTime)}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={deleteRecording}
            className="p-2 rounded-lg transition-colors hover:bg-red-50"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
