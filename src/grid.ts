import {initHover} from './hover';

export function initializeGrid (
    config: GameConfig,
    canvases: Record<'grid' | 'hover', HTMLCanvasElement>,
    emit: EmitFn
): UpdateFn {
    drawGridlines(canvases.grid, config);
    const updateHover = initHover(canvases.hover, config, emit);
    return (type: UpdateType, config: GameConfig, oldConfig: GameConfig) => {
        updateHover(type, config, oldConfig);
        if (type === 'matrix:change') {
            drawCells(canvases.grid, config);
        }
    };
}

const gridlines = (size: number) => `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
     <defs>
        <pattern id="smallGrid" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
            <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="gray" stroke-width="0.5" />
        </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#smallGrid)" />
</svg>`;

export function drawGridlines (canvas: HTMLCanvasElement, config: GameConfig): void {
    const img = new Image();
    const svg = new Blob([gridlines(config.cellSize)], { type: 'image/svg+xml;charset=utf-8' });
    const url = window.URL.createObjectURL(svg);
    img.src = url;
    img.onload = () => {
        const ctx = get2dContext(canvas);
        ctx.drawImage(img, 0, 0);
        window.URL.revokeObjectURL(url);
    }
}

function drawCells (canvas: HTMLCanvasElement, config: GameConfig): void {
    const {matrix, cellSize} = config;
    const ctx = get2dContext(canvas);
    matrix.forEach((row, i) => {
        row.forEach((livingStatus, j) => {
            if (livingStatus === 'alive') {
                ctx.fillRect((i * cellSize) + 1, (j * cellSize) + 1, cellSize - 2, cellSize - 2);
            } else {
                ctx.clearRect((i * cellSize) + 1, (j * cellSize) + 1, cellSize - 2, cellSize - 2);
            }
        })
    })
}

export function get2dContext (canvas: HTMLCanvasElement) : CanvasRenderingContext2D {
    const context = canvas.getContext('2d');
    if (context === null) throw new Error('Context is null.');
    return context;
}
