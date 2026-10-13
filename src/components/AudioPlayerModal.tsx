import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  FastForward, 
  RotateCcw, 
  Download, 
  X, 
  Headphones, 
  AlertCircle
} from 'lucide-react';
import { NormalizedOrder } from '../services/orderMapper';
import { audioEngine } from '../utils/audioSynthesizer';

interface AudioPlayerModalProps {
  order: NormalizedOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(40);
  const [rate, setRate] = useState<number>(1.0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && order) {
      setLoadError(null);
      setDuration(order.callDurationSeconds || 40);
      setCurrentTime(0);
      setRate(1.0);

      const cleanUrl = (order.recordingUrl || '').replace(/^[\r\n\s]+|[\r\n\s]+$/g, '').trim();

      if (cleanUrl) {
        setIsPlaying(true);
        audioEngine.playUrl(
          order.id,
          cleanUrl,
          1.0,
          order.callDurationSeconds || 40,
          (time, dur) => {
            setCurrentTime(time);
            if (dur && !isNaN(dur) && dur > 0) {
              setDuration(dur);
            }
          },
          () => {
            setIsPlaying(false);
            setCurrentTime(0);
          },
          (err) => {
            setLoadError(err);
            setIsPlaying(false);
          }
        );
      } else {
        setIsPlaying(false);
      }
    } else {
      audioEngine.stop();
      setIsPlaying(false);
    }

    return () => {
      audioEngine.stop();
    };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      if (!order.recordingUrl) return;
      setIsPlaying(true);
      audioEngine.playUrl(
        order.id,
        order.recordingUrl,
        rate,
        duration,
        (time, dur) => {
          setCurrentTime(time);
          if (dur && !isNaN(dur) && dur > 0) {
            setDuration(dur);
          }
        },
        () => {
          setIsPlaying(false);
          setCurrentTime(0);
        },
        (err) => {
          setLoadError(err);
          setIsPlaying(false);
        }
      );
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    audioEngine.seek(targetTime);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    audioEngine.setRate(newRate);
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audio-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-[#2563eb] rounded-xl">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 id="audio-modal-title" className="text-sm font-bold text-slate-900">
                Call Recording Player
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Order {order.orderNumber.replace(/^#+/, '')} · {order.customerName} ({order.phone || 'No phone'})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioEngine.stop();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Metadata banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span className="font-medium text-slate-500">Product:</span>
              <span className="font-semibold text-slate-800 text-right">{order.product}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-medium text-slate-500">Call Disposition:</span>
              <span className="font-semibold text-slate-800">{order.callDisposition}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-medium text-slate-500">Duration:</span>
              <span className="font-mono text-slate-800">{order.callDuration}</span>
            </div>
          </div>

          {loadError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Audio stream loading issue. Open direct link:</span>
              </div>
              {order.recordingUrl && (
                <a
                  href={order.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline shrink-0 text-blue-600"
                >
                  Direct Link
                </a>
              )}
            </div>
          )}

          {/* Clean Static Playback Progress Panel (No Heavy Animation) */}
          <div className="bg-slate-900 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-white font-semibold">{formatSeconds(currentTime)}</span>
              <span className="text-slate-400 font-sans text-xs">
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
              <span className="text-slate-400">{formatSeconds(duration)}</span>
            </div>

            {/* Static Clean Progress Bar */}
            <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#2563eb] rounded-full transition-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Native Slider for Seeking */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 40}
              step="0.25"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-1">
            {/* Speed toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              {[1.0, 1.25, 1.5, 2.0].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRateChange(r)}
                  className={`px-2 py-1 text-xs font-mono rounded font-medium transition-colors ${
                    rate === r ? 'bg-white text-[#2563eb] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>

            {/* Play / Pause buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentTime(0);
                  audioEngine.seek(0);
                }}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={!order.recordingUrl}
                className="w-12 h-12 flex items-center justify-center bg-[#2563eb] hover:bg-blue-700 text-white rounded-full shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  const newTime = Math.min(duration, currentTime + 10);
                  setCurrentTime(newTime);
                  audioEngine.seek(newTime);
                }}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                title="Forward 10s"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume indicator */}
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="font-mono">100%</span>
            </div>
          </div>

          {/* Recording URL direct link */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="truncate max-w-[280px]">
              <span className="font-medium text-slate-600">Recording URL:</span>{' '}
              <span className="font-mono text-slate-500 truncate">
                {order.recordingUrl || '—'}
              </span>
            </div>
            {order.recordingUrl && (
              <a
                href={order.recordingUrl}
                target="_blank"
                rel="noreferrer"
                download={`call_${order.id}.wav`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#2563eb] hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors font-medium shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Audio</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
