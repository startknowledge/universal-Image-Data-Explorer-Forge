import { CONVERSION_GROUPS } from '../config.js';

export class MenuBuilder {
  constructor(containerId, onSelectCallback) {
    this.container = document.getElementById(containerId);
    this.onSelect = onSelectCallback;
    this.currentActive = null;
    this.render();
  }

  render() {
    this.container.innerHTML = '<div class="conv-menu" id="dynamicMenu"></div>';
    const menuDiv = document.getElementById('dynamicMenu');
    
    CONVERSION_GROUPS.forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'group-item';
      groupDiv.innerHTML = `
        <div class="group-header" data-group="${group.name}">
          <span><i class="${group.icon}"></i> ${group.name}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="conv-items" data-items="${group.name}"></div>
      `;
      const itemsContainer = groupDiv.querySelector('.conv-items');
      group.items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'conv-btn';
        btn.innerHTML = `<i class="fas fa-cog"></i> ${item.name}`;
        btn.dataset.id = item.id;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.conv-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentActive = item.id;
          if (this.onSelect) this.onSelect(item.id, item.name);
        });
        itemsContainer.appendChild(btn);
      });
      
      const header = groupDiv.querySelector('.group-header');
      const itemsDiv = groupDiv.querySelector('.conv-items');
      header.addEventListener('click', () => {
        itemsDiv.classList.toggle('collapsed');
        header.classList.toggle('collapsed');
      });
      
      // All groups start expanded
      itemsDiv.classList.remove('collapsed');
      header.classList.remove('collapsed');
      
      menuDiv.appendChild(groupDiv);
    });
  }

  getActiveId() { return this.currentActive; }
}