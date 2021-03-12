import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        // Considerar usar outro valor como key
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  // Pode ser refatorado. Código redundante.
  renderHighLightedSquare(i) {
    return (
      <Square
        // Considerar usar outro valor como key
        key={i}
        value={this.props.squares[i]}
        color='yellow'
        onClick={() => this.props.onClick(i)}
      />
    )
  }

  render() {
    const highlightedLine = this.props.highlightedLine;
    let squares = Array();
    let rows = Array();
    // Motivo para a complexidade da estrutura: Renderização depende do indice
    for (let i = 0; i < 9; i++ ) {
      let isFromHighlighted = i === highlightedLine[0] || i === highlightedLine[1] || i === highlightedLine[2];
      if(highlightedLine && isFromHighlighted) {
        squares.push(this.renderHighLightedSquare(i));
      } else {
        squares.push(this.renderSquare(i));
      }
      if( squares.length % 3 === 0 ) {
        rows.push(
          <div
            key={Math.floor(i/3)}
            className="board-row">
            {squares}
          </div>
        );
        squares = Array();
      }
    }

    return (
      <div>
        {rows}
      </div>
    )
  }
}

class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
        onClick={() => { this.props.onClick() }}
        color={this.props.color}
      >
        {this.props.value}
      </button>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      boldSelectedStep: false,
      stepNumber: 0,
      xIsNext: true,
      flipMoveList: false,
      highlightedLine: false,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0,this.state.stepNumber + 1);
    const current = history[history.length - 1]
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i] ){
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
        coord: getSquareCoords(i)
      }]),
      boldSelectedStep: false,
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      boldSelectedStep: true,
      xIsNext: (step % 2 ) === 0,
    })
  }

  sort() {
    const flipMoveList = this.state.flipMoveList;

    flipMoveList ?
      this.setState({ flipMoveList: false}):
      this.setState({flipMoveList: true});
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const winnerLine = calculateWinnerLine(current.squares);
    const boldSelectedStep = this.state.boldSelectedStep;
    const flipMoveList = this.state.flipMoveList;

    let status;
    if(winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    // `move` referencia indice do history
    const moves = history.map((step,move) => {
      let desc;
      let listItemComponent;

      if (move) {
        const row = history[move].coord.row;
        const col = history[move].coord.col;
        desc = `Go to move #${move} (row ${row},col ${col})`
      } else {
        desc = `Go to game start`
      }


      if ( boldSelectedStep && move === this.state.stepNumber ) {
        listItemComponent = (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}><b>{desc}</b></button>
          </li>
        )
      } else {
        listItemComponent =(
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        )
      }

      return listItemComponent;
    })

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            highlightedLine={winnerLine}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{flipMoveList?moves.reverse():moves}</ol>
          <button onClick={() => this.sort()}>Sort</button>
        </div>
      </div>
    );
  }
}

// =============================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
)

function calculateWinner(squares) {
  const lines = getLines()

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function calculateWinnerLine(squares) {
  const lines = getLines();

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return false;
}

function getLines() {
  return [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
}

function getSquareCoords(squareIndex){
  const coords = [
    {'row': '0', 'col': '0'},
    {'row': '0', 'col': '1'},
    {'row': '0', 'col': '2'},
    {'row': '1', 'col': '0'},
    {'row': '1', 'col': '1'},
    {'row': '1', 'col': '2'},
    {'row': '2', 'col': '0'},
    {'row': '2', 'col': '1'},
    {'row': '2', 'col': '2'},
  ];

  return coords[squareIndex];
}