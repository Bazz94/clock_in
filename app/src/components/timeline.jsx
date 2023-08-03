import { useLayoutEffect, useContext, useState } from 'react';
import { Stage, Layer, Line, Text, Circle, Group, Rect, Arc } from 'react-konva';
import { MyContext } from '../contexts/MyContextProvider.jsx';


// working, none, late 



const Timeline = ({day}) => {
  const { time } = useContext(MyContext);
  const [parentRef, setParentRef] = useState(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [margins, setMargins] = useState({t: 0, l: 0, b: 0, r: 0, ym: 0, xm: 0});

  const xMargin = 30;
  const yMargin = 30;
  useLayoutEffect(() => {
    if (parentRef) {
      setDimensions({ w: parentRef.offsetWidth, h: parentRef.offsetHeight });
      setMargins({ 
        t: yMargin, 
        l: xMargin, 
        b: parentRef.offsetHeight - yMargin, 
        r: parentRef.offsetWidth - xMargin, 
        ym: parentRef.offsetHeight/2, 
        xm: parentRef.offsetWidth/2, 
      });
    }
  }, [parentRef, day]);
  
  return (
    <div ref={setParentRef} className="" style={{ height: '100%', width: '100%' }}>
        <Stage
          width={parentRef && dimensions.w}
          height={parentRef && dimensions.h}>
          {dimensions.h !== 0 && 
            <Layer>
              <Grid margins={margins} xTickCount={12}/>
              <Legend margins={margins}/>
              <CurrentTimeDot margins={margins} time={time}/>
              <Shapes margins={margins} day={day}/>
              {day.workStarts[0] && <Schedule day={day} margins={margins}/>}
            </Layer>}
        </Stage>
      </div>
  )
}

export default Timeline;


const Grid = ({ margins, xTickCount}) => {
  const xTickInterval = (margins.r - margins.l) / xTickCount;
  function calculateGrid() {
    const lines = [];
    for (let i = 0; i < xTickCount; i++) {
      const line = { x1: margins.l - (xTickInterval / 2) + (xTickInterval * (i + 1)), y1: margins.b, x2: margins.l - (xTickInterval / 2) + (xTickInterval * (i + 1)), y2: margins.t};
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
              text={`${1+(index*2)}`} fontSize={15} fill={'#eee'}
              width={20}
            />
        </Group>
      ))}
      <Line
        x={0}
        y={0}
        points={[margins.l, margins.ym, margins.r, margins.ym]}
        closed
        stroke="#555"
        strokeWidth={0.2}
      />
    </Group>
  )
}


const Legend = ({ margins }) => {
  const items = [
    {
      text: 'Schedule',
      color: '#00ABFF'
    },
    {
      text: 'Working',
      color: '#22FFBC'
    },
    {
      text: 'Late',
      color: '#FFFF22'
    },
  ];
  const y = margins.b + 15;
  const xStart = (margins.r - margins.l)/items.length;
  const xInterval = 150;
  return (
    <Group>
      {items.map((item, index) => (
        <Group key={index}>
          <Text x={xStart + (index * xInterval)} y={y - 7} text={item.text} fontSize={15} fill='#eee' align='right' width={70}/>
          <Circle x={xStart + (index * xInterval) + 80} y={y} radius={6} fill={item.color}/>
        </Group>
      ))}
    </Group>
  );
}

const CurrentTimeDot = ({margins, time}) => {
  const date = new Date();
  const currentTimePoint = { x: timeToXValue(date, margins.r), y: margins.ym };

  return (
    <Group>
      <Line
        x={0}
        y={0}
        points={[margins.l, margins.ym, currentTimePoint.x, currentTimePoint.y]}
        closed
        stroke="#eee"
        strokeWidth={2}
      />
    </Group>
  )
}


const Shapes = ({margins , day}) => {
  const shapes = [];
  for (let i = 0; i < day.clockedIn.length; i++) {
    shapes.push({
      color: '#22FFBC', rect: calculateRect(
        margins, day.clockedIn[i], day.clockedOut[i])
    });
    shapes.push({
      color: '#FFFF22', rect: calculateRect(
        margins, day.workStarts[i], day.clockedIn[i], day.workEnds[i])
    });
  }
  console.log(calculateRect(
    margins, day.clockedIn[0], day.clockedOut[0]))
  return (
    <Group>
      {shapes.map((shape, index) => (
        <Rect
          key={index}
          x={shape.rect.x}
          y={margins.ym}
          width={shape.rect.w}
          height={shape.color === '#22FFBC' ? -(margins.b - margins.ym) / 2 : (margins.b - margins.ym) / 2}
          tension={0.4}
          fill={shape.color}
          opacity={0.8}
          {...console.log(shape)}
        />
      ))}
    </Group>
  );
}

// ClockIn, ClockOut
// workStarts, ClockIn, workEnds
function calculateRect(margins, start, end, workEnd) {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null; 
  const workEndDate = workEnd ? new Date(workEnd) : null;
  if (!startDate) {
    return [];
  }
  const x = timeToXValue(startDate, margins.r);
  console.log(x);
  // is Late rect
  if (workEndDate) {
    if (endDate && startDate >= endDate) {
      return [];
    }
    const date = new Date();
    if (date > workEndDate) {
      const w =timeToXValue(workEndDate, margins.r) - x;
      return {
        x: x,
        w: w,
      }
    }
  }
  if (!endDate) {
    const date = new Date();
    const w = timeToXValue(date, margins.r) - x;
    return {
      x: x,
      w: w,
    }
  }
  if (endDate) {
    const w = timeToXValue(endDate, margins.r) - x;
    return {
      x: x,
      w: w,
    }
  }
}


function timeToXValue(date, canvasWidth) {
  let totalMinutes = date.getMinutes() + (date.getHours() * 60);
  const timeX = (totalMinutes / 1440) * (canvasWidth);
  return timeX;
}


const Schedule = ({day, margins}) => {
  const workStartsX = timeToXValue(new Date(day.workStarts[0]), margins.r);
  const workEndsX = timeToXValue(new Date(day.workEnds[0]), margins.r);
  return (
    <Group>
      <Line
        x={0}
        y={0}
        points={[workStartsX, margins.t, workStartsX, margins.b]}
        closed
        stroke={"#00ABFF"}
        strokeWidth={1}
      />
      <Text x={workStartsX + 3} y={margins.t} text={'Start'} fontSize={15} fill="#00ABFF" width={50} />
      <Line
        x={0}
        y={0}
        points={[workEndsX, margins.t, workEndsX, margins.b]}
        closed
        stroke={"#00ABFF"}
        strokeWidth={1}
      />
      <Text x={workEndsX + 3} y={margins.t} text={'Finish'} fontSize={15} fill="#00ABFF" width={50} />
    </Group>
  )
}