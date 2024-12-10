export class Grid {
  constructor(cellSize = 20) {
    this.cellSize = cellSize;
  }

  draw(ctx, width, height, pan, zoom) {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;

    const startX = pan.x % (this.cellSize * zoom);
    const startY = pan.y % (this.cellSize * zoom);

    ctx.beginPath();
    for (let x = startX; x < width; x += this.cellSize * zoom) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY; y < height; y += this.cellSize * zoom) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }
}