export class MenuManager {
  constructor(menuBar) {
    this.menuBar = menuBar;
    this.items = [
      { label: 'A', color: '#FF6B6B' },
      { label: 'B', color: '#4ECDC4' },
      { label: 'C', color: '#FFD93D' },
      { label: 'D', color: '#95A5A6' }
    ];
    
    this.createMenuItems();
  }

  createMenuItems() {
    this.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'draggable-item';
      div.style.backgroundColor = item.color;
      div.textContent = item.label;
      div.draggable = true;
      
      div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
      });
      
      this.menuBar.appendChild(div);
    });
  }
}