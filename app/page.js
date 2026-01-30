'use client';

import { useState, useRef, useEffect } from 'react';
import './globals.css';

export default function Home() {
  const [formData, setFormData] = useState({
    name: 'YOUR NAME',
    role: 'STUDENT',
    idNumber: '000000',
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
        <h1>ID Generator</h1>

        <div className="input-group">
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} maxLength="20" />
        </div>

        <div className="input-group">
          <label>Role</label>
          <input type="text" name="role" value={formData.role} onChange={handleInputChange} maxLength="15" />
        </div>

        <div className="input-group">
          <label>ID Number</label>
          <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} maxLength="10" />
        </div>

        <div className="input-group">
          <label>Photo</label>
          <input type="file" onChange={handlePhotoUpload} accept="image/*" />
        </div>

        <button onClick={generateCard} disabled={isLoading} className="download-btn">
          {isLoading ? 'Generating...' : 'Download Card'}
        </button>

        {error && <p className="error">{error}</p>}
      </section>

      <section className="preview-section">
        <div className="preview-note">
          <p>Live Preview (Simplified)</p>
          <div className="card-mockup">
            <div className="mockup-photo">
              {previewPhoto ? <img src={previewPhoto} /> : <div className="placeholder">Photo</div>}
            </div>
            <div className="mockup-info">
              <h2>{formData.name}</h2>
              <p>{formData.role}</p>
              <p className="id-num">{formData.idNumber}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
