import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage, bulkUploadImages } from '../api/api';

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) { setError('Please select image files only'); return; }
    setFiles(fileArray);
    setPreviews(fileArray.map(f => URL.createObjectURL(f)));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) { setError('Please select at least one image'); return; }
    setLoading(true);
    setError('');
    try {
      if (files.length === 1) {
        const formData = new FormData();
        formData.append('file', files[0]);
        await uploadImage(formData);
      } else {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        await bulkUploadImages(formData);
      }
      setSuccess(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully!`);
      setTimeout(() => navigate('/'), 1500);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h2>Upload Images</h2>
        <p>Select one or multiple images at once</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className={`upload-area ${dragging ? 'dragging' : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}>
        <div className="upload-icon">📁</div>
        <p style={{ color: '#667eea', fontWeight: 600, marginBottom: '4px' }}>
          Click or drag images here
        </p>
        <p style={{ color: '#aaa', fontSize: '14px' }}>
          Select multiple images — JPG, PNG, WEBP up to 10MB each
        </p>
        <input ref={fileInputRef} type="file" accept="image/*" multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {previews.length > 0 && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-bold">
              {files.length} image{files.length > 1 ? 's' : ''} selected
            </h6>
            <button className="btn btn-sm btn-outline-secondary"
              onClick={() => { setFiles([]); setPreviews([]); }}>
              Clear all
            </button>
          </div>
          <div style={{ display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {previews.map((preview, index) => (
              <div key={index} style={{ position: 'relative', borderRadius: '10px',
                overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <img src={preview} alt={files[index]?.name}
                  style={{ width: '100%', height: '120px',
                    objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '6px 8px', background: 'white' }}>
                  <p style={{ fontSize: '11px', color: '#888', margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {files[index]?.name}
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  style={{ position: 'absolute', top: '6px', right: '6px',
                    background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
                    borderRadius: '50%', width: '24px', height: '24px',
                    cursor: 'pointer', fontSize: '12px', lineHeight: '24px',
                    textAlign: 'center' }}>✕</button>
              </div>
            ))}
          </div>
          <div className="mt-4 d-flex gap-3">
            <button className="btn btn-primary flex-grow-1"
              onClick={handleSubmit} disabled={loading}>
              {loading
                ? `Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`
                : `Upload ${files.length} Image${files.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}