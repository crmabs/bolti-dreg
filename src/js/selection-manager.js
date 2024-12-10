export class SelectionManager {
  constructor() {
    this.selectionBox = { x: 0, y: 0, width: 0, height: 0 };
    this.isSelecting = false;
    this.selectedShapes = new Set();
  }

  startSelection(x, y) {
    this.isSelecting = true;
    this.selectionBox = { x, y, width: 0, height: 0 };
  }

  updateSelection(x, y) {
    if (!this.isSelecting) return;
    
    this.selectionBox.width = x - this.selectionBox.x;
    this.selectionBox.height = y - this.selectionBox.y;
  }

  drawSelectionBox(ctx) {
    if (!this.isSelecting) return;

    // Draw semi-transparent selection area
    ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
    ctx.fillRect(
      this.selectionBox.x,
      this.selectionBox.y,
      this.selectionBox.width,
      this.selectionBox.height
    );

    // Draw selection border
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      this.selectionBox.x,
      this.selectionBox.y,
      this.selectionBox.width,
      this.selectionBox.height
    );
    ctx.setLineDash([]);

    // Draw selection dimensions
    const width = Math.abs(this.selectionBox.width);
    const height = Math.abs(this.selectionBox.height);
    ctx.fillStyle = '#2196F3';
    ctx.font = '12px Arial';
    ctx.fillText(
      `${Math.round(width)} × ${Math.round(height)}`,
      this.selectionBox.x + this.selectionBox.width / 2,
      this.selectionBox.y + this.selectionBox.height + 20
    );
  }

  finishSelection(shapes) {
    if (!this.isSelecting) return;

    const left = Math.min(this.selectionBox.x, this.selectionBox.x + this.selectionBox.width);
    const right = Math.max(this.selectionBox.x, this.selectionBox.x + this.selectionBox.width);
    const top = Math.min(this.selectionBox.y, this.selectionBox.y + this.selectionBox.height);
    const bottom = Math.max(this.selectionBox.y, this.selectionBox.y + this.selectionBox.height);

    shapes.forEach(shape => {
      if (this.isShapeInSelection(shape, left, right, top, bottom)) {
        shape.selected = true;
        this.selectedShapes.add(shape);
      }
    });

    this.isSelecting = false;
  }

  isShapeInSelection(shape, left, right, top, bottom) {
    // Check if any corner of the shape is inside selection
    const corners = [
      { x: shape.x, y: shape.y },
      { x: shape.x + shape.width, y: shape.y },
      { x: shape.x, y: shape.y + shape.height },
      { x: shape.x + shape.width, y: shape.y + shape.height }
    ];

    return corners.some(corner => 
      corner.x >= left && corner.x <= right &&
      corner.y >= top && corner.y <= bottom
    );
  }

  clearSelection(shapes) {
    this.selectedShapes.clear();
    shapes.forEach(shape => shape.selected = false);
  }
}