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

  // Core conversion dispatcher
  async convert(typeId) {
    const grayArr = this.getGrayscaleArray();
    const rgbArr = this.getRGBArray();
    const w = this.width, h = this.height;

    switch(typeId) {
      case 'binary': return grayArr.map(v => v.toString(2).padStart(8,'0')).join('');
      case 'hex': return grayArr.map(v => v.toString(16).padStart(2,'0')).join(' ');
      case 'octal': return grayArr.map(v => v.toString(8)).join(',');
      case 'byteArray': return `[${grayArr.join(',')}]`;
      case 'uint8Array': return `new Uint8Array([${grayArr.join(',')}])`;
      case 'int16Array': return `new Int16Array([${grayArr.join(',')}])`;
      case 'int32Array': return `new Int32Array([${grayArr.join(',')}])`;
      case 'float32Array': return `new Float32Array([${grayArr.map(v=>v/255).join(',')}])`;
      case 'bitStream': return grayArr.map(v => v.toString(2)).join('');
      case 'base64': { const canvas = document.createElement('canvas'); canvas.width=w; canvas.height=h; canvas.getContext('2d').putImageData(this.imageData,0,0); return canvas.toDataURL(); }
      case 'base32': return btoa(String.fromCharCode(...grayArr)).replace(/=/g,'').toLowerCase(); // simplified
      case 'base85': return btoa(String.fromCharCode(...grayArr)).substring(0,50)+'...'; 
      case 'dataURL': return (await this.toDataURL());
      case 'asciiText': return String.fromCharCode(...grayArr.slice(0,1000));
      case 'jsonData': return JSON.stringify({ width: w, height: h, grayscale: Array.from(grayArr) });
      case 'rgbMatrix': return JSON.stringify(this._buildMatrix(rgbArr, 'rgb'));
      case 'grayscaleMatrix': return JSON.stringify(this._buildMatrix(grayArr, 'gray'));
      case 'cArray': return `unsigned char img[${grayArr.length}] = { ${grayArr.join(', ')} };`;
      case 'pythonBytes': return `img_bytes = bytes([${grayArr.join(', ')}])`;
      case 'javaByteArray': return `byte[] imgData = { ${grayArr.join(', ')} };`;
      case 'jsBuffer': return `Buffer.from([${grayArr.join(', ')}])`;
      case 'asciiArt': return this._asciiArt(grayArr, w, h);
      case 'md5': return await this._hash('MD5', grayArr);
      case 'sha256': return await this._hash('SHA-256', grayArr);
      case 'crc32': return this._crc32(grayArr).toString(16);
      case 'csvPixel': return grayArr.map((v,i) => `${i%w},${Math.floor(i/w)},${v}`).join('\n');
      case 'numpyArray': return `np.array([${grayArr.join(',')}]).reshape(${h},${w})`;
      default: return `[${grayArr.join(',')}]`;  // FULL array, no truncation
    }
  }

  _buildMatrix(data, type) {
    const matrix = [];
    for (let y=0; y<this.height; y++) {
      const row = [];
      for (let x=0; x<this.width; x++) {
        const idx = y*this.width + x;
        if (type === 'rgb') row.push([data[idx*4], data[idx*4+1], data[idx*4+2]]);
        else row.push(data[idx]);
      }
      matrix.push(row);
    }
    return matrix;
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

  async toDataURL() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width; canvas.height = this.height;
    canvas.getContext('2d').putImageData(this.imageData, 0, 0);
    return canvas.toDataURL();
  }
}