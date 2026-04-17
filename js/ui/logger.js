// js/ui/logger.js
export class Logger {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
  }
  log(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : '📌';
    this.element.innerHTML = `${prefix} [${time}] ${msg}<br>${this.element.innerHTML}`;
    if (this.element.children.length > 12) this.element.lastElementChild?.remove();
  }
}