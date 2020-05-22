type Matrix = Array<Array<LivingStatus>>
type Coords = [number, number]
type LivingStatus = 'alive' | 'dead'
type BorderMode = 'borders:on' | 'borders:off'
type DrawMode = 'draw:on' | 'draw:off'
type GameState = 'running' | 'stopped'
type MetaMatrix = [Matrix, LivingStatus]

interface GameConfig {
    matrixState: LivingStatus,
    gameState: GameState,
    borderMode: BorderMode,
    drawMode: DrawMode,
    stepCount: number,
    matrix: Matrix,
    pattern?: Matrix,
    threshold: number,
    size: number,
    cellSize: number,
    speed: number
}

type StepwiseReducer = {
    type: 'stepwise',
    matrix: Matrix,
    borderMode: BorderMode
}

type EditReducer = {
    type: 'edit',
    matrix: Matrix,
    location: Coords,
    pattern: Matrix
}

type EmptyReducer = {
    type: 'empty',
    size: number
}

type RandomReducer = {
    type: 'random',
    threshold: number,
    size: number
}

type Reducer = StepwiseReducer | EditReducer | EmptyReducer | RandomReducer

interface CellStateFunc {
    (i: number, j: number, matrix: Matrix): LivingStatus
}

type UpdateType = 'matrix:change' | 'gameState:change' | 'borderMode:change' | 'drawMode:change';
type EmitFn = (type: UpdateType, config: Partial<GameConfig>) => void;
type UpdateFn = (type: UpdateType, config: GameConfig, oldConfig: GameConfig) => void;
