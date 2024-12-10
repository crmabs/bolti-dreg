import { Shape } from './shapes.js';
import { Grid } from './grid.js';
import { SelectionManager } from './selection-manager.js';

export class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.shapes = [];
    this.grid = new Grid();
    this.selectionManager = new SelectionManager();
    this.isDragging = false;
    this.isPanning = false;
    this.dragStart = { x: 0, y: 0 };
    this.pan = { x: 0, y: 0 };
    this.zoom = 1;
    this.draggedShape = null;
    this.virtualWidth = 3200;
    this.virtualHeight = 2400;

    this.setupEventListeners();
    this.resize();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.draw();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('resize', this.resize.bind(this));
  }

  handleMouseDown(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.pan.x) / this.zoom;
    const y = (e.clientY - rect.top - this.pan.y) / this.zoom;

    if (e.button === 2) {
      this.isPanning = true;
      this.dragStart = { x: e.clientX - this.pan.x, y: e.clientY - this.pan.y };
      return;
    }

    if (e.shiftKey) {
      this.selectionManager.startSelection(x, y);
    } else {
      this.isDragging = true;
      this.dragStart = { x, y };
      
      let clickedShape = null;
      for (let shape of this.shapes) {
        if (shape.isPointInside(x, y)) {
          clickedShape = shape;
          break;
        }
      }

      if (clickedShape) {
        this.draggedShape = clickedShape;
        if (!this.selectionManager.selectedShapes.has(clickedShape)) {
          if (!e.ctrlKey) {
            this.selectionManager.clearSelection(this.shapes);
          }
          clickedShape.selected = true;
          this.selectionManager.selectedShapes.add(clickedShape);
        }
      } else if (!e.ctrlKey) {
        this.selectionManager.clearSelection(this.shapes);
      }
    }
    this.draw();
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.pan.x) / this.zoom;
    const y = (e.clientY - rect.top - this.pan.y) / this.zoom;

    if (this.isPanning) {
      const newPanX = e.clientX - this.dragStart.x;
      const newPanY = e.clientY - this.dragStart.y;
      
      const minX = this.canvas.width - this.virtualWidth * this.zoom;
      const minY = this.canvas.height - this.virtualHeight * this.zoom;
      
      this.pan.x = Math.min(0, Math.max(minX, newPanX));
      this.pan.y = Math.min(0, Math.max(minY, newPanY));
    } else if (this.selectionManager.isSelecting) {
      this.selectionManager.updateSelection(x, y);
    } else if (this.isDragging && this.draggedShape) {
      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;
      
      this.selectionManager.selectedShapes.forEach(shape => {
        shape.x += dx;
        shape.y += dy;
      });
      
      this.dragStart = { x, y };
    }
    
    this.draw();
  }

  handleMouseUp(e) {
    if (this.selectionManager.isSelecting) {
      this.selectionManager.finishSelection(this.shapes);
    }

    this.isDragging = false;
    this.isPanning = false;
    this.draggedShape = null;
    this.draw();
  }

  handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(2.0, this.zoom * delta));
    
    if (newZoom !== this.zoom) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.zoom = newZoom;
      this.draw();
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Delete') {
      this.shapes = this.shapes.filter(shape => !this.selectionManager.selectedShapes.has(shape));
      this.selectionManager.selectedShapes.clear();
      this.draw();
    } else if (e.key === 'Escape') {
      this.selectionManager.clearSelection(this.shapes);
      this.draw();
    }
  }

  addShape(type, x, y, width, height, color, label) {
    const shape = new Shape(type, x, y, width, height, color, label);
    this.shapes.push(shape);
    this.draw();
    return shape;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.translate(this.pan.x, this.pan.y);
    this.ctx.scale(this.zoom, this.zoom);
    
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1 / this.zoom;
    this.ctx.strokeRect(0, 0, this.virtualWidth, this.virtualHeight);
    
    this.grid.draw(this.ctx, this.virtualWidth, this.virtualHeight, this.pan, this.zoom);
    
    this.shapes.forEach(shape => shape.draw(this.ctx));
    
    if (this.selectionManager.isSelecting) {
      this.selectionManager.drawSelectionBox(this.ctx);
    }
    
    this.ctx.restore();
  }
}