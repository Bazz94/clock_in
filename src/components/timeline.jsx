import { useContext, useRef, useState, useLayoutEffect } from "react";
import { MyContext } from '../contexts/MyContextProvider.jsx';
import { Stage, Layer, Line, Text, Circle, Group } from 'react-konva';


function makeDate(hours, mins = 0) {
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(mins);
  return date;
}

const day = {
  status: null,
  date: makeDate(0),
  workStarts: {
    date: makeDate(9)
    //dates: null
  },
  workEnds: {
    date: makeDate(17)
    //dates: null
  },
  clockedIn: {
    dates: makeDate(9) // turn into arrays, so users can clockIn multiple times
    //dates: null
  },
  clockedOut: {
    dates: makeDate(18) // turn into arrays, so users can clockOut multiple times
    //dates: null
  },
  startedBreak: {
    dates: null
  },
  endedBreak: {
    dates: null
  },
}


function Timeline() {
  const { time } = useContext(MyContext);
  const parentRef = useRef(null);
  const [dimensions, setDimensions] = useState({w: 0, h: 0});

  useLayoutEffect(() => {
    if (parentRef) {
      setDimensions({ w: parentRef.current.offsetWidth, h: parentRef.current.offsetHeight });
    }
  }, [parentRef]);

  return (
    <div ref={parentRef} className="flex-1 hidden w-96 sm:block" style={{height: '100%'}}>
      <Stage 
        width={parentRef && dimensions.w} 
        height={parentRef && dimensions.h}>
        {dimensions.h !== 0 && <Layer>
          <EmptyTimeLine dimensions={dimensions}/>
          <Lines day={day} dimensions={dimensions} />
          <CurrentTimeDot dimensions={dimensions} time={time} />
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

function CurrentTimeDot({dimensions, time}) {
  const xMid = dimensions.w / 2;
  const date = new Date();
  const currentTimePoint = { x: xMid, y: timeToYValue(date, dimensions.h) };
  return (
    <Group>
      <Circle x={currentTimePoint.x} y={currentTimePoint.y} radius={6} fill="#eee" />
      <Text x={currentTimePoint.x - 70} y={currentTimePoint.y-6} text={time} fontSize={15} fill='#eee' align="right" width={50}/>
    </Group>
  )
}

const Lines = ({ day, dimensions }) => {
  // console.log('rerendered');
  let clockLine = { color: 'green', lines: calculateLinesFromDates(dimensions, day['clockedIn'].dates, day['clockedOut'].dates) };
  let lateLine = { color: 'red', lines: calculateLinesFromDates(dimensions, day['workStarts'].date, day['clockedIn'].dates, false, day['workEnds'].date)};
  let workLine = { color: 'blue', lines: calculateLinesFromDates(dimensions, day['workStarts'].date, day['workEnds'].date, true) };
  let breakLine = { color: 'yellow', lines: calculateLinesFromDates(dimensions, day['startedBreak'].dates, day['endedBreak'].dates) };
  const shapes = [clockLine, lateLine, workLine, breakLine];
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
                  text={getMarkerText(line.type, shape.color)} fontSize={15} fill={shape.color}
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

// late:  startWork  clock-in
function calculateLinesFromDates(dimensions, start, end, isWork, isLateLine) {
  if (!start) {
    return [];
  }
  const xMid = dimensions.w / 2;
  const startPoint = { x: xMid, y: timeToYValue(start, dimensions.h) }
  if (isLateLine) {
    if (end && start >= end) {
      return [];
    }
    const date = new Date();
    if (date > isLateLine) {
      const line = {
        type: 'line', points: [{ x: xMid, y: startPoint.y }, { x: xMid, y: timeToYValue(isLateLine, dimensions.h) }]
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
    return [startMarker, line];
  }
  const endPoint = { x: xMid, y: timeToYValue(end, dimensions.h) }
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

function getMarkerText(markerType, color) {
  const options = ['en-Gb', { hour: '2-digit', minute: '2-digit', hour12: false }];
  // clock-in and out
  if (color === 'green') {
    if (markerType === 'start') {
      return day.clockedIn.dates.toLocaleTimeString(...options);
    }
    if (markerType === 'end') {
      return day.clockedOut.dates.toLocaleTimeString(...options);
    }
  }
  // break start and stop
  if (color === 'yellow') {
    if (markerType === 'start') {
      return day.startedBreak.dates.toLocaleTimeString(...options);
    }
    if (markerType === 'end') {
      return day.endedBreak.dates.toLocaleTimeString(...options);
    }
  }
  // work starts and ends
  if (color === 'blue') {
    if (markerType === 'start') {
      return day.workStarts.date.toLocaleTimeString(...options);
    }
    if (markerType === 'end') {
      return day.workEnds.date.toLocaleTimeString(...options);
    }
  }
}

function repositionTimeLable(day, time) {

}