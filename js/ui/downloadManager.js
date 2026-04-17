// js/ui/downloadManager.js
export class DownloadManager {
  download(content, format, rawBinary = null) {
    let blob, filename;
    if (format === 'bin' && rawBinary) {
      blob = new Blob([rawBinary], {type: 'application/octet-stream'});
      filename = 'image_data.bin';
    } else {
      let ext = format === 'c' ? 'c' : format === 'python' ? 'py' : format === 'java' ? 'java' : format === 'js' ? 'js' : 'txt';
      let finalContent = content;
      if (format === 'c') finalContent = `// Image Data\n${content}`;
      if (format === 'python') finalContent = `# Python bytes\n${content}`;
      blob = new Blob([finalContent], {type: 'text/plain'});
      filename = `image_export.${ext}`;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}