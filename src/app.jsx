import React, { useState, useRef, useCallback } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import './app.css';

// Frame twibbon (ada di folder public)
const FRAME_URL = "/frame-diesnatalis.png";
const LOGO_URL = "/logo-diesnatalis.png";

// Ukuran canvas mengikuti ukuran asli frame (1080 x 1440) supaya tidak gepeng
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1440;

const App = () => {
  // --- STATE ---
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [copySuccess, setCopySuccess] = useState("Salin Caption");

  const editorRef = useRef(null);
  const lastPinchDist = useRef(null);

  // --- LOGIC DROPZONE ---
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setImage(acceptedFiles[0]);
      setScale(1.2);
      setRotate(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: !!image
  });

  // --- LOGIC ZOOM (MOUSE SCROLL) ---
  const handleWheel = (e) => {
    if (image) {
      e.preventDefault();
      const zoomSensitivity = 0.05;
      const delta = e.deltaY > 0 ? -zoomSensitivity : zoomSensitivity;
      const newScale = Math.min(Math.max(scale + delta, 1), 5);
      setScale(newScale);
    }
  };

  // --- LOGIC ZOOM (PINCH / CUBIT DI HP) ---
  const getDistance = (touch1, touch2) => {
    return Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      lastPinchDist.current = dist;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastPinchDist.current) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      const zoomFactor = dist / lastPinchDist.current;
      const newScale = Math.min(Math.max(scale * (zoomFactor), 1), 5);
      setScale(newScale);
      lastPinchDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastPinchDist.current = null;
  };

  // --- DOWNLOAD LOGIC ---
  const handleDownload = async () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const ctx = canvas.getContext('2d');

      const frameImg = new Image();
      frameImg.src = FRAME_URL;
      frameImg.crossOrigin = "anonymous";

      frameImg.onload = () => {
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = 'TWIBBON-DIESNATALIS-7.png';
        link.href = dataUrl;
        link.click();
      };
    }
  };

  // --- CAPTION LOGIC ---
  const captionText = `🕊️ I'm ready to celebrate Dies Natalis ke-7 SMK Telkom Sidoarjo! 🕊️\n\nHalo teman-teman 👋🏻\nPerkenalkan, saya [Nama kamu] dari [Kelas/Organisasi Kamu] turut merayakan dan mendoakan Dies Natalis ke-7 SMK Telkom Sidoarjo. Semoga sekolah kita semakin maju, berprestasi, dan terus mencetak generasi yang unggul dan berkarakter.\n\n🎉 Harapan untuk SMK Telkom Sidoarjo\n[Isi dengan harapan/doa kamu]\n\n"From Inspiration to Transformation"\nSelamat Dies Natalis ke-7 SMK Telkom Sidoarjo! 🎂\n\n@smktelkomsda @osis.smktelkomsda @mpk.smktelkomsda\n#DiesNatalisKe7 #DiesNatalisSMKTelkomSidoarjo #SMKTelkomSidoarjo`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopySuccess("Berhasil Disalin!");
      setTimeout(() => setCopySuccess("Salin Caption"), 3000);
    } catch (err) {
      setCopySuccess("Gagal Menyalin");
    }
  };

  return (
    <div className="app-container">
      <div className="main-wrapper">

        {/* KARTU EDITOR */}
        <div className="card twibbon-card">
          <img src={LOGO_URL} alt="Dies Natalis ke-7 SMK Telkom Sidoarjo" className="header-logo" />
          <h1>Twibbon Dies Natalis ke-7 SMK Telkom Sidoarjo</h1>
          <p className="subtitle">Cubit (Pinch) untuk Zoom, Geser untuk atur posisi.</p>

          {!image ? (
            <div {...getRootProps()} className={`dropzone-area ${isDragActive ? 'dropzone-active' : ''}`}>
              <input {...getInputProps()} />
              <span className="icon-upload">☁️</span>
              <p>Klik atau Tarik Foto ke Sini</p>
            </div>
          ) : (
            <div className="editor-container">
              {/* AREA INTERAKSI */}
              <div
                className="twibbon-wrapper"
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <AvatarEditor
                  ref={editorRef}
                  image={image}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  border={0}
                  scale={scale}
                  rotate={rotate}
                  style={{ background: '#fff', cursor: 'move' }}
                />
                <img src={FRAME_URL} alt="Frame" className="frame-overlay" />
              </div>

              {/* SLIDER CONTROLS */}
              <div className="controls">
                <div className="slider-group">
                    <span className="slider-label">🔍 Zoom</span>
                    <input
                      type="range"
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      min="1" max="5" step="0.05" value={scale}
                    />
                </div>
                <div className="slider-group">
                    <span className="slider-label">🔄 Putar</span>
                    <input
                      type="range"
                      onChange={(e) => setRotate(parseFloat(e.target.value))}
                      min="-180" max="180" step="1" value={rotate}
                    />
                </div>
                <button className="btn btn-ganti" onClick={() => setImage(null)}>
                  📂 Ganti Foto Lain
                </button>
              </div>

              <button className="btn btn-download" onClick={handleDownload}>
                DOWNLOAD DISINI
              </button>
            </div>
          )}
        </div>

        {/* KARTU CAPTION */}
        <div className="card caption-card">
          <h2>📋 Caption</h2>
          <div className="caption-box">
            <p>🕊️ I'm ready to celebrate Dies Natalis ke-7 SMK Telkom Sidoarjo! 🕊️</p>
            <br/>

            <p>Halo teman-teman 👋🏻<br/>
            Perkenalkan, saya <b>[Nama kamu]</b> dari <b>[Kelas/Organisasi Kamu]</b> turut merayakan dan mendoakan Dies Natalis ke-7 SMK Telkom Sidoarjo. Semoga sekolah kita semakin maju, berprestasi, dan terus mencetak generasi yang unggul dan berkarakter.</p>
            <br/>

            <p>🎉 Harapan untuk SMK Telkom Sidoarjo<br/>
            <b>[Isi dengan harapan/doa kamu]</b></p>
            <br/>

            <blockquote className="quote">"From Inspiration to Transformation"</blockquote>

            <p>Selamat Dies Natalis ke-7 SMK Telkom Sidoarjo! 🎂</p>
            <br/>

            {/* Bagian Tag & Hashtag */}
            <p style={{color: '#0f6f6b', fontWeight: 'bold', fontSize: '0.85rem'}}>
                @smktelkomsda @osis.smktelkomsda @mpk.smktelkomsda<br/>
                #DiesNatalisKe7 #DiesNatalisSMKTelkomSidoarjo #SMKTelkomSidoarjo
            </p>
          </div>

          <button
            className={`btn btn-copy ${copySuccess.includes("Berhasil") ? 'success' : ''}`}
            onClick={handleCopyCaption}
          >
            {copySuccess}
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;
