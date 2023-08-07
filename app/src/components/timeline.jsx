import { useLayoutEffect, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { Stage, Layer, Line, Text, Circle, Group, Rect, Arc } from 'react-konva';
import { MyContext } from '../contexts/MyContextProvider.jsx';


// working, none, late 



const Timeline = ({day}) => {
  const { time } = useContext(MyContext);
  const parentRef = useRef(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [margins, setMargins] = useState({t: 0, l: 0, b: 0, r: 0, ym: 0, xm: 0});

  const xMargin = 0;
  const yMargin = 30;
  useLayoutEffect(() => {
    if (parentRef.current) {
      setDimensions({ w: parentRef.current.offsetWidth, h: parentRef.current.offsetHeight });
      setMargins({ 
        t: yMargin, 
        l: xMargin, 
        b: parentRef.current.offsetHeight - yMargin, 
        r: parentRef.current.offsetWidth - xMargin, 
        ym: parentRef.current.offsetHeight/2, 
        xm: parentRef.current.offsetWidth/2, 
      });
    }
  }, [day]);
  
  function updateDimensions() {
    if (parentRef) {
      setDimensions({ w: parentRef.current.offsetWidth, h: parentRef.current.offsetHeight });
      setMargins({
        t: yMargin,
        l: xMargin,
        b: parentRef.current.offsetHeight - yMargin,
        r: parentRef.current.offsetWidth - xMargin,
        ym: parentRef.current.offsetHeight / 2,
        xm: parentRef.current.offsetWidth / 2,
      });
    }
  }

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  },[]);



  return (
    <div ref={parentRef} className="" style={{ height: '100%', width: '100%' }}>
        <Stage
          width={parentRef.current && dimensions.w}
          height={parentRef.current && dimensions.h}>
          {dimensions.h !== 0 && 
            <Layer>
              <Background margins={margins}/>
              <Grid margins={margins} xTickCount={12}/>
              <Legend margins={margins}/>
              {day.workStarts[0] && <Schedule day={day} margins={margins}/>}
              <Shapes margins={margins} day={day}/>
              <CurrentTimeDot margins={margins} time={time}/>
            </Layer>}
        </Stage>
      </div>
  )
}

export default Timeline;





const Background = ({ margins }) => {
  const date = new Date();
  const w = timeToXValue(date, margins);
  return (
    <Group>
      <Rect 
        x={margins.l}
        y={margins.t}
        width={w - margins.l}
        height={margins.b - margins.t}
        fill={'#222222'}
        opacity={0.5}
      />
    </Group>
  )
}


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
              text={`${1+(index*2)}`} 
              fontSize={16} 
              fill={'#FFFFFF'}
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
      color: '#FF2265'
    },
  ];
  const y = margins.b + 22;
  const xStart = (margins.r - margins.l)/items.length;
  const xInterval = Math.max(xStart/2,80);
  return (
    <Group>
      {items.map((item, index) => (
        <Group key={index}>
          <Text x={xStart + (index * xInterval)} y={y - 7} text={item.text} fontSize={16} fill='#FFFFFF' align='right' width={item.text.length*10}/>
          <Circle x={xStart + (index * xInterval) + item.text.length * 10 + 10} y={y} radius={6} fill={item.color}/>
        </Group>
      ))}
    </Group>
  );
}

const CurrentTimeDot = ({margins, time}) => {
  const date = new Date();
  const x = timeToXValue(date, margins);
  time;
  return (
    <Group>
      <Line
        x={0}
        y={0}
        points={[margins.l, margins.ym, x, margins.ym]}
        closed
        stroke="#eee"
        strokeWidth={2}
      />
      <Circle x={x} y={margins.ym} radius={4} fill={"#eee"} />
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
      color: '#FF2265', rect: calculateRect(
        margins, day.workStarts[i], day.clockedIn[i], day.workEnds[i])
    });
  }
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
  const x = timeToXValue(startDate, margins);
  // is Late rect
  if (workEndDate) {
    if (endDate && startDate >= endDate) {
      return [];
    }
    const date = new Date();
    if (!endDate && date > workEndDate) {
      const w = timeToXValue(workEndDate, margins) - x;
      return {
        x: x,
        w: w,
      }
    }
  }
  if (!endDate) {
    const date = new Date();
    const w = timeToXValue(date, margins) - x;
    return {
      x: x,
      w: w,
    }
  }
  if (endDate) {
    const w = timeToXValue(endDate, margins) - x;
    return {
      x: x,
      w: w,
    }
  }
}


function timeToXValue(date, margins) {
  let totalMinutes = date.getMinutes() + (date.getHours() * 60);
  const timeX = (totalMinutes / 1440) * (margins.r - margins.l);
  return timeX + margins.l;
}


const Schedule = ({day, margins}) => {
  const workStartsX = timeToXValue(new Date(day.workStarts[0]), margins);
  const workEndsX = timeToXValue(new Date(day.workEnds[0]), margins);
  return (
    <Group>
      <Line
        x={0}
        y={0}
        points={[workStartsX, margins.t, workStartsX, margins.b]}
        stroke={"#00ABFF"}
        strokeWidth={1}
      />
      <Text x={workStartsX + 3} y={margins.t + 2} text={'Start'} fontSize={16} fill="#00ABFF" width={50} />
      <Line
        x={0}
        y={0}
        points={[workEndsX, margins.t, workEndsX, margins.b]}
        stroke={"#00ABFF"}
        strokeWidth={1}
      />
      <Text x={workEndsX + 3} y={margins.t + 2} text={'Finish'} fontSize={16} fill="#00ABFF" width={50} />
    </Group>
  )
}