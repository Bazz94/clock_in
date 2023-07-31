import { useContext, useRef, useState, useLayoutEffect } from "react";
import { MyContext } from '../contexts/MyContextProvider.jsx';
import { Stage, Layer, Line, Text, Circle, Group } from 'react-konva';


const Timeline = ({day}) => {
  const { time } = useContext(MyContext);
  const parentRef = useRef(null);
  const [dimensions, setDimensions] = useState({w: 0, h: 0});

  useLayoutEffect(() => {
    if (parentRef) {
      setDimensions({ w: parentRef.current.offsetWidth, h: parentRef.current.offsetHeight });
    }
  }, [parentRef, day]);

  return (
    <div ref={parentRef} className="flex-1 hidden w-96 sm:block" style={{height: '100%'}}>
      <Stage 
        width={parentRef && dimensions.w} 
        height={parentRef && dimensions.h}>
        {dimensions.h !== 0 && <Layer>
          <EmptyTimeLine dimensions={dimensions}/>
          <Lines day={day} dimensions={dimensions} />
          <CurrentTimeDot day={day} dimensions={dimensions} time={time} />
        </Layer>}
      </Stage>
    </div>
  )
}

export default Timeline;



const EmptyTimeLine = ({dimensions}) => {
  const xMid = dimensions.w / 2;
  const date = new Date();
  const currentTimePoint = { x: xMid, y: timeToYValue(date, dimensions.h) };
  return (
    <Group>
      <Line
        x={0}
        y={0}
        points={[xMid, 0, xMid, dimensions.h]}
        tension={0.5}
        closed
        stroke="#555"
      />
      <Line
        x={0}
        y={0}
        points={[xMid, 0, xMid, currentTimePoint.y]}
        tension={0.5}
        closed
        stroke="#eee"
      />
    </Group>
  )
}

const CurrentTimeDot = ({day, dimensions, time}) => {
  console.log('rerender dot');
  const xMid = dimensions.w / 2;
  const date = new Date();
  const currentTimePoint = { x: xMid, y: timeToYValue(date, dimensions.h) };
  const xOffset = getXOffset(day);
  console.log(xOffset);
  return (
    <Group>
      <Circle x={currentTimePoint.x} y={currentTimePoint.y} radius={6} fill="#eee" />
      <Text x={currentTimePoint.x - 70 - xOffset} y={currentTimePoint.y-6} text={time} fontSize={15} fill='#eee' align="right" width={50}/>
    </Group>
  )
}

const Lines = ({ day, dimensions }) => {
  let clockLine = { color: 'green', lines: calculateLinesFromDates(
    dimensions, day.clockedIn[0], day.clockedOut[0] )};
  let lateLine = { color: 'red', lines: calculateLinesFromDates(
    dimensions, day.workStarts[0], day.clockedIn[0], false, day.workEnds[0])};
  let workLine = { color: 'blue', lines: calculateLinesFromDates(
    dimensions, day.workStarts[0], day.workEnds[0], true)};
  let breakLine = { color: 'yellow', lines: calculateLinesFromDates(
    dimensions, day.startedBreak[0], day.endedBreak[0])};
  const shapes = [ lateLine, workLine, clockLine, breakLine];
  return (
    <Group>
      {shapes.map((shape, index) => (
        <Group key={index}>
          {shape.lines.map((line, index2) => (
            <Group key={index2}>
              <Line
                key={index.toString + index2}
                x={0}
                y={0}
                points={[line.points[0].x, line.points[0].y, line.points[1].x, line.points[1].y]}
                tension={0.5}
                closed
                stroke={shape.color}
              />
              {line.type !== 'line' &&
                <Text key={index2}
                  x={line.points[0].x - (shape.color === 'blue' ? -30 : 140)} y={line.points[0].y - 6}
                  align={shape.color === 'blue' ? 'left' : 'right'}
                  text={getMarkerText(day ,line.type, shape.color)} fontSize={15} fill={shape.color}
                  width={130}
                />
              }
            </Group>
          ))}
        </Group>
      ))}
    </Group>
  )
}


function calculateLinesFromDates(dimensions, start, end, isWork, isLateLine) {
  const startDate = start ? new Date(start) : null; 
  const endDate = end ? new Date(end) : null; 
  if (!start) {
    return [];
  }
  const xMid = dimensions.w / 2;
  const startPoint = { x: xMid, y: timeToYValue(startDate, dimensions.h) }
  if (isLateLine) {
    if (end && start >= end) {
      return [];
    }
    const date = new Date();
    if (date > isLateLine) {
      const isLateLineDate = new Date(isLateLine);
      const line = {
        type: 'line', points: [{ x: xMid, y: startPoint.y }, { x: xMid, y: timeToYValue(isLateLineDate, dimensions.h) }]
      };
    return [line];
    }
  }
  let startMarker = { type: 'start', points: [{ x: xMid - 10, y: startPoint.y }, { x: xMid + 10, y: startPoint.y }] };
  if (!end) {
    const date = new Date();
    const currentTimePoint = { x: xMid, y: timeToYValue(date, dimensions.h) };
    let line = {
      type: 'line', points: [{ x: xMid, y: startPoint.y }, { x: xMid, y: currentTimePoint.y }]
    };
    if (date < startDate) {
      return [];
    }
    return [startMarker, line];
  }
  const endPoint = { x: xMid, y: timeToYValue(endDate, dimensions.h) }
  let endMarker = {
    type: 'end', points: [{ x: xMid - 10, y: endPoint.y }, { x: xMid + 10, y: endPoint.y }]
  };
  if (isWork) {
    return [startMarker, endMarker];
  }
  const line = {
    type: 'line', points: [{ x: xMid, y: startPoint.y }, { x: xMid, y: endPoint.y }]
  };
  if (isLateLine) {
    return [line];
  }
  return [startMarker, line, endMarker];
}


function timeToYValue(date, canvasHeight) {
  let totalMinutes = date.getMinutes() + (date.getHours() * 60);
  const timeY = (totalMinutes / 1440) * (canvasHeight - 12);
  return timeY + 6;
}


function getMarkerText(day, markerType, color) {

  const options = ['en-Gb', { hour: '2-digit', minute: '2-digit', hour12: false }];
  // clock-in and out
  if (color === 'green') {
    if (markerType === 'start') {
      const date = new Date(day.clockedIn[0]);
      return date.toLocaleTimeString(...options);
    }
    if (markerType === 'end') {
      const date = new Date(day.clockedOut[0]);
      return date.toLocaleTimeString(...options);
    }
  }
  // break start and stop
  if (color === 'yellow') {
    if (markerType === 'start') {
      const date = new Date(day.startedBreak[0]);
      return date.toLocaleTimeString(...options);
    }
    if (markerType === 'end') {
      const date = new Date(day.endedBreak[0]);
      return date.toLocaleTimeString(...options);
    }
  }
  // work starts and ends
  if (color === 'blue') {
    if (markerType === 'start') {
      const date = new Date(day.workStarts[0]);
      return date.toLocaleTimeString(...options);
    }
    if (markerType === 'end') {
      const date = new Date(day.workEnds[0]);
      return date.toLocaleTimeString(...options);
    }
  }
}


function getXOffset(day) {
  console.log(day);
  let canGoToRight = true;
  let date = new Date();
  let before= new Date();
  let after = new Date();
  before.setMinutes(date.getMinutes() - 20);
  after.setMinutes(date.getMinutes() + 20);
  date = date.toISOString();
  before = before.toISOString();
  after = after.toISOString()

  if (day.workStarts[0]) {
    if (day.workStarts[0] < after && day.workStarts[0] > before) {
      canGoToRight = false;
    }
  }
  if (day.workEnds[0]) {
    if (day.workEnds[0] < after && day.workEnds[0] > before) {
      canGoToRight = false;
    }
  }
  if (day.clockedIn[0]) {
    if (day.clockedIn[0] < after && day.clockedIn[0] > before) {
      return canGoToRight ? -80 : 45;
    }
  }
  if (day.clockedOut[0]) {
    if (day.clockedOut[0] < after && day.clockedOut[0] > before) {
      return canGoToRight ? -80 : 45;
    }
  }
  if (day.startedBreak[0]) {
    if (day.startedBreak[0] < after && day.startedBreak[0] > before) {
      return canGoToRight ? -80 : 45;
    }
  }
  if (day.endedBreak[0]) {
    if (day.endedBreak[0] < after && day.endedBreak[0] > before) {
      return canGoToRight ? -80 : 45;
    }
  }
  return 0;
}