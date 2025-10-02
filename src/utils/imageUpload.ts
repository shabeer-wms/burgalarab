const IMGBB_API_KEY = 'c5a49e0f3a515b5d936cc7ca59fedb9b';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadImageToImgBB = async (file: File): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    // Upload to ImageBB
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image. Please try again.');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to upload image');
    }

    return data.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};