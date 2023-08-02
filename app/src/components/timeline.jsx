import { useLayoutEffect, useContext, useRef, useState } from 'react';
import { Stage, Layer, Line, Text, Circle, Group } from 'react-konva';
import { MyContext } from '../contexts/MyContextProvider.jsx';


// working, none, late 



const Timeline = ({day}) => {
  const { time } = useContext(MyContext);
  const parentRef = useRef(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    if (parentRef) {
      setDimensions({ w: parentRef.current.offsetWidth, h: parentRef.current.offsetHeight });
    }
  }, [parentRef, day]);
  
  return (
      <div ref={parentRef} className="" style={{ height: '100%', width: '100%' }}>
        <Stage
          width={parentRef && dimensions.w}
          height={parentRef && dimensions.h}>
          {dimensions.h !== 0 && 
            <Layer>
              <Grid dimensions={dimensions} xTickCount={12}/>
              <CurrentTimeDot dimensions={dimensions} time={time}/>
            </Layer>}
        </Stage>
      </div>
  )
}

export default Timeline;


const Grid = ({ dimensions, xTickCount}) => {
  const yMid = (dimensions.h / 2);
  const yMax = dimensions.h - 30;
  const yMin = 0 + 30;
  const xMax = dimensions.w;
  const xMin = 0;
  const xTickInterval = (xMax - xMin) / xTickCount;

  function calculateGrid() {
    const lines = [];
    for (let i = 0; i < xTickCount - 1; i++) {
      const line = { x1: xMin + (xTickInterval * (i + 1)), y1: yMax, x2: xMin + (xTickInterval * (i + 1)), y2: yMin};

      lines.push(line);
    }
    return lines; 
  }

  let lines = calculateGrid();

  return (
    <Group>
      {lines.map((line, index) => (
        <Group key={index}>
          <Line
            key={index}
            x={0}
            y={0}
            points={[line.x1, line.y1, line.x2, line.y2]}
            closed
            stroke={"#555"}
            strokeWidth={1}
            opacity={0.2}
          />
          <Text key={index+1}
              x={line.x2 - 10} y={line.y2 - 22}
              align='center'
              text={`${2+(index*2)}`} fontSize={15} fill={'#eee'}
              width={20}
            />
        </Group>
      ))}
      <Line
        x={0}
        y={0}
        points={[xMin, yMid, xMax, yMid]}
        closed
        stroke="#555"
        strokeWidth={0.2}
      />
    </Group>
  )
}


const CurrentTimeDot = ({dimensions, time}) => {
  const yMid = dimensions.h / 2;
  const xMax = dimensions.w;
  const date = new Date();
  const currentTimePoint = { x: timeToXValue(date, dimensions.w), y: yMid };

  function timeToXValue(date, canvasHeight) {
    let totalMinutes = date.getMinutes() + (date.getHours() * 60);
    const timeX = (totalMinutes / 1440) * (canvasHeight - 12);
    return timeX + 3;
  }

  return (
    <Group>
      <Line
        x={0}
        y={0}
        points={[0, yMid, currentTimePoint.x, currentTimePoint.y]}
        closed
        stroke="#eee"
        strokeWidth={1}
      />
      <Circle x={currentTimePoint.x} y={currentTimePoint.y} radius={3} fill="#eee" />
    </Group>
  )
}