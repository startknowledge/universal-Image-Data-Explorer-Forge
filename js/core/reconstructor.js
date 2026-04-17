export class Reconstructor {
  static parseToBytes(data, format, width, height) {
    let bytes = [];
    const expectedLen = width * height;

    switch(format) {
      case 'binary':
        const bits = data.replace(/\s/g, '');
        if (bits.length !== expectedLen * 8) throw new Error(`Binary length mismatch: expected ${expectedLen*8} bits`);
        for (let i=0; i<expectedLen; i++) {
          bytes.push(parseInt(bits.substr(i*8, 8), 2));
        }
        break;
      case 'hex':
        const hexVals = data.trim().split(/\s+/);
        if (hexVals.length !== expectedLen) throw new Error(`Hex count mismatch: expected ${expectedLen}`);
        bytes = hexVals.map(h => parseInt(h, 16));
        break;
      case 'base64':
        const binaryStr = atob(data);
        for (let i=0; i<binaryStr.length && bytes.length<expectedLen; i++) {
          bytes.push(binaryStr.charCodeAt(i));
        }
        break;
      case 'byteArray':
        const match = data.match(/\[([\d,\s]+)\]/);
        if (match) bytes = match[1].split(',').map(Number);
        else throw new Error('Invalid byte array format');
        break;
      case 'cArray':
        const cMatch = data.match(/\{([\d,\s]+)\}/);
        if (cMatch) bytes = cMatch[1].split(',').map(Number);
        else throw new Error('Invalid C array format');
        break;
      case 'pythonBytes':
        const pyMatch = data.match(/bytes\(\[([\d,\s]+)\]\)/);
        if (pyMatch) bytes = pyMatch[1].split(',').map(Number);
        else throw new Error('Invalid Python bytes format');
        break;
      case 'jsonArray':
        let arr = JSON.parse(data);
        if (Array.isArray(arr)) bytes = arr;
        else throw new Error('JSON must be an array');
        break;
      default:
        throw new Error('Unsupported revert format');
    }

    if (bytes.length !== expectedLen) throw new Error(`Data length ${bytes.length} != ${expectedLen} pixels`);
    return new Uint8Array(bytes);
  }

  static reconstructImage(bytes, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    for (let i=0; i<width*height; i++) {
      const val = bytes[i];
      imgData.data[i*4] = val;
      imgData.data[i*4+1] = val;
      imgData.data[i*4+2] = val;
      imgData.data[i*4+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }
}