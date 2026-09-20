'use client';
import { useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { MAX_FILE_SIZE_BYTES } from '@/lib/storage';
import { IconCamera, IconClose } from './Icons';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export default function ImageUploader({ onFileSelected, disabled }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function handleFile(raw) {
    setError('');
    if (!raw) return;
    if (!raw.type.startsWith('image/')) {
      setError('That file is not an image. Please choose a JPG, PNG or WEBP photo.');
      return;
    }
    if (!ACCEPT.includes(raw.type) && !raw.type.startsWith('image/')) {
      setError('Unsupported image format.');
      return;
    }

    setBusy(true);
    try {
      const compressed = await imageCompression(raw, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1400,
        useWebWorker: true,
        fileType: raw.type === 'image/png' ? 'image/png' : 'image/jpeg',
        initialQuality: 0.82,
      });
      if (compressed.size > MAX_FILE_SIZE_BYTES) {
        setError('The photo is still over 2 MB after compression. Please pick a smaller one.');
        return;
      }
      const named = new File([compressed], raw.name.replace(/\.[^.]+$/, '') + (compressed.type === 'image/png' ? '.png' : '.jpg'), { type: compressed.type });
      setPreview(URL.createObjectURL(named));
      onFileSelected(named);
    } catch {
      setError('Could not process that photo. Please try a different file.');
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setPreview(null);
    setError('');
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (preview) {
    return (
      <div className="upload-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Selected photo preview" />
        <button type="button" className="btn btn-secondary btn-sm" onClick={clear} disabled={disabled}>
          <IconClose /> Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`dropzone${over ? ' over' : ''}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || busy}
        aria-label="Add a photo. Click to choose a file or drag one here."
        onClick={() => !disabled && !busy && inputRef.current?.click()}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled) handleFile(e.dataTransfer.files?.[0]); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={disabled || busy}
          tabIndex={-1}
        />
        {busy ? (
          <span className="row" style={{ justifyContent: 'center' }}><span className="spinner" /> Preparing photo…</span>
        ) : (
          <>
            <IconCamera />
            <b>Add a photo</b>
            <small>Tap to take or choose a photo · JPG, PNG, WEBP · compressed to under 2 MB</small>
          </>
        )}
      </div>
      {error && <p className="field-error" role="alert" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
