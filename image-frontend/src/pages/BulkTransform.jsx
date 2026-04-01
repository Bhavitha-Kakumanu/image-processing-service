import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listImages, resizeImage, rotateImage, watermarkImage, convertImage } from '../api/api';

export default function BulkTransform() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeTab, setActiveTab] = useState('resize');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [resizeForm, setResizeForm] = useState({ width: 300, height: 300 });
  const [rotateForm, setRotateForm] = useState({ angle: 90 });
  const [watermarkForm, setWatermarkForm] = useState({ text: 'My Watermark' });
  const [convertForm, setConvertForm] = useState({ format: 'png' });

  useEffect(() => {
    listImages().then(res => setImages(res.data)).catch(() => {});
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelected(selected.length === images.length ? [] : images.map(i => i.id));
  };

  const apiFn = (id) => {
    if (activeTab === 'resize') return resizeImage(id, resizeForm.width, resizeForm.height);
    if (activeTab === 'rotate') return rotateImage(id, rotateForm.angle);
    if (activeTab === 'watermark') return watermarkImage(id, watermarkForm.text);
    if (activeTab === 'convert') return convertImage(id, convertForm.format);
  };

  const handleApply = async () => {
    if (selected.length === 0) { setError('Select at least one image'); return; }
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const resultBlobs = await Promise.all(
        selected.map(async id => {
          const res = await apiFn(id);
          return { id, url: URL.createObjectURL(res.data) };
        })
      );
      setResults(resultBlobs);
    } catch {
      setError('Some transformations failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = () => {
    results.forEach((result) => {
      const a = document.createElement('a');
      a.href = result.url;
      a.download = `transformed_${result.id}_${activeTab}.png`;
      a.click();
    });
  };

  const tabs = ['resize', 'rotate', 'watermark', 'convert'];

  return (
    <div className="page-container">
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/')}>← Back</button>
        <div>
          <h2>Bulk Transform</h2>
          <p>Apply the same transformation to multiple images at once</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="transform-panel">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Select Images</h6>
              <button className="btn btn-sm btn-outline-primary" onClick={selectAll}>
                {selected.length === images.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
              {selected.length} of {images.length} selected
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px',
              maxHeight: '400px', overflowY: 'auto' }}>
              {images.map(img => (
                <div key={img.id} onClick={() => toggleSelect(img.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px', borderRadius: '8px', cursor: 'pointer',
                    background: selected.includes(img.id) ? '#f0eeff' : '#f8f9fa',
                    border: `2px solid ${selected.includes(img.id) ? '#667eea' : 'transparent'}`,
                    transition: 'all 0.15s'
                  }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '4px',
                    background: selected.includes(img.id) ? '#667eea' : '#ddd',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '12px', flexShrink: 0
                  }}>
                    {selected.includes(img.id) ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: '13px', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {img.originalName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="transform-panel">
            <h6 className="fw-bold mb-3">Transformation</h6>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '6px 14px', borderRadius: '20px', border: 'none',
                  background: activeTab === tab
                    ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e0e0e0',
                  color: activeTab === tab ? 'white' : '#555',
                  fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize'
                }}>{tab}</button>
              ))}
            </div>

            {activeTab === 'resize' && (
              <>
                <div className="mb-3">
                  <label className="form-label">Width: <strong>{resizeForm.width}px</strong></label>
                  <input type="range" className="form-range" min="50" max="2000"
                    value={resizeForm.width}
                    onChange={e => setResizeForm({ ...resizeForm, width: Number(e.target.value) })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Height: <strong>{resizeForm.height}px</strong></label>
                  <input type="range" className="form-range" min="50" max="2000"
                    value={resizeForm.height}
                    onChange={e => setResizeForm({ ...resizeForm, height: Number(e.target.value) })} />
                </div>
              </>
            )}

            {activeTab === 'rotate' && (
              <>
                <div className="mb-3">
                  <label className="form-label">Angle: <strong>{rotateForm.angle}°</strong></label>
                  <input type="range" className="form-range" min="0" max="360"
                    value={rotateForm.angle}
                    onChange={e => setRotateForm({ angle: Number(e.target.value) })} />
                </div>
                <div className="d-flex gap-2 mb-3">
                  {[90, 180, 270, 360].map(a => (
                    <button key={a} className="btn btn-outline-primary btn-sm flex-grow-1"
                      onClick={() => setRotateForm({ angle: a })}>{a}°</button>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'watermark' && (
              <div className="mb-3">
                <label className="form-label">Watermark Text</label>
                <input type="text" className="form-control"
                  value={watermarkForm.text}
                  onChange={e => setWatermarkForm({ text: e.target.value })} />
              </div>
            )}

            {activeTab === 'convert' && (
              <div className="mb-3">
                <label className="form-label">Output Format</label>
                <select className="form-control" value={convertForm.format}
                  onChange={e => setConvertForm({ format: e.target.value })}>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WEBP</option>
                  <option value="gif">GIF</option>
                </select>
              </div>
            )}

            {error && <div className="alert alert-danger mt-2">{error}</div>}

            <button className="btn btn-primary w-100 mt-3"
              onClick={handleApply} disabled={loading || selected.length === 0}>
              {loading
                ? `Processing ${selected.length} images...`
                : `Apply to ${selected.length} image${selected.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>

        <div className="col-md-4">
          <div className="transform-panel" style={{ minHeight: '400px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Results</h6>
              {results.length > 0 && (
                <button className="btn btn-sm btn-outline-primary" onClick={downloadAll}>
                  Download All
                </button>
              )}
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
                <p className="mt-3 text-muted">Processing {selected.length} images...</p>
              </div>
            )}

            {results.length > 0 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {results.map((result) => (
                  <div key={result.id} style={{ borderRadius: '8px', overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <img src={result.url} alt={`result-${result.id}`}
                      style={{ width: '100%', maxHeight: '160px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px', background: 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#888' }}>Image #{result.id}</span>
                      <a href={result.url} download={`transformed_${result.id}.png`}
                        className="btn btn-outline-primary btn-sm">↓</a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.length === 0 && !loading && (
              <div className="text-center py-5" style={{ color: '#ccc' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
                <p>Select images and apply a transformation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}