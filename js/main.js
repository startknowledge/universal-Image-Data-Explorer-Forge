import { ImageProcessor } from './core/imageProcessor.js';
import { Reconstructor } from './core/reconstructor.js';
import { MenuBuilder } from './ui/menuBuilder.js';
import { Logger } from './ui/logger.js';
import { DownloadManager } from './ui/downloadManager.js';

let currentProcessor = null;
let currentConvertedText = '';
let currentRawBinary = null;
let currentConverterId = 'binary';
let downloadsUnlocked = false;

const logger = new Logger('logPanel');
const menu = new MenuBuilder('groupMenuContainer', (id, name) => {
  currentConverterId = id;
  logger.log(`Selected: ${name}`);
});

// Image loading
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const previewImg = document.getElementById('previewImg');

function loadImage(file) {
  if (!file.type.startsWith('image/')) { logger.log('Not an image', 'error'); return; }
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

// Convert button
document.getElementById('convertBtn').addEventListener('click', async () => {
  if (!currentProcessor) { logger.log('No image loaded', 'error'); return; }
  logger.log(`Converting to ${currentConverterId}...`);
  const output = await currentProcessor.convert(currentConverterId);
  currentConvertedText = output;
  document.getElementById('outputDisplay').innerText = output;  // FULL output, no truncation
  if (currentConverterId === 'binary') {
    currentRawBinary = new Uint8Array(output.match(/.{8}/g).map(b=>parseInt(b,2)));
  }
  logger.log(`Conversion done. Length: ${output.length} chars`);
});

// REVERT ANY FORMAT TO IMAGE
document.getElementById('revertToImageBtn').addEventListener('click', () => {
  const inputData = document.getElementById('revertInputText').value.trim();
  const format = document.getElementById('revertFormatSelect').value;
  const width = parseInt(document.getElementById('revertWidth').value);
  const height = parseInt(document.getElementById('revertHeight').value);
  if (!inputData || !width || !height) { logger.log('Please provide data, width and height', 'error'); return; }
  try {
    const bytes = Reconstructor.parseToBytes(inputData, format, width, height);
    const canvas = Reconstructor.reconstructImage(bytes, width, height);
    const ctx = canvas.getContext('2d');
    const revertCanvas = document.getElementById('revertCanvas');
    revertCanvas.width = width;
    revertCanvas.height = height;
    revertCanvas.getContext('2d').drawImage(canvas, 0, 0);
    logger.log(`Reverted ${format} → ${width}x${height} image`);
  } catch (err) {
    logger.log(`Revert error: ${err.message}`, 'error');
  }
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

// Email unlock
document.getElementById('registerEmailBtn').addEventListener('click', () => {
  const email = document.getElementById('userEmail').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('emailStatus').innerHTML = '❌ Invalid email'; return; }
  downloadsUnlocked = true;
  document.getElementById('emailStatus').innerHTML = '✅ Downloads unlocked!';
  logger.log(`Email registered: ${email}`);
});

logger.log('🚀 Universal Image Forge Pro ready | Revert any format to image');