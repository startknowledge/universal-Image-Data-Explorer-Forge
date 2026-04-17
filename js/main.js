import { ImageProcessor } from './core/imageProcessor.js';
import { MenuBuilder } from './ui/menuBuilder.js';
import { Logger } from './ui/logger.js';
import { DownloadManager } from './ui/downloadManager.js';

// State
let currentProcessor = null;
let currentConvertedText = '';
let currentRawBinary = null;
let currentConverterId = 'binary';
let downloadsUnlocked = false;
const logger = new Logger('logPanel');

// Initialize Menu
const menu = new MenuBuilder('groupMenuContainer', (id, name) => {
  currentConverterId = id;
  logger.log(`Selected: ${name}`);
});

// Image Loader
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const previewImg = document.getElementById('previewImg');

function loadImage(file) {
  if (!file.type.startsWith('image/')) { logger.log('Not an image file', 'error'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      previewImg.src = img.src;
      currentProcessor = new ImageProcessor();
      currentProcessor.loadFromImage(img);
      logger.log(`Loaded: ${img.width}x${img.height}, ${(file.size/1024).toFixed(1)} KB`);
      document.getElementById('metadataPanel').innerHTML = `<strong>Metadata</strong><br>📐 ${img.width}x${img.height}<br>📁 ${file.type}<br>💾 ${(file.size/1024).toFixed(1)} KB`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); loadImage(e.dataTransfer.files[0]); });
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => { if(e.target.files[0]) loadImage(e.target.files[0]); });

// Convert Button
document.getElementById('convertBtn').addEventListener('click', async () => {
  if (!currentProcessor) { logger.log('No image loaded', 'error'); return; }
  logger.log(`Converting to ${currentConverterId}...`);
  const output = await currentProcessor.convert(currentConverterId);
  currentConvertedText = output;
  document.getElementById('outputDisplay').innerText = output.length > 4000 ? output.substring(0,4000)+'... (truncated)' : output;
  if (currentConverterId === 'binary') {
    currentRawBinary = new Uint8Array(output.match(/.{8}/g).map(b=>parseInt(b,2)));
  }
  logger.log(`Conversion done. Length: ${output.length} chars`);
});

// Binary to Image Reconstruction
document.getElementById('reconstructImageBtn').addEventListener('click', () => {
  const binaryStr = document.getElementById('binaryInputText').value.trim().replace(/\s/g,'');
  const width = parseInt(document.getElementById('reconWidth').value);
  const height = parseInt(document.getElementById('reconHeight').value);
  if (!binaryStr || !width || !height) { logger.log('Enter binary string and dimensions', 'error'); return; }
  const expected = width * height * 8;
  if (binaryStr.length !== expected) { logger.log(`Binary length mismatch: expected ${expected}, got ${binaryStr.length}`, 'error'); return; }
  const canvas = document.getElementById('reconCanvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  for (let i=0; i<width*height; i++) {
    const byte = parseInt(binaryStr.substr(i*8, 8), 2);
    imgData.data[i*4] = byte; imgData.data[i*4+1] = byte; imgData.data[i*4+2] = byte; imgData.data[i*4+3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  logger.log(`Reconstructed ${width}x${height} from binary`);
});

// Copy & Download
document.getElementById('copyOutputBtn').addEventListener('click', () => {
  if (currentConvertedText) { navigator.clipboard.writeText(currentConvertedText); logger.log('Copied!'); }
  else logger.log('Nothing to copy');
});

const downloadManager = new DownloadManager();
document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!downloadsUnlocked) { logger.log('Register email to unlock downloads', 'error'); return; }
  if (!currentConvertedText) { logger.log('No converted data', 'error'); return; }
  const format = document.getElementById('downloadFormatSelect').value;
  downloadManager.download(currentConvertedText, format, currentRawBinary);
});

// Email Unlock
document.getElementById('registerEmailBtn').addEventListener('click', () => {
  const email = document.getElementById('userEmail').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('emailStatus').innerHTML = '❌ Invalid email'; return; }
  downloadsUnlocked = true;
  document.getElementById('emailStatus').innerHTML = '✅ Downloads unlocked!';
  logger.log(`Email registered: ${email}`);
});

logger.log('🚀 Universal Image Forge Pro ready | 60+ converters loaded');