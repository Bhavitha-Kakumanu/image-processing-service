import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resizeImage, cropImage, rotateImage, watermarkImage, convertImage, retrieveImage } from '../api/api';

export default function Transform() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('resize');
  const [resizeForm, setResizeForm] = useState({ width: 300, height: 300 });
  const [cropForm, setCropForm] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [rotateForm, setRotateForm] = useState({ angle: 90 });
  const [watermarkForm, setWatermarkForm] = useState({ text: 'My Watermark' });
  const [convertForm, setConvertForm] = useState({ format: 'png' });

  const handle = async (apiFn) => {
    setLoading(true);
    setError('');
    setResultImage(null);
    try {
      const res = await apiFn();
      setResultImage(URL.createObjectURL(res.data));
    } catch {
      setError('Transformation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['resize', 'crop', 'rotate', 'watermark', 'convert', 'original'];

  return (
    <div className="page-container">
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/')}>← Back</button>
        <div>
          <h2>Transform Image #{id}</h2>
          <p>Apply transformations and see results instantly</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-5">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '6px 16px', borderRadius: '20px', border: 'none',
                background: activeTab === tab ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e0e0e0',
                color: activeTab === tab ? 'white' : '#555',
                fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize'
              }}>{tab}</button>
            ))}
          </div>

          {activeTab === 'resize' && (
            <div className="transform-panel">
              <h6 className="fw-bold mb-3">Resize Image</h6>
              <div className="mb-3">
                <label className="form-label">Width: <strong>{resizeForm.width}px</strong></label>
                <input type="range" className="form-range" min="50" max="2000"
                  value={resizeForm.width} onChange={e => setResizeForm({ ...resizeForm, width: Number(e.target.value) })} />
              </div>
              <div className="mb-4">
                <label className="form-label">Height: <strong>{resizeForm.height}px</strong></label>
                <input type="range" className="form-range" min="50" max="2000"
                  value={resizeForm.height} onChange={e => setResizeForm({ ...resizeForm, height: Number(e.target.value) })} />
              </div>
              <button className="btn btn-primary w-100" disabled={loading}
                onClick={() => handle(() => resizeImage(id, resizeForm.width, resizeForm.height))}>
                Apply Resize
              </button>
            </div>
          )}

          {activeTab === 'crop' && (
            <div className="transform-panel">
              <h6 className="fw-bold mb-3">Crop Image</h6>
              {['x', 'y', 'width', 'height'].map(field => (
                <div className="mb-3" key={field}>
                  <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}: <strong>{cropForm[field]}px</strong></label>
                  <input type="range" className="form-range" min="0" max="1000"
                    value={cropForm[field]} onChange={e => setCropForm({ ...cropForm, [field]: Number(e.target.value) })} />
                </div>
              ))}
              <button className="btn btn-primary w-100" disabled={loading}
                onClick={() => handle(() => cropImage(id, cropForm.x, cropForm.y, cropForm.width, cropForm.height))}>
                Apply Crop
              </button>
            </div>
          )}

          {activeTab === 'rotate' && (
            <div className="transform-panel">
              <h6 className="fw-bold mb-3">Rotate Image</h6>
              <div className="mb-4">
                <label className="form-label">Angle: <strong>{rotateForm.angle}°</strong></label>
                <input type="range" className="form-range" min="0" max="360"
                  value={rotateForm.angle} onChange={e => setRotateForm({ angle: Number(e.target.value) })} />
              </div>
              <div className="d-flex gap-2 mb-4">
                {[90, 180, 270, 360].map(a => (
                  <button key={a} className="btn btn-outline-primary btn-sm flex-grow-1"
                    onClick={() => setRotateForm({ angle: a })}>{a}°</button>
                ))}
              </div>
              <button className="btn btn-primary w-100" disabled={loading}
                onClick={() => handle(() => rotateImage(id, rotateForm.angle))}>
                Apply Rotation
              </button>
            </div>
          )}

          {activeTab === 'watermark' && (
            <div className="transform-panel">
              <h6 className="fw-bold mb-3">Add Watermark</h6>
              <div className="mb-4">
                <label className="form-label">Watermark Text</label>
                <input type="text" className="form-control" value={watermarkForm.text}
                  onChange={e => setWatermarkForm({ text: e.target.value })}
                  placeholder="Enter watermark text" />
              </div>
              <button className="btn btn-primary w-100" disabled={loading}
                onClick={() => handle(() => watermarkImage(id, watermarkForm.text))}>
                Apply Watermark
              </button>
            </div>
          )}

          {activeTab === 'convert' && (
            <div className="transform-panel">
              <h6 className="fw-bold mb-3">Convert Format</h6>
              <div className="mb-4">
                <label className="form-label">Output Format</label>
                <select className="form-control" value={convertForm.format}
                  onChange={e => setConvertForm({ format: e.target.value })}>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WEBP</option>
                  <option value="gif">GIF</option>
                </select>
              </div>
              <button className="btn btn-primary w-100" disabled={loading}
                onClick={() => handle(() => convertImage(id, convertForm.format))}>
                Convert Image
              </button>
            </div>
          )}

          {activeTab === 'original' && (
            <div className="transform-panel">
              <h6 className="fw-bold mb-3">Original Image</h6>
              <p style={{ color: '#888', fontSize: '14px' }}>Retrieve the original unmodified image</p>
              <button className="btn btn-primary w-100 mt-2" disabled={loading}
                onClick={() => handle(() => retrieveImage(id))}>
                Load Original
              </button>
            </div>
          )}
        </div>

        <div className="col-md-7">
          <div className="transform-panel" style={{ minHeight: '400px' }}>
            <h6 className="fw-bold mb-3">Result</h6>
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="mt-3 text-muted">Processing...</p>
              </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {resultImage && !loading && (
              <>
                <img src={resultImage} alt="result" className="result-image" />
                <a href={resultImage} download={`image_${activeTab}.png`}
                  className="btn btn-outline-primary w-100 mt-3">
                  Download Result
                </a>
              </>
            )}
            {!resultImage && !loading && !error && (
              <div className="text-center py-5" style={{ color: '#ccc' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
                <p>Apply a transformation to see the result here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
