// Grouped conversion definitions (60+ formats)
export const CONVERSION_GROUPS = [
  {
    name: "A. Binary / Low Level Data",
    icon: "fa-solid fa-database",
    items: [
      { id: "binary", name: "Binary (bits)", category: "binary" },
      { id: "hex", name: "Hexadecimal", category: "binary" },
      { id: "octal", name: "Octal Array", category: "binary" },
      { id: "byteArray", name: "Byte Array", category: "binary" },
      { id: "uint8Array", name: "Uint8 Array", category: "binary" },
      { id: "int16Array", name: "Int16 Array", category: "binary" },
      { id: "int32Array", name: "Int32 Array", category: "binary" },
      { id: "float32Array", name: "Float32 Array", category: "binary" },
      { id: "bitStream", name: "Bit Stream", category: "binary" }
    ]
  },
  {
    name: "B. Encoding Formats",
    icon: "fa-solid fa-code",
    items: [
      { id: "base64", name: "Base64", category: "encoding" },
      { id: "base32", name: "Base32", category: "encoding" },
      { id: "base85", name: "Base85 (Ascii85)", category: "encoding" },
      { id: "dataURL", name: "Data URL", category: "encoding" },
      { id: "urlEncoded", name: "URL Encoded", category: "encoding" },
      { id: "asciiText", name: "ASCII Text", category: "encoding" },
      { id: "utf8Text", name: "UTF-8 Text", category: "encoding" },
      { id: "jsonData", name: "JSON Data", category: "encoding" }
    ]
  },
  {
    name: "C. Pixel Data Formats",
    icon: "fa-solid fa-palette",
    items: [
      { id: "rgbMatrix", name: "RGB Matrix", category: "pixel" },
      { id: "rgbaMatrix", name: "RGBA Matrix", category: "pixel" },
      { id: "grayscaleMatrix", name: "Grayscale Matrix", category: "pixel" },
      { id: "hslMatrix", name: "HSL Matrix", category: "pixel" },
      { id: "hsvMatrix", name: "HSV Matrix", category: "pixel" },
      { id: "cmykMatrix", name: "CMYK Matrix", category: "pixel" },
      { id: "yuvMatrix", name: "YUV Matrix", category: "pixel" },
      { id: "labColor", name: "LAB Color Data", category: "pixel" },
      { id: "colorHistogram", name: "Color Histogram", category: "pixel" }
    ]
  },
  {
    name: "D. Programming Languages",
    icon: "fa-solid fa-laptop-code",
    items: [
      { id: "cArray", name: "C Array (uint8)", category: "prog" },
      { id: "cppArray", name: "C++ Array", category: "prog" },
      { id: "pythonBytes", name: "Python Bytes", category: "prog" },
      { id: "javaByteArray", name: "Java byte[]", category: "prog" },
      { id: "goSlice", name: "Go Byte Slice", category: "prog" },
      { id: "rustArray", name: "Rust Byte Array", category: "prog" },
      { id: "jsBuffer", name: "JavaScript Buffer", category: "prog" },
      { id: "phpBinary", name: "PHP Binary String", category: "prog" },
      { id: "swiftData", name: "Swift Data", category: "prog" },
      { id: "kotlinByteArray", name: "Kotlin ByteArray", category: "prog" }
    ]
  },
  {
    name: "E. Visualization Formats",
    icon: "fa-solid fa-chart-simple",
    items: [
      { id: "asciiArt", name: "ASCII Art", category: "vis" },
      { id: "brailleArt", name: "Braille Art", category: "vis" },
      { id: "blockArt", name: "Block Art", category: "vis" },
      { id: "emojiArt", name: "Emoji Art", category: "vis" },
      { id: "pixelGrid", name: "Pixel Grid", category: "vis" },
      { id: "heatmap", name: "Heatmap (ASCII)", category: "vis" }
    ]
  },
  {
    name: "F. Compression / Security",
    icon: "fa-solid fa-shield-haltered",
    items: [
      { id: "rle", name: "Run Length Encoding", category: "compress" },
      { id: "deltaEncoding", name: "Delta Encoded Pixels", category: "compress" },
      { id: "md5", name: "MD5 Hash", category: "hash" },
      { id: "sha1", name: "SHA1 Hash", category: "hash" },
      { id: "sha256", name: "SHA256 Hash", category: "hash" },
      { id: "crc32", name: "CRC32 Checksum", category: "hash" }
    ]
  },
  {
    name: "G. AI / Data Science",
    icon: "fa-solid fa-brain",
    items: [
      { id: "numpyArray", name: "NumPy Array", category: "ai" },
      { id: "tensor", name: "Tensor (3D)", category: "ai" },
      { id: "csvPixel", name: "CSV Pixel Data", category: "ai" },
      { id: "pandasDF", name: "Pandas DataFrame", category: "ai" },
      { id: "featureVector", name: "Feature Vector", category: "ai" }
    ]
  },
  {
    name: "H. Web / Browser Formats",
    icon: "fa-solid fa-globe",
    items: [
      { id: "svgTrace", name: "SVG Trace (basic)", category: "web" },
      { id: "cssDataUri", name: "CSS Data URI", category: "web" },
      { id: "canvasData", name: "Canvas ImageData", category: "web" }
    ]
  }
];

// Maps each converter ID to its processing function name (implemented in main processor)
export const converterFunctionMap = {
  binary: "toBinary", hex: "toHex", octal: "toOctal", byteArray: "toByteArray",
  uint8Array: "toUint8Array", int16Array: "toInt16Array", int32Array: "toInt32Array",
  float32Array: "toFloat32Array", bitStream: "toBitStream",
  base64: "toBase64", base32: "toBase32", base85: "toBase85", dataURL: "toDataURL",
  urlEncoded: "toUrlEncoded", asciiText: "toAsciiText", utf8Text: "toUtf8Text", jsonData: "toJsonData",
  rgbMatrix: "toRgbMatrix", rgbaMatrix: "toRgbaMatrix", grayscaleMatrix: "toGrayscaleMatrix",
  hslMatrix: "toHslMatrix", hsvMatrix: "toHsvMatrix", cmykMatrix: "toCmykMatrix", yuvMatrix: "toYuvMatrix",
  labColor: "toLabColor", colorHistogram: "toColorHistogram",
  cArray: "toCArray", cppArray: "toCppArray", pythonBytes: "toPythonBytes", javaByteArray: "toJavaByteArray",
  goSlice: "toGoSlice", rustArray: "toRustArray", jsBuffer: "toJsBuffer", phpBinary: "toPhpBinary",
  swiftData: "toSwiftData", kotlinByteArray: "toKotlinByteArray",
  asciiArt: "toAsciiArt", brailleArt: "toBrailleArt", blockArt: "toBlockArt", emojiArt: "toEmojiArt",
  pixelGrid: "toPixelGrid", heatmap: "toHeatmap",
  rle: "toRLE", deltaEncoding: "toDeltaEncoding", md5: "toMD5", sha1: "toSHA1", sha256: "toSHA256", crc32: "toCRC32",
  numpyArray: "toNumpyArray", tensor: "toTensor", csvPixel: "toCSV", pandasDF: "toPandasDF", featureVector: "toFeatureVector",
  svgTrace: "toSvgTrace", cssDataUri: "toCssDataUri", canvasData: "toCanvasData"
};