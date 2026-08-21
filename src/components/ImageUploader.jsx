'use client';
import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

const MAX_MB = 2;

export default function ImageUploader({ onFileSelected, disabled }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  async function handleFile(raw) {
    setError('');
    if (!raw) return;
    if (!raw.type.startsWith('image/')) {
      setError('Only image files are accepted.');
      return;
    }

    setCompressing(true);
    try {
      const compressed = await imageCompression(raw, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      if (compressed.size > MAX_MB * 1024 * 1024) {
        setError(`Image still exceeds ${MAX_MB}MB after compression. Please use a smaller photo.`);
        setCompressing(false);
        return;
      }

      const url = URL.createObjectURL(compressed);
      setPreview(url);
      onFileSelected(compressed);
    } catch {
      setError('Failed to process image. Please try a different file.');
    }
    setCompressing(false);
  }

  function clearPreview() {
    setPreview(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      {preview ? (
        <div className="upload-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" />
          <button
            type="button"
            className="upload-preview-remove"
            onClick={clearPreview}
            title="Remove image"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className={`upload-zone${dragOver ? ' drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            disabled={disabled || compressing}
          />
          {compressing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="spinner" style={{ width: 18, height: 18 }} /> Compressing…
            </span>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📷</div>
              <div style={{ fontWeight: 500 }}>Click or drag &amp; drop an image</div>
              <div style={{ 
                fontSize: 13, 
                marginTop: 8, 
                color: 'var(--color-fg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                <span>Max 2MB</span>
                <span>•</span>
                <span>JPEG, PNG, WEBP</span>
              </div>
            </>
          )}
        </div>
      )}
      {error && <div className="form-error" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
}
