import {REDUCER, buildMatrix} from './utils';

export function initializeConfigPanel (config: GameConfig, els: {
    stepCountInput: HTMLInputElement,
    drawModeInput: HTMLInputElement,
    borderModeInput: HTMLInputElement,
    stopStartButton: HTMLButtonElement,
    clearButton: HTMLButtonElement,
    randomButton: HTMLButtonElement
}, emit: EmitFn): UpdateFn {
    const {
        stepCountInput,
        drawModeInput,
        borderModeInput,
        stopStartButton,
        clearButton,
        randomButton
    } = els;

    stopStartButton.addEventListener('click', () => {
        emit('gameState:change', {
            gameState: config.gameState === 'stopped' ? 'running' : 'stopped'
        });
    });

    clearButton.addEventListener('click', () => {
        const [
            matrix,
            matrixState
        ] = buildMatrix(REDUCER.empty({size: config.size}));
        emit('matrix:change', {
            matrix,
            matrixState,
            stepCount: 1
        });
    });

    randomButton.addEventListener('click', () => {
        const [
            matrix,
            matrixState
        ] = buildMatrix(REDUCER.random({size: config.size, threshold: config.threshold}));
        emit('matrix:change', {
            matrix,
            matrixState,
            stepCount: 1
        });
    });

    borderModeInput.addEventListener('click', () => {
        emit('borderMode:change', {
            borderMode: borderModeInput.checked ? 'borders:on' : 'borders:off'
        });
    });

    drawModeInput.addEventListener('click', () => {
        emit('drawMode:change', {
            drawMode: drawModeInput.checked ? 'draw:on' : 'draw:off'
        });
    });

    return (type: UpdateType, newConfig: GameConfig) => {
        config = newConfig;
        if (type === 'matrix:change') {
            updateStepCount(stepCountInput, config);
        }
    };
}

function updateStepCount (stepCountInput: HTMLInputElement, config: GameConfig): void {
    stepCountInput.value = `${config.stepCount}`;
}
