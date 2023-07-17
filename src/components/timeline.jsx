import { useContext, useRef, useState, useLayoutEffect } from "react";
import { MyContext } from '../contexts/MyContextProvider.jsx';
import { Stage, Layer, Line, Text, Circle, Group } from 'react-konva';




function makeDate(hours, mins = 0) {
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(mins);
  return date;
}

const daya = {
  status: null,
  date: makeDate(0),
  workStart: {
    date: makeDate(9)
  },
  workEnd: {
    date: makeDate(17)
  },
  clockIn: {
    dates: makeDate(8) // turn into arrays, so users can clockIn multiple times
  },
  clockOut: {
    dates: makeDate(18) // turn into arrays, so users can clockOut multiple times
  },
  startBreak: {
    date: []
  },
  endBreak: {
    date: []
  },
}

function calculateLinesFromDates(dimensions ,start, end, isWork) {
  if (!start) {
    return [];
  }
  const xMid = dimensions.w / 2;
  const startPoint = { x: xMid, y: timeToYValue(start, dimensions.h)}
  let startMarker = [{ x: xMid - 10, y: startPoint.y }, { x: xMid + 10, y: startPoint.y }];
  if (!end) {
    const date = new Date();
    const currentTimePoint = { x: xMid, y: timeToYValue(date, dimensions.h) };
    const line = [{ x: xMid, y: startPoint.y }, { x: xMid, y: currentTimePoint.y }];
    return [startMarker, line];
  }
  const endPoint = { x: xMid, y: timeToYValue(end, dimensions.h) }
  let endMarker = [{ x: xMid - 10, y: endPoint.y }, { x: xMid + 10, y: endPoint.y }];
  if (isWork) {
    return [startMarker, endMarker];
  }
  const line = [{ x: xMid, y: startPoint.y }, { x: xMid, y: endPoint.y }];
  return [startMarker, line, endMarker];
}

const MakeLines = ({daya, dimensions, time}) => {
  console.log('calculate shapes');
  const lines = [];
  let clockLine = {color: 'green' ,lines: calculateLinesFromDates(dimensions, daya['clockIn'], daya['clockOut'])};
  let lateLine = { color: 'red', lines: calculateLinesFromDates(dimensions, daya['clockIn']) };
  let breakLine = { color: 'yello', lines: calculateLinesFromDates(dimensions, daya['clockIn']) };

  return (
    <Group>

    </Group>
  )
}

const day = [
  {
    id: '1',
    timeStamp: makeDate(9,0),
    type: 'workStarts'
  },
  {
    id: '2',
    timeStamp: makeDate(17,0),
    type: 'workEnds'
  },
  {
    id: '3',
    timeStamp: makeDate(8, 0),
    type: 'clockIn'
  },
  {
    id: '4',
    timeStamp: makeDate(13, 0),
    type: 'clockOut'
  }
]

function Timeline() {
  const { time } = useContext(MyContext);
  const parentRef = useRef(null);
  const [dimensions, setDimensions] = useState({w: 0, h: 0});
  const [eventLines, setEventLines] = useState([]);


  useLayoutEffect(() => {
    if (parentRef) {
      setDimensions({ w: parentRef.current.offsetWidth, h: parentRef.current.offsetHeight });
      setEventLines(dayToEventLines(day, { w: parentRef.current.offsetWidth, h: parentRef.current.offsetHeight }));
    }
  }, [parentRef]);


  return (
    <div ref={parentRef} className="flex-1 hidden w-96 sm:block" style={{height: '100%'}}>
      <Stage 
        width={parentRef && dimensions.w} 
        height={parentRef && dimensions.h}>
        <Layer>
          <EmptyTimeLine dimensions={dimensions}/>
          <Group>
            {dimensions.x != 0 && day.map((item, index) => (
              <EventMarker key={index} item={item} dimensions={dimensions}/>
            ))}
          </Group>
          <Group>
            {dimensions.x != 0 && eventLines.map((item, index) => (
              <Line
                key={index}
                x={0}
                y={0}
                {...console.log(item.points[0].x, item.points[0].y, item.points[1].x, item.points[1].y)}
                points={[item.points[0].x, item.points[0].y, item.points[1].x, item.points[1].y]}
                tension={0.5}
                closed
                {...console.log(item.color)}
                stroke={item.color}
              />
              ))}
          </Group>
          <CurrentTimeDot dimensions={dimensions} time={time} />
        </Layer>
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
      <Text x={currentTimePoint.x - 60} y={currentTimePoint.y-6} text={time} fontSize={15} fill='#eee'/>
    </Group>
  )
}

function EventMarker({item, dimensions}) {
  const xMid = dimensions.w / 2;
  const point = { x: xMid, y: timeToYValue(item.timeStamp, dimensions.h) };
  return (
    <Group>
      <Line
        x={0}
        y={0}
        points={[point.x - 10, point.y, point.x + 10, point.y]}
        tension={0.5}
        closed
        stroke={typeToColor[item.type]}
      />
      <Text x={point.x - 90} y={point.y - 6} text={item.type} fontSize={15} fill={typeToColor[item.type]} />
    </Group>
  )
}

function timeToYValue(date, canvasHeight) {
  let totalMinutes = date.getMinutes() + (date.getHours() * 60);
  const timeY = (totalMinutes / 1440) * (canvasHeight - 12);
  return timeY + 6;
}


const typeToColor = {
  clockIn: 'green',
  clockOut: 'green',
  startBreak: 'yellow',
  endBreak: 'yellow',
  workStarts: 'blue',
  workEnds: 'blue'
};

function dayToEventLines(day, dimensions) {
  let late = false;
  const xMid = dimensions.w / 2;
  const eventLines = [];
  let clockLine = {color: 'green', points: []}; 
  let lateLine = { color: 'red', points: [] }; // remove in future
  let breakLine = { color: 'yellow', points: [] };
  day.sort((a, c) => a.timeStamp - c.timeStamp);
  day.forEach((item) => {
    if (item.type === "clockIn" || item.type === "clockOut") {
      console.log(clockLine.points);
      const point = { x: xMid, y: timeToYValue(item.timeStamp, dimensions.h) };
      if (clockLine.points.length === 2 && item.type === "clockOut") {
        clockLine.points.unshift();
        clockLine.points.push(point);
        return false;
      }
      if (clockLine.points.length === 1 && item.type === "clockIn") {
        const currentTimePoint = { x: xMid, y: timeToYValue(new Date(), dimensions.h) };
        clockLine.points.push(currentTimePoint);
        eventLines.push(clockLine);
      }
    }
    if (item.type === "startBreak" || item.type === "stopBreak") {
      const point = { x: xMid, y: timeToYValue(item.timeStamp, dimensions.h) };
      breakLine.points.push(point);
      if (breakLine.points.length === 2) {
        eventLines.push(breakLine);
      }
    }
    if (item.type === "clockIn" || item.type === "workStarts") {
      const point = { x: xMid, y: timeToYValue(item.timeStamp, dimensions.h) };
      lateLine.points.push(point);
      if (lateLine.points.length === 1) {
        const currentTimePoint = { x: xMid, y: timeToYValue(new Date(), dimensions.h) };
        clockLine.points.push(currentTimePoint);
      }
      if (lateLine.points.length === 2) {
        eventLines.push(lateLine);
      }
    }

  });
  return [...eventLines];
}