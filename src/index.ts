import {REDUCER, buildMatrix} from './utils';
import {initializeConfigPanel} from './config-panel';
import {initializeGrid} from './grid';

const els = getEls();
let config = buildInitialGameConfig();
let subscribers: UpdateFn[] = [
    initializeGrid(config, els.canvases, emit),
    initializeConfigPanel(config, els.panel, emit)
];
startGame();

function emit (type: UpdateType, partialConfig: Partial<GameConfig>): void {
    const oldConfig = config;

    switch (type) {
        case 'matrix:change':
            break;
        case 'gameState:change':
            break;
        case 'borderMode:change':
            break;
        case 'drawMode:change':
            break;
    }

    config = {
        ...config,
        ...partialConfig
    }

    subscribers.forEach(notify => {
        notify(type, config, oldConfig);
    });
}

function startGame (): number {
    return setInterval(() => {
        if (isPaused(config)) return;
        const {borderMode, stepCount, matrix} = config;
        const [
            nextMatrix,
            nextMatrixState
        ] = buildMatrix(REDUCER.stepwise({matrix, borderMode}));

        emit('matrix:change', {
            matrix: nextMatrix,
            matrixState: nextMatrixState,
            stepCount: stepCount + 1
        });

    }, config.speed);
}

function isPaused (config: GameConfig): boolean {
    return config.gameState === 'stopped' || config.matrixState === 'dead';
}

function buildInitialGameConfig (): GameConfig {
    const initialSize = 50;
    const initialThreshold = 0.66;
    const [initialMatrix, matrixState] = buildMatrix(REDUCER.random({
        size: initialSize,
        threshold: initialThreshold
    }));

    return {
        matrixState,
        gameState: 'running',
        borderMode: 'borders:off',
        drawMode: 'draw:off',
        stepCount: 1,
        matrix: initialMatrix,
        threshold: initialThreshold,
        size: initialSize,
        cellSize: 15,
        speed: 100,
        pattern: [['alive']]
    }
}

function getEls () {
    return {
        canvases: {
            grid: document.querySelector('.game__grid') as HTMLCanvasElement,
            hover: document.querySelector('.game__hover')  as HTMLCanvasElement,
        },
        panel: {
            stepCountInput: document.querySelector('.config__step-count') as HTMLInputElement,
            stopStartButton: document.querySelector('.config__stop-start-button') as HTMLButtonElement,
            clearButton: document.querySelector('.config__clear-button') as HTMLButtonElement,
            randomButton: document.querySelector('.config__random-button') as HTMLButtonElement,
            drawModeInput: document.querySelector('.config__drawmode-checkbox') as HTMLInputElement,
            borderModeInput: document.querySelector('.config__bordermode-checkbox') as HTMLInputElement
        }
    };
}
