import {REDUCER, buildMatrix} from './utils';
import {get2dContext} from './grid';

let canvas: HTMLCanvasElement;
let config: GameConfig;
let xy: Coords = [-1, -1];
let totalWidth = 0;
let isClicking = false;
let emit: EmitFn;

export function initHover (
    _canvas: HTMLCanvasElement,
    _config: GameConfig,
    _emit: EmitFn
): UpdateFn {
    config = _config;
    canvas = _canvas;
    emit = _emit;

    totalWidth = config.size * config.cellSize + 1;

    canvas.addEventListener('mousedown', onMousedown);
    canvas.addEventListener('mousemove', onMousemove);
    canvas.addEventListener('mouseout', onMouseout);
    document.addEventListener('mouseup', onMouseup);

    return (type: UpdateType, updatedConfig: GameConfig): void => {
        type; // clearing the compilation err
        config = updatedConfig;
    };
}

function isHoverOn ({pattern, drawMode}: GameConfig): boolean {
    return !!pattern && drawMode === 'draw:on';
}

function onMousedown (event: MouseEvent): void {
    const {cellSize} = config;
    if (!isHoverOn(config)) return;
    const {offsetX, offsetY} = event;
    const x = offsetX / cellSize | 0;
    const y = offsetY / cellSize | 0;
    isClicking = true;
    xy = [x, y];
    placePattern([x, y]);
}

function onMousemove (event: MouseEvent): void {
    const {cellSize} = config;
    if (!isHoverOn(config)) return;

    const {offsetX, offsetY} = event;
    const x = offsetX / cellSize | 0;
    const y = offsetY / cellSize | 0;
    const [X, Y] = xy;
    if (x !== X || y != Y) {
        clearHover();
        xy = [x, y];
        drawPatternHover(xy);
        if (isClicking) placePattern([x, y]);
    }
}

function placePattern (location: Coords) {
    const {matrix, pattern} = config;
    if (!pattern) return;

    const [
        nextMatrix,
        nextMatrixState
    ] = buildMatrix(REDUCER.edit({location, pattern, matrix}));

    emit('matrix:change', {
        matrix: nextMatrix,
        matrixState: nextMatrixState,
    });
}

function onMouseout (): void {
    clearHover();
}

function onMouseup (): void {
    isClicking = false;
    xy = [-1, -1];
}

function clearHover () {
    const ctx = get2dContext(canvas);
    ctx.clearRect(0, 0, totalWidth, totalWidth);
}

function drawPatternHover ([x, y]: Coords) {
    const {pattern, matrix, cellSize} = config;
    if (!pattern) return;
    const ctx = get2dContext(canvas);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'red';
    pattern.forEach((row, i) => {
        row.forEach((state, j) => {
            const xi = x + i;
            const yj = y + j;
            if (matrix[xi] != null && matrix[xi][yj] != null) {
                ctx.fillRect(xi * cellSize, yj * cellSize, cellSize, cellSize);
                if (state) ctx.fillRect(xi * cellSize, yj * cellSize, cellSize, cellSize);
            }
        })
    });
}
