import React from "react";
import ReactDOM from "react-dom";
import Select from "react-select";
import djiktras from "./algorithms/djiktras";
import bfs from "./algorithms/bfs";
import astar from "./algorithms/astar";
import dfs from "./algorithms/dfs";
import binaryTreeMaze from "./algorithms/binaryTreeMaze";
import dfsMaze from "./algorithms/dfsMaze";
import recursiveMaze from "./algorithms/recursiveMaze";
import krushalsMaze from "./algorithms/krushalsMaze";

import "./App.css";
import { EventEmitter } from "./events";
import StartDraggable from "./startDrag";
import EndDraggable from "./endDrag";
import primsMaze from "./algorithms/primsMaze";
import { useAlert } from "react-alert";

const Element = (props) => {
  const [backgroundColor, setColor] = React.useState(props.background);

  // const changeColor = () => {
  //   return new Promise((resolve, reject) => {
  //     const element = document.getElementById(String(props.ele));
  //     element.style.backgroundColor = "pink";
  //     resolve();
  //   });
  // };

  React.useEffect(() => {
    EventEmitter.subscribe("visited", (event) => {
      if (event === String(props.ele)) {
        //console.log("App.js visited", props.ele);
        setTimeout(() => {
          // const element = document.getElementById(String(props.ele));
          // ReactDOM.findDOMNode(element).classList.remove("element");
          // ReactDOM.findDOMNode(element).classList.add("visited");
          setColor("pink");
        }, 1000);
        // const element = document.getElementById(String(props.ele));
        // element.style.backgroundColor = "pink";
        // console.log("ChangeColor", props.ele);
        //ReactDOM.findDOMNode(element).classList.add("visited");
        // setTimeout(() => {
        //   console.log("setTimeOut", props.ele);
        //   const element = document.getElementsByClassName("element");
        //   ReactDOM.findDOMNode(element).classList.add("visited");
        //   //setColor("pink");
        // }, 1);
      }
    });

    EventEmitter.subscribe("path", (event) => {
      if (event === String(props.ele)) {
        setTimeout(() => setColor("blue"), 1000);
      }
    });

    EventEmitter.subscribe("clear", (event) => {
      setColor("white");
    });
  }, []);

  React.useEffect(() => {
    EventEmitter.subscribe("reset", (event) => {
      if (backgroundColor === "pink" || backgroundColor === "blue")
        setColor("white");
    });
  }, [backgroundColor]);

  React.useEffect(() => {
    setColor(props.background);
  }, [props.background]);

  React.useEffect(() => {
    //console.log(props);
    EventEmitter.subscribe("hole", (event) => {
      if (String(event) === String(props.ele)) {
        props.set((prevState) => {
          const arr = prevState.filter(
            (ele) => String(ele) !== String(props.ele)
          );
          //console.log(arr);
          return arr;
        });
        //console.log(props.for);
        setTimeout(() => setColor("white"), 1000);
      }
    });

    EventEmitter.subscribe("maze", (event) => {
      if (String(event) === String(props.ele)) {
        setTimeout(() => setColor("lightseagreen"), 500);
        props.set((forbidden) => [...forbidden, String(props.ele)]);
        //console.log(event);
      }
    });
  }, [props]);

  const update = () => {
    const newForbidden = [...props.for, String(props.ele)];
    // props.update(newForbidden);
    props.set((forbidden) => [...forbidden, String(props.ele)]);
    console.log(props.for);
  };

  return (
    <div
      className={
        backgroundColor === "white"
          ? "element"
          : backgroundColor === "blue"
          ? "path"
          : backgroundColor === "lightseagreen"
          ? "blocked"
          : "visited"
      }
      id={String(props.ele)}
      // style={{ borderColor: "lightseagreen" }}
      onClick={() => {
        if (props.for.includes(String(props.ele))) {
          props.set((prevState) => {
            const arr = prevState.filter(
              (ele) => String(ele) !== String(props.ele)
            );
            return arr;
          });
          setColor("white");
        } else {
          setColor("lightseagreen");
          props.set((forbidden) => [...forbidden, String(props.ele)]);
          console.log(props.for);
        }
      }}
    >
      {}
    </div>
  );
};

const App = () => {
  const n = 2100;
  const gridRef = React.useRef(null);
  const [start, setStart] = React.useState("0");
  const [end, setEnd] = React.useState("0");
  const [forbidden, setForbidden] = React.useState([]);
  const [pathSelect, setPathSelect] = React.useState(null);
  const [mazeSelect, setMazeSelect] = React.useState(null);
  const [background, setBackground] = React.useState("white");

  const path = React.useMemo(() => [djiktras, astar, dfs, bfs], []);
  const maze = React.useMemo(
    () => [recursiveMaze, binaryTreeMaze, dfsMaze, krushalsMaze, primsMaze],
    []
  );

  const alert = useAlert();

  React.useEffect(() => {
    //final();
    EventEmitter.subscribe("start", (event) => {
      const pos = event.y * 70 + event.x;
      setStart(String(pos));
    });

    EventEmitter.subscribe("end", (event) => {
      const pos = event.y * 70 + event.x;
      setEnd(String(pos));
    });
  }, []);

  React.useEffect(() => {
    if (pathSelect !== null) {
      //setBackground("white");
      EventEmitter.dispatch("reset");

      findPath(pathSelect);
    }
  }, [end]);

  const generateMaze = React.useCallback(
    (option) => {
      console.log(option);
      if (
        option.value === "2" ||
        option.value === "3" ||
        option.value === "4"
      ) {
        let array = Array.from({ length: 2099 }, (v, k) => String(k + 1));
        array.unshift(String(0));
        setForbidden([...array]);
        setBackground("lightseagreen");
      }

      maze[parseInt(option.value)]();
    },
    [forbidden]
  );

  const findPath = React.useCallback(
    (option) => {
      // try {
      console.log("forbidden", forbidden);
      let results = path[parseInt(option.value)](start, end, forbidden);

      if (results.distance === "Infinity") {
        alert.show("Path not Found");
      } else {
        let arr = results.path;
        for (let i = 0; i < arr.length; ++i) {
          EventEmitter.dispatch("path", String(arr[i]));
        }
      }
      console.log(results);
      // } catch (er) {
      //   console.log(er);
      // }
    },
    [forbidden, start, end]
  );

  const clearMaze = React.useCallback(() => {
    EventEmitter.dispatch("clear");
    setForbidden([]);
    setPathSelect(null);
    setMazeSelect(null);
    //setStart("0");
    //setEnd("0");
    //setBackground("white");
  }, []);

  const pathOptions = [
    { value: "0", label: "Dijktras" },
    { value: "1", label: "Astar" },
    { value: "2", label: "DFS" },
    { value: "3", label: "BFS" },
  ];

  const MazeOptions = [
    { value: "0", label: "Recursive" },
    { value: "1", label: "Binary" },
    { value: "2", label: "DFS" },
    { value: "3", label: "Krushals" },
    { value: "4", label: "Prims" },
  ];

  return (
    <div>
      <div
        style={{
          height: "80px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "10% 10% 10% 13% 10% 10%",
          gap: "20px",
          paddingTop: "30px",
          paddingLeft: "20px",
          // marginTop: "10px",
          // marginLeft: "20px",
          backgroundColor: "lightblue",
          color: "white",
        }}
      >
        <div
          style={{ marginTop: "20px", fontSize: "20px", fontWeight: "bold" }}
        >
          PathVisualiser
        </div>
        <div
          style={{
            height: "70px",
            width: "auto",
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            color: "gray",
            //justifyItems: "center"
            // position: "absolute",
            // top: 10,
            // left: 250,
          }}
        >
          <div style={{ color: "white" }}>Path Finding</div>
          <Select
            defaultValue={pathSelect}
            value={pathSelect}
            onChange={setPathSelect}
            options={pathOptions}
          />
        </div>
        <div
          style={{
            height: "70px",
            width: "auto",
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            color: "gray",
            // position: "absolute",
            // top: 10,
            // left: 350,
          }}
        >
          <div style={{ color: "white" }}>Maze Generation</div>
          <Select
            defaultValue={mazeSelect}
            value={mazeSelect}
            onChange={setMazeSelect}
            options={MazeOptions}
          />
        </div>
        <div
          onClick={() => {
            findPath(pathSelect);
          }}
          style={{
            width: "80px",
            height: "30px",
            paddingLeft: "10px",
            paddingTop: "15px",
            backgroundColor: "lightsteelblue",
            borderRadius: "10px",
            cursor: "pointer",
            justifySelf: "center",
            // position: "absolute",
            // top: 10,
            // left: 150,
          }}
        >
          Find Path
        </div>
        <div
          onClick={() => {
            generateMaze(mazeSelect);
          }}
          style={{
            width: "120px",
            height: "30px",
            paddingLeft: "10px",
            paddingTop: "15px",
            backgroundColor: "lightsteelblue",
            borderRadius: "10px",
            cursor: "pointer",
            //position: "relative",
            // top: 0,
            // left: 100,
          }}
        >
          Generate Maze
        </div>
        <div
          onClick={() => {
            clearMaze();
          }}
          style={{
            width: "90px",
            height: "30px",
            paddingLeft: "10px",
            paddingTop: "15px",
            backgroundColor: "lightsteelblue",
            borderRadius: "10px",
            cursor: "pointer",
            //position: "relative",
            // top: 0,
            // left: 500,
          }}
        >
          Clear Maze
        </div>
      </div>

      <StartDraggable gridRef={gridRef} />
      <EndDraggable gridRef={gridRef} />
      <div className="mainGrid" ref={gridRef}>
        {[...Array(n)].map((e, i) => (
          <Element
            key={i}
            ele={i}
            set={setForbidden}
            for={forbidden}
            background={background}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
