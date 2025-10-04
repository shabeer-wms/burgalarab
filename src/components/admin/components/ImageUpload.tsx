import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadImageToImgBB } from '../../../utils/imageUpload';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create preview immediately
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Upload to ImageBB
      const imageUrl = await uploadImageToImgBB(file);
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      
      // Set the final uploaded image
      setPreviewImage(imageUrl);
      onImageChange(imageUrl);
    } catch (error) {
      // Clean up preview URL on error
      if (previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
      
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      setPreviewImage(currentImage || '');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    if (previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage('');
    onImageChange('');
    setUploadError(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Item Image
      </label>
      
      <div className="space-y-3">
        {/* Upload Area */}
        <div
          onClick={handleUploadClick}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isUploading
              ? 'border-purple-300 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
              <p className="text-sm text-purple-600">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload an image
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
            {uploadError}
          </div>
        )}

        {/* Image Preview */}
        {previewImage && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Preview:</span>
              <button
                onClick={handleRemoveImage}
                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                title="Remove image"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-32 object-cover rounded-md border border-gray-200"
                onError={() => {
                  setUploadError('Failed to load image preview');
                  setPreviewImage('');
                }}
              />
              {previewImage.startsWith('blob:') && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-md">
                  <div className="bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-700">
                    Uploading...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback URL Input */}
        <div className="pt-2 border-t border-gray-200">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Or enter image URL directly:
          </label>
          <input
            type="url"
            value={previewImage}
            onChange={(e) => {
              setPreviewImage(e.target.value);
              onImageChange(e.target.value);
              setUploadError(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    </div>
  );
};