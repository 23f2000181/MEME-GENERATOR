import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';

export interface CaptionConfig {
  text: string;
  position: 'top' | 'bottom' | 'center';
  fontSize?: number;
}

/**
 * Add text overlays to a base64 image using Canvas
 */
export async function addTextOverlay(
  base64Image: string,
  captions: CaptionConfig[]
): Promise<string> {
  // Load the base image
  const img = await loadImage(base64Image);

  // Create canvas with same dimensions
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');

  // Draw the base image
  ctx.drawImage(img, 0, 0);

  // Add each caption
  for (const caption of captions) {
    drawCaption(ctx, caption, img.width, img.height);
  }

  // Convert back to base64
  return canvas.toDataURL('image/png');
}

/**
 * Draw a single caption on the canvas
 */
function drawCaption(
  ctx: CanvasRenderingContext2D,
  caption: CaptionConfig,
  width: number,
  height: number
) {
  const fontSize = caption.fontSize || Math.floor(width / 15); // Dynamic font size
  const text = caption.text.toUpperCase(); // Memes traditionally use uppercase

  // Set font style (Impact is the classic meme font)
  ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate Y position based on caption position
  let y: number;
  const margin = fontSize * 0.8;

  switch (caption.position) {
    case 'top':
      y = margin + fontSize / 2;
      break;
    case 'bottom':
      y = height - margin - fontSize / 2;
      break;
    case 'center':
      y = height / 2;
      break;
  }

  // Word wrap for long text
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > width - 40) { // 20px margin on each side
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  // Draw each line with outline (classic meme style)
  const lineHeight = fontSize * 1.2;
  const startY = y - ((lines.length - 1) * lineHeight) / 2;

  for (let i = 0; i < lines.length; i++) {
    const lineY = startY + i * lineHeight;

    // Draw black outline (multiple passes for thickness)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.floor(fontSize / 10);
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    ctx.strokeText(lines[i], width / 2, lineY);

    // Draw white text on top
    ctx.fillStyle = 'white';
    ctx.fillText(lines[i], width / 2, lineY);
  }
}

/**
 * Convert base64 data URL to buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}
