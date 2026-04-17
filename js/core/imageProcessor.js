export class ImageProcessor {
  constructor() {
    this.imageData = null;
    this.width = 0;
    this.height = 0;
    this.rawBytes = null;
  }

  loadFromImage(imgElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);
    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.width = canvas.width;
    this.height = canvas.height;
    this.rawBytes = new Uint8Array(this.imageData.data);
    return true;
  }

  getGrayscaleArray() {
    const pixels = this.imageData.data;
    const gray = new Uint8Array(this.width * this.height);
    for (let i = 0; i < this.width * this.height; i++) {
      const r = pixels[i*4], g = pixels[i*4+1], b = pixels[i*4+2];
      gray[i] = Math.floor(0.299*r + 0.587*g + 0.114*b);
    }
    return gray;
  }

  getRGBArray() { return this.rawBytes; }

  // Helper: RGB to HSL
  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  }

  rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) h = 0;
    else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(v*100)];
  }

  rgbToCmyk(r, g, b) {
    let c = 1 - r/255, m = 1 - g/255, y = 1 - b/255;
    const k = Math.min(c, m, y);
    if (k === 1) return [0,0,0,100];
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
    return [Math.round(c*100), Math.round(m*100), Math.round(y*100), Math.round(k*100)];
  }

  rgbToYuv(r, g, b) {
    const y = 0.299*r + 0.587*g + 0.114*b;
    const u = -0.14713*r - 0.28886*g + 0.436*b;
    const v = 0.615*r - 0.51499*g - 0.10001*b;
    return [Math.round(y), Math.round(u+128), Math.round(v+128)];
  }

  async convert(typeId) {
    const grayArr = this.getGrayscaleArray();
    const rgbArr = this.getRGBArray();
    const w = this.width, h = this.height;

    switch(typeId) {
      // Binary / Low Level
      case 'binary': return grayArr.map(v => v.toString(2).padStart(8,'0')).join('');
      case 'hex': return grayArr.map(v => v.toString(16).padStart(2,'0')).join(' ');
      case 'octal': return grayArr.map(v => v.toString(8)).join(',');
      case 'byteArray': return `[${grayArr.join(',')}]`;
      case 'uint8Array': return `new Uint8Array([${grayArr.join(',')}])`;
      case 'int16Array': return `new Int16Array([${grayArr.join(',')}])`;
      case 'int32Array': return `new Int32Array([${grayArr.join(',')}])`;
      case 'float32Array': return `new Float32Array([${grayArr.map(v=>v/255).join(',')}])`;
      case 'bitStream': return grayArr.map(v => v.toString(2)).join('');

      // Encoding
      case 'base64': return await this._toBase64();
      case 'base32': return this._toBase32(grayArr);
      case 'base85': return this._toBase85(grayArr);
      case 'dataURL': return await this._toDataURL();
      case 'urlEncoded': return encodeURIComponent(await this._toBase64());
      case 'asciiText': return String.fromCharCode(...grayArr.slice(0,2000));
      case 'utf8Text': return new TextDecoder().decode(new Uint8Array(grayArr.slice(0,2000)));
      case 'jsonData': return JSON.stringify({ width: w, height: h, grayscale: Array.from(grayArr) });

      // Pixel Data
      case 'rgbMatrix': return JSON.stringify(this._buildRGBMatrix());
      case 'rgbaMatrix': return JSON.stringify(this._buildRGBAMatrix());
      case 'grayscaleMatrix': return JSON.stringify(this._buildGrayscaleMatrix(grayArr));
      case 'hslMatrix': return JSON.stringify(this._buildHSLMatrix());
      case 'hsvMatrix': return JSON.stringify(this._buildHSVMatrix());
      case 'cmykMatrix': return JSON.stringify(this._buildCMYKMatrix());
      case 'yuvMatrix': return JSON.stringify(this._buildYUVMatrix());
      case 'labColor': return JSON.stringify(this._buildLabColor()); // simple approximation
      case 'colorHistogram': return JSON.stringify(this._colorHistogram());

      // Programming Languages
      case 'cArray': return `unsigned char img[${grayArr.length}] = { ${grayArr.join(', ')} };`;
      case 'cppArray': return `std::array<unsigned char, ${grayArr.length}> img = { ${grayArr.join(', ')} };`;
      case 'pythonBytes': return `img_bytes = bytes([${grayArr.join(', ')}])`;
      case 'javaByteArray': return `byte[] imgData = { ${grayArr.join(', ')} };`;
      case 'goSlice': return `img := []byte{${grayArr.join(', ')}}`;
      case 'rustArray': return `let img: [u8; ${grayArr.length}] = [${grayArr.join(', ')}];`;
      case 'jsBuffer': return `Buffer.from([${grayArr.join(', ')}])`;
      case 'phpBinary': return `$img = "${String.fromCharCode(...grayArr.slice(0,100))}";`;
      case 'swiftData': return `let imgData = Data([${grayArr.join(', ')}])`;
      case 'kotlinByteArray': return `val imgData = byteArrayOf(${grayArr.join(', ')})`;

      // Visualization
      case 'asciiArt': return this._asciiArt(grayArr, w, h);
      case 'brailleArt': return this._brailleArt(grayArr, w, h);
      case 'blockArt': return this._blockArt(grayArr, w, h);
      case 'emojiArt': return this._emojiArt(grayArr, w, h);
      case 'pixelGrid': return this._pixelGrid(grayArr, w, h);
      case 'heatmap': return this._heatmap(grayArr, w, h);

      // Compression / Security
      case 'rle': return this._runLengthEncode(grayArr);
      case 'deltaEncoding': return this._deltaEncode(grayArr);
      case 'md5': return await this._hash('MD5', grayArr);
      case 'sha1': return await this._hash('SHA-1', grayArr);
      case 'sha256': return await this._hash('SHA-256', grayArr);
      case 'crc32': return this._crc32(grayArr).toString(16);

      // AI / Data Science
      case 'numpyArray': return `np.array([${grayArr.join(',')}]).reshape(${h},${w})`;
      case 'tensor': return `tf.tensor([${grayArr.join(',')}], [${h},${w},1])`;
      case 'csvPixel': return grayArr.map((v,i) => `${i%w},${Math.floor(i/w)},${v}`).join('\n');
      case 'pandasDF': return `pd.DataFrame(data={'pixel': [${grayArr.join(',')}], 'x': ${Array(w).fill().map((_,i)=>i%w)}, 'y': ${Array(h).fill().map((_,i)=>Math.floor(i/w))}})`;
      case 'featureVector': return `[${grayArr.join(',')}]`;

      // Web / Browser
      case 'svgTrace': return this._svgTrace(grayArr, w, h);
      case 'cssDataUri': return `background-image: url('${await this._toDataURL()}');`;
      case 'canvasData': return `ctx.putImageData(${JSON.stringify(Array.from(this.imageData.data))}, 0, 0);`;

      default: return `[${grayArr.join(',')}]`;
    }
  }

  // Helper methods for missing converters
  _toBase32(arr) {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (let i=0; i<arr.length; i++) bits += arr[i].toString(2).padStart(8,'0');
    let result = '';
    for (let i=0; i<bits.length; i+=5) {
      const chunk = bits.substr(i,5).padEnd(5,'0');
      result += base32Chars[parseInt(chunk,2)];
    }
    return result;
  }
  _toBase85(arr) {
    // simplified Ascii85
    let result = '<~';
    for (let i=0; i<arr.length; i+=4) {
      let val = 0;
      for (let j=0; j<4; j++) val = (val<<8) | (arr[i+j]||0);
      for (let j=0; j<5; j++) {
        result += String.fromCharCode(33 + (val % 85));
        val = Math.floor(val / 85);
      }
    }
    return result + '~>';
  }
  _buildRGBAMatrix() {
    const p = this.imageData.data;
    const m = [];
    for (let y=0; y<this.height; y++) {
      const row = [];
      for (let x=0; x<this.width; x++) {
        const idx = (y*this.width + x)*4;
        row.push([p[idx], p[idx+1], p[idx+2], p[idx+3]]);
      }
      m.push(row);
    }
    return m;
  }
  _buildHSLMatrix() {
    const p = this.imageData.data;
    const m = [];
    for (let y=0; y<this.height; y++) {
      const row = [];
      for (let x=0; x<this.width; x++) {
        const idx = (y*this.width + x)*4;
        row.push(this.rgbToHsl(p[idx], p[idx+1], p[idx+2]));
      }
      m.push(row);
    }
    return m;
  }
  _buildHSVMatrix() {
    const p = this.imageData.data;
    const m = [];
    for (let y=0; y<this.height; y++) {
      const row = [];
      for (let x=0; x<this.width; x++) {
        const idx = (y*this.width + x)*4;
        row.push(this.rgbToHsv(p[idx], p[idx+1], p[idx+2]));
      }
      m.push(row);
    }
    return m;
  }
  _buildCMYKMatrix() {
    const p = this.imageData.data;
    const m = [];
    for (let y=0; y<this.height; y++) {
      const row = [];
      for (let x=0; x<this.width; x++) {
        const idx = (y*this.width + x)*4;
        row.push(this.rgbToCmyk(p[idx], p[idx+1], p[idx+2]));
      }
      m.push(row);
    }
    return m;
  }
  _buildYUVMatrix() {
    const p = this.imageData.data;
    const m = [];
    for (let y=0; y<this.height; y++) {
      const row = [];
      for (let x=0; x<this.width; x++) {
        const idx = (y*this.width + x)*4;
        row.push(this.rgbToYuv(p[idx], p[idx+1], p[idx+2]));
      }
      m.push(row);
    }
    return m;
  }
  _buildLabColor() {
    // Approximate Lab (simple)
    const p = this.imageData.data;
    const lab = [];
    for (let i=0; i<this.width*this.height; i++) {
      const r = p[i*4], g = p[i*4+1], b = p[i*4+2];
      const x = 0.4124564*r + 0.3575761*g + 0.1804375*b;
      const y = 0.2126729*r + 0.7151522*g + 0.0721750*b;
      const z = 0.0193339*r + 0.1191920*g + 0.9503041*b;
      lab.push([x/95.047, y/100, z/108.883]);
    }
    return lab;
  }
  _colorHistogram() {
    const p = this.imageData.data;
    const hist = { r: new Array(256).fill(0), g: new Array(256).fill(0), b: new Array(256).fill(0) };
    for (let i=0; i<this.width*this.height; i++) {
      hist.r[p[i*4]]++;
      hist.g[p[i*4+1]]++;
      hist.b[p[i*4+2]]++;
    }
    return hist;
  }
  _brailleArt(gray, w, h) {
    let art = '';
    for (let y=0; y<h; y+=4) {
      for (let x=0; x<w; x+=2) {
        let bits = 0;
        for (let dy=0; dy<4; dy++) {
          for (let dx=0; dx<2; dx++) {
            const px = x+dx, py = y+dy;
            if (px<w && py<h && gray[py*w+px] > 128) {
              bits |= 1 << (dy*2 + dx);
            }
          }
        }
        art += String.fromCharCode(0x2800 + bits);
      }
      art += '\n';
    }
    return art;
  }
  _blockArt(gray, w, h) {
    const blocks = [' ', '▘', '▝', '▀', '▖', '▌', '▞', '▛', '▗', '▚', '▐', '▜', '▄', '▙', '▟', '█'];
    let art = '';
    for (let y=0; y<h; y+=2) {
      for (let x=0; x<w; x++) {
        const top = gray[y*w+x] > 128 ? 1 : 0;
        const bottom = (y+1<h && gray[(y+1)*w+x] > 128) ? 2 : 0;
        art += blocks[top | bottom];
      }
      art += '\n';
    }
    return art;
  }
  _emojiArt(gray, w, h) {
    const emojis = ['⚫', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚪'];
    let art = '';
    for (let y=0; y<h; y++) {
      for (let x=0; x<w; x++) {
        const idx = Math.floor(gray[y*w+x] / 255 * (emojis.length-1));
        art += emojis[idx];
      }
      art += '\n';
    }
    return art;
  }
  _heatmap(gray, w, h) {
    const chars = ' ░▒▓█';
    let art = '';
    for (let y=0; y<h; y++) {
      for (let x=0; x<w; x++) {
        const idx = Math.floor(gray[y*w+x] / 255 * (chars.length-1));
        art += chars[idx];
      }
      art += '\n';
    }
    return art;
  }
  _runLengthEncode(arr) {
    let rle = [];
    let count = 1;
    for (let i=1; i<=arr.length; i++) {
      if (i<arr.length && arr[i]===arr[i-1]) count++;
      else { rle.push([arr[i-1], count]); count=1; }
    }
    return JSON.stringify(rle);
  }
  _deltaEncode(arr) {
    let delta = [arr[0]];
    for (let i=1; i<arr.length; i++) delta.push(arr[i] - arr[i-1]);
    return JSON.stringify(delta);
  }
  _svgTrace(gray, w, h) {
    let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`;
    for (let y=0; y<h; y++) {
      for (let x=0; x<w; x++) {
        const v = gray[y*w+x];
        svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${v},${v},${v})"/>`;
      }
    }
    svg += `</svg>`;
    return svg;
  }
  _buildRGBMatrix() {
    const p = this.imageData.data;
    const m = [];
    for (let y=0; y<this.height; y++) {
      const row = [];
      for (let x=0; x<this.width; x++) {
        const idx = (y*this.width + x)*4;
        row.push([p[idx], p[idx+1], p[idx+2]]);
      }
      m.push(row);
    }
    return m;
  }
  _buildGrayscaleMatrix(gray) {
    const m = [];
    for (let y=0; y<this.height; y++) {
      const row = [];
      for (let x=0; x<this.width; x++) row.push(gray[y*this.width + x]);
      m.push(row);
    }
    return m;
  }
  _asciiArt(gray, w, h) {
    const chars = '@%#*+=-:. ';
    let art = '';
    for (let y=0; y<h; y+=2) {
      for (let x=0; x<w; x++) {
        const bright = gray[y*w + x];
        const idx = Math.floor(bright / 255 * (chars.length-1));
        art += chars[idx];
      }
      art += '\n';
    }
    return art;
  }
  _pixelGrid(gray, w, h) {
    let grid = '';
    for (let y=0; y<Math.min(h,20); y++) {
      for (let x=0; x<Math.min(w,40); x++) {
        grid += gray[y*w + x] < 128 ? '⬛' : '⬜';
      }
      grid += '\n';
    }
    return grid + (h>20||w>40 ? '\n... (truncated)' : '');
  }
  async _hash(alg, data) {
    const hashBuffer = await crypto.subtle.digest(alg, new Uint8Array(data));
    return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  _crc32(arr) {
    let crc = 0xFFFFFFFF;
    for (let byte of arr) {
      crc ^= byte;
      for (let bit=0; bit<8; bit++) crc = (crc>>>1) ^ ((crc&1) * 0xEDB88320);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  async _toBase64() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width; canvas.height = this.height;
    canvas.getContext('2d').putImageData(this.imageData, 0, 0);
    return canvas.toDataURL().split(',')[1];
  }
  async _toDataURL() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width; canvas.height = this.height;
    canvas.getContext('2d').putImageData(this.imageData, 0, 0);
    return canvas.toDataURL();
  }
}