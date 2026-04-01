import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listImages, deleteImage } from '../api/api';
import ImageCard from '../components/ImageCard';

export default function Dashboard() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listImages()
      .then(res => setImages(res.data))
      .catch(() => setError('Failed to load images'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (deletedId) => {
    setImages(prev => prev.filter(img => img.id !== deletedId));
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete ALL images? This cannot be undone.')) return;
    try {
      await Promise.all(images.map(img => deleteImage(img.id)));
      setImages([]);
    } catch {
      alert('Failed to clear some images');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h2>My Images</h2>
          <p>{images.length} image{images.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <div className="d-flex gap-2">
          {images.length > 0 && (
            <button className="btn btn-outline-danger" onClick={handleClearAll}>
              Clear All
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            + Upload New
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading your images...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && images.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼</div>
          <h5 style={{ color: '#666' }}>No images yet</h5>
          <p style={{ color: '#aaa' }}>Upload your first image to get started</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/upload')}>
            Upload Image
          </button>
        </div>
      )}

      <div className="image-grid">
        {images.map(image => (
          <ImageCard key={image.id} image={image} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}