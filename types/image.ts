export interface ImageMetadata {
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

export interface UploadedImageState {
  dataUrl: string;
  file?: File;
  metadata: ImageMetadata;
}

export interface ExampleImageItem {
  id: string;
  title: string;
  category: string;
  description: string;
  promptSuggestion: string;
  dataUrl: string;
  metadata: ImageMetadata;
}
