import { useState, useRef } from 'react';
import './ImageUpload.css';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
}

export function ImageUpload({ currentImage, onImageChange, label = 'Profile Image' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // In a real app, you would upload to a server here
    // For now, we'll use the data URL
    setUploading(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In production, replace this with actual upload to server
      // const uploadedUrl = await uploadToServer(file);
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      onImageChange(dataUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">{label}</label>
      
      <div className="image-upload-content">
        <div className="image-preview-container">
          {preview ? (
            <img src={preview} alt="Preview" className="image-preview" />
          ) : (
            <div className="image-placeholder">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>No image</span>
            </div>
          )}
        </div>

        <div className="image-upload-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="image-upload-input"
          />
          <label htmlFor="image-upload-input" className="btn btn-secondary btn-sm">
            {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
          </label>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--danger)' }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
      
      <p className="image-upload-hint">
        Recommended: Square image, at least 200x200px. Max 5MB.
      </p>
    </div>
  );
}
