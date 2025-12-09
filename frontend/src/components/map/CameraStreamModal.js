import React, { useState, useEffect, useRef } from 'react';
import { FaVideo, FaTimes, FaRedo, FaExclamationTriangle } from 'react-icons/fa';
import './CameraStreamModal.css';

/**
 * CameraStreamModal Component
 * Displays live camera feed using HLS streaming with Video.js or iframe fallback
 * Supports go2rtc streaming backend
 */
const CameraStreamModal = ({ isOpen, onClose, camera }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamInfo, setStreamInfo] = useState('');
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hlsRef = useRef(null);
  const [useIframe, setUseIframe] = useState(true); // Start with iframe (more reliable)

  useEffect(() => {
    // Load Video.js and HLS.js scripts dynamically
    if (!window.videojs) {
      loadVideoJsScripts();
    }

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isOpen && camera) {
      setLoading(true);
      setError(null);
      
      // Wait for scripts to load, then initialize stream
      setTimeout(() => {
        initializeStream();
      }, 300);
    } else {
      cleanup();
    }
  }, [isOpen, camera]);

  const loadVideoJsScripts = () => {
    // Load Video.js CSS
    if (!document.getElementById('videojs-css')) {
      const vjsCSS = document.createElement('link');
      vjsCSS.id = 'videojs-css';
      vjsCSS.rel = 'stylesheet';
      vjsCSS.href = 'https://vjs.zencdn.net/8.6.1/video-js.css';
      document.head.appendChild(vjsCSS);
    }

    // Load Video.js Script
    if (!document.getElementById('videojs-script')) {
      const vjsScript = document.createElement('script');
      vjsScript.id = 'videojs-script';
      vjsScript.src = 'https://vjs.zencdn.net/8.6.1/video.min.js';
      vjsScript.async = true;
      document.head.appendChild(vjsScript);
    }

    // Load HLS.js Script
    if (!document.getElementById('hls-script')) {
      const hlsScript = document.createElement('script');
      hlsScript.id = 'hls-script';
      hlsScript.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      hlsScript.async = true;
      document.head.appendChild(hlsScript);
    }
  };

  const getStreamUrls = () => {
    if (!camera) return null;

    // If camera has stream_url from backend, use it directly
    if (camera.stream_url && camera.stream_url.includes('http')) {
      // Check if it's already a go2rtc stream.html URL
      if (camera.stream_url.includes('stream.html?src=')) {
        const cameraId = camera.stream_url.split('src=')[1];
        const baseUrl = camera.stream_url.split('/stream.html')[0];
        
        return {
          hls: `${baseUrl}/api/streams/${cameraId}.m3u8`,
          iframe: camera.stream_url, // Use the exact URL from backend
          webrtc: `${baseUrl}/api/webrtc?src=${cameraId}`,
          go2rtc: `${baseUrl}/streams/${cameraId}`
        };
      }
      // If it's a go2rtc embed URL
      if (camera.stream_url.includes('/streams/')) {
        return {
          hls: camera.stream_url.replace('/streams/', '/api/streams/') + '.m3u8',
          iframe: camera.stream_url.replace('/streams/', '/stream.html?src='),
          webrtc: camera.stream_url.replace('/streams/', '/api/webrtc?src='),
          go2rtc: camera.stream_url
        };
      }
      // Otherwise use the stream_url as is
      return {
        hls: camera.stream_url,
        iframe: camera.stream_url,
        webrtc: camera.stream_url,
        go2rtc: camera.stream_url
      };
    }

    // Default: generate URLs from camera name
    const cameraId = camera.name;
    
    return {
      hls: `http://localhost:1984/api/streams/${cameraId}.m3u8`,
      iframe: `http://localhost:1984/stream.html?src=${cameraId}`,
      webrtc: `http://localhost:1984/api/webrtc?src=${cameraId}`,
      go2rtc: `http://localhost:1984/streams/${cameraId}`
    };
  };

  const initializeStream = () => {
    const urls = getStreamUrls();
    if (!urls) return;

    console.log('Stream URLs:', urls); // Debug log

    if (useIframe) {
      // Iframe - simpler and more reliable for go2rtc
      setTimeout(() => {
        setLoading(false);
        setStreamInfo('go2rtc Stream');
      }, 1500); // Give iframe time to load
    } else {
      // Try Video.js with HLS
      initializeVideoJsPlayer(urls.hls);
    }
  };

  const initializeVideoJsPlayer = (hlsUrl) => {
    // Wait for Video.js to be available
    const checkVideoJs = setInterval(() => {
      if (window.videojs && window.Hls && videoRef.current) {
        clearInterval(checkVideoJs);
        
        try {
          // Initialize Video.js player
          const player = window.videojs(videoRef.current, {
            autoplay: true,
            controls: true,
            responsive: true,
            fluid: false,
            preload: 'auto',
            liveui: true,
            html5: {
              vhs: {
                overrideNative: true
              },
              nativeAudioTracks: false,
              nativeVideoTracks: false
            }
          });

          playerRef.current = player;

          // Load HLS stream
          if (window.Hls.isSupported()) {
            const hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            hls.loadSource(hlsUrl);
            hls.attachMedia(videoRef.current);

            hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
              setLoading(false);
              videoRef.current.play().catch(err => {
                console.warn('Autoplay prevented:', err);
                setError('Click play to start the stream');
              });
              setStreamInfo('HLS Stream');
            });

            hls.on(window.Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                console.error('HLS Error:', data);
                setError(`Stream error: ${data.type}`);
                setLoading(false);
              }
            });

            hlsRef.current = hls;
          } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            videoRef.current.src = hlsUrl;
            videoRef.current.addEventListener('loadedmetadata', () => {
              setLoading(false);
              videoRef.current.play().catch(err => {
                console.warn('Autoplay prevented:', err);
              });
              setStreamInfo('HLS Stream (Native)');
            });
          } else {
            setError('HLS not supported in this browser');
            setLoading(false);
          }

          // Handle player errors
          player.on('error', () => {
            const playerError = player.error();
            setError(`Player error: ${playerError?.message || 'Unknown error'}`);
            setLoading(false);
          });

        } catch (err) {
          console.error('Video.js initialization error:', err);
          setError('Failed to initialize video player');
          setLoading(false);
        }
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkVideoJs);
      if (loading) {
        setError('Failed to load video player libraries');
        setLoading(false);
      }
    }, 5000);
  };

  const cleanup = () => {
    // Destroy HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Destroy Video.js player
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    setLoading(true);
    setError(null);
    setStreamInfo('');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    cleanup();
    setTimeout(() => {
      initializeStream();
    }, 500);
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  const urls = getStreamUrls();

  return (
    <div className="camera-stream-modal-overlay" onClick={handleClose}>
      <div className="camera-stream-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="camera-stream-header">
          <h3>
            <FaVideo className="me-2" />
            {camera?.name || 'Live Camera Feed'}
          </h3>
          <button className="camera-stream-close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="camera-stream-body">
          {/* Loading Spinner */}
          {loading && (
            <div className="camera-stream-loader">
              <div className="spinner"></div>
              <p>Connecting to camera...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="camera-stream-error">
              <FaExclamationTriangle className="error-icon" />
              <p>Failed to load camera stream</p>
              <small>{error}</small>
              <button className="retry-btn" onClick={handleRetry}>
                <FaRedo className="me-1" />
                Retry
              </button>
            </div>
          )}

          {/* Video Player */}
          {!useIframe && urls && (
            <div className={`video-container ${loading || error ? 'd-none' : ''}`}>
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered vjs-16-9"
                controls
                preload="auto"
              >
                <p className="vjs-no-js">
                  To view this video please enable JavaScript
                </p>
              </video>
            </div>
          )}

          {/* Iframe Fallback */}
          {useIframe && urls && (
            <div className={`iframe-container ${loading || error ? 'd-none' : ''}`}>
              <iframe
                src={urls.iframe}
                title="Camera Stream"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="camera-stream-footer">
          <div className="stream-status">
            <span className={`status-badge ${error ? 'error' : 'live'}`}>
              <span className="status-dot"></span>
              {error ? 'Error' : 'Live'}
            </span>
            {streamInfo && <small className="stream-info">{streamInfo}</small>}
          </div>
          <div className="stream-actions">
            <button className="toggle-mode-btn" onClick={() => setUseIframe(!useIframe)}>
              Switch to {useIframe ? 'Video Player' : 'Iframe'}
            </button>
            <button className="close-btn" onClick={handleClose}>
              <FaTimes className="me-1" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraStreamModal;
