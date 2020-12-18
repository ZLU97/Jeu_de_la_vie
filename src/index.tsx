import React, {useState, useRef, useEffect} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ButtonToolbar, Dropdown, DropdownButton } from 'react-bootstrap';

interface BoxProps {
selectBox: (row: number, col: number) => void; 
row: number; 
col: number; 
boxClass: string; 
id : string
}

const Box = ({ selectBox, row, col, boxClass, id }: BoxProps):React.ReactElement => {

	const handleClick = () => {
		selectBox(row, col);
	}


		return(
			<div
			className = {boxClass}
			id = {id}
			onClick = {handleClick}
			/>
		);

}


interface GridProps {
	cols : number;
	rows : number;
	gridFull : boolean[][];
	selectBox: (row: number, col: number) => void
}

const Grid = ({ cols, rows, gridFull, selectBox}: GridProps): React.ReactElement => {

		const width: number = (cols  * 14);
		const rowsArr: React.ReactElement[] = [];

		let boxClass: string = "";

		console.log('grid ');
		console.log(gridFull);
		console.log('row ' + rows);
		console.log('col ' + cols);

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				let boxId = i + "_" + j;
				
				boxClass = gridFull[i][j] ? "box on" : "box off";
				rowsArr.push(
					<Box
					boxClass = {boxClass}
					id = {boxId}
					row = {i}
					col = {j}
					selectBox = {selectBox}
					/>
				);
			}
		}

		return(
			<div className="grid" style={{width: width}}>
			{rowsArr}
			</div>
		);
	}



interface ButtonProps {
	gridSize: (size: string | null) => void ;
	playButton: () => void ;
	pauseButton: () => void ;
	clear: () => void ;
	slow: () => void;
	fast: () => void ;
	seed: () => void 

}

const Buttons = ({gridSize, playButton, pauseButton, clear, slow, fast, seed}: ButtonProps): React.ReactElement => {

	const handleSelect = (eventKey: string | null, e: React.SyntheticEvent<unknown>) => {
		gridSize(eventKey);
	}

	return (
		<div className = "center">
			<ButtonToolbar>
				<button onClick = {playButton}>
					Play 
				</button>

				<button onClick = {pauseButton}>
					Pause
				</button>

				<button onClick = {clear}>
					Clear
				</button>

				<button onClick = {slow}>
					Slow
				</button>

				<button onClick = {fast}>
					Fast
				</button>

				<button onClick = {seed}>
					Seed
				</button>

				<DropdownButton
					title = "Grid Size"
					id = "size-menu"
					onSelect = {handleSelect}
				>
					<Dropdown.Item eventKey = "1"> 20x10 </Dropdown.Item>
					<Dropdown.Item eventKey = "2"> 50x30 </Dropdown.Item>
					<Dropdown.Item eventKey = "3"> 70x50 </Dropdown.Item>
				 </DropdownButton>
			</ButtonToolbar>
		</div>


		);
	}



interface MainProps {
	defaultSpeed: number;
	defaultRows: number;
	defaultCols: number
}

const Main = ({ defaultSpeed, defaultRows, defaultCols }: MainProps): React.ReactElement => {


	const [speed, setSpeed] = useState(defaultSpeed);
	const [rows, setRows] = useState(defaultRows);
	const [cols, setCols] = useState(defaultCols);
	const [generation, setGeneration] = useState(0);
	const [gridFull, setGrid] = useState<boolean[][]>(initGrid(rows, cols));
	const [isPlaying, setPlaying] = useState(false);

	const selectBox = (row: number, col: number) => {

		let gridCopy = arrayClone(gridFull);
		gridCopy[row][col] = !gridCopy[row][col]; 
		setGrid(gridCopy);
	}

	const seed = () => {

		let gridCopy = arrayClone(gridFull);
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				if (Math.floor(Math.random() *4) === 1){
					gridCopy[i][j] = true;
				}
			}
		}

		setGrid(gridCopy);

	}

	const playButton = () => {
		setPlaying(true);
	}

	const pauseButton = () => {
		setPlaying(false);
	}

	const slow = () => {
		setSpeed(1000);
		playButton();
	}

	const fast = () => {
		setSpeed(100);
		playButton();
	}

	const clear = () => {

		var grid = initGrid(rows, cols);
		setGrid(grid);
		setGeneration(0);
	}

	// FIXME ne marche pas à cause de l'asynchronisme de setState
	const gridSize = (size: string | null) => {
		switch(size) {
			case "1":
				setGrid(initGrid(10, 20))
				setCols(20);
				setRows(10);
				clear()
				break;
			case "3":
				setGrid(initGrid(50,70))
				setCols(70);
				setRows(50);
				clear();
				break;
			default:
				setGrid(initGrid(30,50))
				setCols(50);
				setRows(30);
				clear();
		}
	} 

	const play = () => {
		let g1 = gridFull;
		let g2 = arrayClone(gridFull);

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				let neighborscompt = 0;
				
				if (i > 0) if (g1[i-1][j]) neighborscompt++;
				if (i > 0 && j > 0) if (g1[i-1][j-1]) neighborscompt++;
				if (i > 0 && j < cols - 1) if (g1[i-1][j+1]) neighborscompt++;
				if (j < cols - 1) if (g1[i][j+1]) neighborscompt++;
				if (j > 0) if (g1[i][j-1]) neighborscompt++;
				if (i < rows - 1) if (g1[i+1][j]) neighborscompt++;
				if (i < rows - 1 && j > 0) if (g1[i+1][j-1]) neighborscompt ++;
				if (i < rows - 1 && j < cols - 1) if (g1[i+1][j+1]) neighborscompt ++;

				if (g1[i][j] && (neighborscompt < 2 || neighborscompt > 3 )) g2[i][j] = false;
				if (!g1[i][j] && neighborscompt === 3) g2[i][j] = true; 
			}
		}

		setGrid(g2);
		setGeneration(generation + 1);
	}


	useInterval(play, isPlaying ? speed : null);


	return (
		<React.Fragment>
			<h1> Jeu de la Vie</h1>

			<Buttons
				playButton = {playButton}
				pauseButton = {pauseButton}
				slow = {slow}
				fast = {fast}
				clear = {clear}
				seed = {seed}
				gridSize = {gridSize}
			/>

			<Grid
				gridFull = {gridFull}
				rows = {rows}
				cols = {cols}
				selectBox = {selectBox}
			/>
			<h2> Generations: {generation} </h2>
		</React.Fragment>
	);
}


function initGrid(rownum: number, colnum: number) {
	console.log('called');
	return Array(rownum).fill(undefined).map(() => Array(colnum).fill(false));
}

function arrayClone(arr : boolean[][]) {
	return JSON.parse(JSON.stringify(arr));	
}


// magie noire : https://overreacted.io/making-setinterval-declarative-with-react-hooks/
// hook custom pour gérer la fonction play/pause
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(() => {});

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback?.current();
    }

    if (delay !== null) {
	    let id = setInterval(tick, delay);
	    return () => clearInterval(id);
	}
  }, [delay]);
}

ReactDOM.render(<Main 
		defaultCols = {50}
		defaultRows = {30}
		defaultSpeed = {100}
	/>, document.getElementById('root'));


