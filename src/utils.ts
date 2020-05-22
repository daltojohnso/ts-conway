export const REDUCER = {
    stepwise: ({matrix, borderMode}: Omit<StepwiseReducer, 'type'>) : StepwiseReducer => ({type: 'stepwise', matrix, borderMode}),
    edit: ({location, pattern, matrix}: Omit<EditReducer, 'type'>) : EditReducer => ({type: 'edit', location, pattern, matrix}),
    empty: ({size}: Omit<EmptyReducer, 'type'>) : EmptyReducer => ({type: 'empty', size}),
    random: ({threshold, size}: Omit<RandomReducer, 'type'>) : RandomReducer => ({type: 'random', threshold, size})
};

export function buildMatrix (reducer : Reducer) : MetaMatrix {
    const {type} = reducer;
    switch (type) {
        case 'stepwise':
            reducer = reducer as StepwiseReducer;
            return buildNextMatrix(reducer, getNextCellState(reducer));
        case 'edit':
            reducer = reducer as EditReducer;
            return buildNextMatrix(reducer, addPatternToLocation(reducer))
        case 'empty':
            return buildEmptyMatrix(reducer as EmptyReducer);
        case 'random':
            return buildRandomMatrix(reducer as RandomReducer)
        default:
            throw new Error('Reducer type is incorrect.');
    }
}

function instantiateMatrix (size: number, initCell: CellStateFunc) : Matrix {
    const matrix = [];
    for (let i = 0; i < size; i++) {
      const row: Array<LivingStatus> = [];
      matrix.push(row);

      for (let j = 0; j < size; j++) {
        row.push(initCell(i, j, matrix));
      }
    }

    return matrix;
}

function buildEmptyMatrix ({size}: EmptyReducer) : MetaMatrix {
    return [instantiateMatrix(size, () => 'dead'), 'dead'];
}

function buildRandomMatrix ({size, threshold}: RandomReducer) : MetaMatrix {
    let livingStatus: LivingStatus = 'dead';
    const matrix = instantiateMatrix(size, () => {
        if (Math.random() > threshold) {
            livingStatus = 'alive';
            return 'alive';
        }

        return 'dead';
    })

    return [matrix, livingStatus];
}

function addPatternToLocation ({location: [i, j], pattern}: EditReducer) : CellStateFunc {
    return (x: number, y: number, matrix: Matrix) : LivingStatus => {
        if (i === x && j === y) {
            pattern.forEach((row, iP) => {
                const ix = iP + x;
                row.forEach((state, jP) => {
                    const jy = jP + y;
                    if (matrix[ix] != null && matrix[jy] != null) {
                        matrix[ix][jy] = state;
                    }
                });
            });
        }

        return matrix[x][y];
    }
}

function buildNextMatrix (
    {matrix} : StepwiseReducer | EditReducer,
    getCellState : CellStateFunc): MetaMatrix {
  const l = matrix.length;
  const l2 = matrix[0].length;
  const newMatrix: Matrix = [];
  let isDead = true;
  for (let i = 0; i < l; i++) {
    const row: Array<LivingStatus> = [];
    newMatrix.push(row);
    for (let j = 0; j < l2; j++) {
      const livingStatus = getCellState(i, j, matrix);
      if (livingStatus === 'alive') isDead = false;
      row.push(livingStatus);
    }
  }

  return [newMatrix, isDead ? 'dead' : 'alive'];
}

function getNextCellState ({borderMode}: StepwiseReducer) : CellStateFunc {
    return (i: number, j: number, matrix: Matrix) => {
        const currentLivingStatus = matrix[i][j];
        const num = countNeighbors(i, j, matrix, borderMode);

        // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        // Any live cell with two or three live neighbours lives on to the next generation.
        // Any live cell with more than three live neighbours dies, as if by overpopulation.
        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

        const isAlive = currentLivingStatus === 'alive'
          ? num === 2 || num === 3
          : num === 3; // || (num === 2 && Math.random() > 0.99);
        return isAlive ? 'alive' : 'dead';
    };
}

function countNeighbors(i: number, j: number, matrix: Matrix, borderMode: BorderMode) : number {
  const l = matrix.length;
  const l2 = matrix[i].length;
  let yIndices;
  let xIndices;
  if (borderMode === 'borders:on') {
      yIndices = [i - 1, i, i + 1].filter(num => num >= 0 && num < l);
      xIndices = [j - 1, j, j + 1].filter(num => num >= 0 && num < l2);
  } else {
      yIndices = [
          i === 0 ? l - 1 : i - 1,
          i,
          (i + 1) % l
      ];
      xIndices = [
          j === 0 ? l2 - 1 : j - 1,
          j,
          (j + 1) % l2
      ];
  }

  let num = 0;

  for (let ii = 0; ii < yIndices.length; ii++) {
    for (let jj = 0; jj < xIndices.length; jj++) {
      const y = yIndices[ii];
      const x = xIndices[jj];
      if (y === i && x === j) continue;

      if (matrix[y][x] === 'alive') {
        num += 1;
      }
    }
  }

  return num;
}
