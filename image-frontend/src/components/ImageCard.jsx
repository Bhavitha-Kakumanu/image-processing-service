import React from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieveImage, deleteImage } from '../api/api';

export default function ImageCard({ image, onDelete }) {
  const navigate = useNavigate();
  const [preview, setPreview] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    retrieveImage(image.id).then(res => {
      setPreview(URL.createObjectURL(res.data));
    }).catch(() => setPreview(null));
  }, [image.id]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this image?')) return;
    setDeleting(true);
    try {
      await deleteImage(image.id);
      onDelete(image.id);
    } catch {
      alert('Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="image-card">
      {preview ? (
        <img src={preview} alt={image.originalName} />
      ) : (
        <div style={{ height: '200px', background: '#f0f2f5',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#aaa', fontSize: '32px' }}>🖼</div>
      )}
      <div className="image-card-body">
        <h6 title={image.originalName}>{image.originalName}</h6>
        <p>{formatSize(image.fileSize)}</p>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm flex-grow-1"
            onClick={() => navigate(`/transform/${image.id}`)}>
            Transform
          </button>
          <button className="btn btn-danger btn-sm"
            onClick={handleDelete} disabled={deleting}>
            {deleting ? '...' : '🗑'}
          </button>
        </div>
      </div>
    </div>
  );
}