import { analyzeImage } from '../services/claude';

export async function processImage(imageFile: File) {
  try {
    // Convert image to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    // Analyze image using Claude
    const result = await analyzeImage(base64Image);
    return result;
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}