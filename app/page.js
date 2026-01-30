'use client';

import { useState, useRef, useEffect } from 'react';
import './globals.css';

export default function Home() {
  const [formData, setFormData] = useState({
    name: 'MARIA SANTO',
    role: 'FACULTY / TEACHER',
    idNumber: 'AC-T-45892',
    validFrom: '2022',
    validTo: '2027',
  });
  const [photo, setPhoto] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // For live preview (simple)
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  // Barcode Generation Effect (Ported from original script.js)
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      const container = barcodeRef.current;
      container.innerHTML = '';

      // Original logic from script.js:createBarcodeDOM
      for (let i = 0; i < 60; i++) {
        const bar = document.createElement('div');
        bar.classList.add('barcode-bar');

        const width = Math.floor(Math.random() * 3) + 1;
        bar.style.width = width + 'px';

        const gap = Math.floor(Math.random() * 3) + 1;
        bar.style.marginRight = gap + 'px';

        container.appendChild(bar);
      }
    }
  }, []); // Run once on mount

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // Basic resizing logic
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > 600) {
            height *= 600 / width;
            width = 600;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setPhoto(compressed);
          setPreviewPhoto(compressed);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, photo }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');

      window.open(data.downloadUrl, '_blank');
      setGeneratedUrl(data.downloadUrl);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <section className="controls-section">
        <h2>Buat Kartu ID</h2>
        <p className="subtitle">Isi data di bawah untuk mengubah kartu secara real-time.</p>

        <div className="form-group">
          <label>Nama Lengkap</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} maxLength="20" placeholder="MARIA SANTO" />
        </div>

        <div className="form-group">
          <label>Jabatan / Posisi</label>
          <input type="text" name="role" value={formData.role} onChange={handleInputChange} maxLength="15" placeholder="FACULTY / TEACHER" />
        </div>

        <div className="form-group">
          <label>Nomor ID</label>
          <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} maxLength="10" placeholder="AC-T-45892" />
        </div>

        <div className="form-group">
          <label>Upload Foto</label>
          <input type="file" onChange={handlePhotoUpload} accept="image/*" />
          <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '0.8rem' }}>Format: JPG, PNG. Disarankan rasio potret.</small>
        </div>

        <button onClick={generateCard} disabled={isLoading} className="download-btn">
          {isLoading ? 'Generating HQ Card...' : 'Download Card'}
        </button>

        <div className="instructions">
          Info: Gunakan tombol Download untuk menyimpan hasil kartu ke komputer Anda.
        </div>

        {error && <p className="error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </section>

      {/* Live Preview Section */}
      <section className="preview-section">
        <div className="card-container" id="cardToCapture">
          {/* Photo Area */}
          <div className="photo-area">
            {previewPhoto ? (
              <img src={previewPhoto} alt="ID Photo" className="id-photo" />
            ) : (
              <span style={{ color: '#666', fontSize: '12px' }}>NO PHOTO</span>
            )}
          </div>

          {/* Info Area (Top Right) */}
          <div className="info-area">
            <div className="name" dangerouslySetInnerHTML={{ __html: formData.name.replace(/\n/g, '<br/>') || 'YOUR NAME' }}></div>
            <div className="role">{formData.role || 'ROLE'}</div>
            <div className="id-number">ID: {formData.idNumber || '000000'}</div>
          </div>


          {/* Barcode Area (Bottom Right) */}
          <div className="barcode-area">
            <div className="barcode" ref={barcodeRef}></div>
            <div className="validity">Valid: {formData.validFrom}-{formData.validTo}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
