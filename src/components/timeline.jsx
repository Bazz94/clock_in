import React from 'react';
import { useContext, useRef, useState, useLayoutEffect } from "react";
import { MyContext } from '../contexts/MyContextProvider.jsx';
import { render } from 'react-dom';
import { Stage, Layer, Line, Text, Circle, Group } from 'react-konva';
import Konva from 'konva';

function makeDate(hours, mins) {
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(mins);
  return date;
}

const day = [
  {
    id: '1',
    timeStamp: makeDate(9,0),
    type: 'clockIn'
  },
  {
    id: '2',
    timeStamp: makeDate(17,0),
    type: 'clockOut'
  }
]

function Timeline() {
  const { time } = useContext(MyContext);
  const parentRef = useRef(null);
  const [dimensions, setDimensions] = useState({w: 0, h: 0});
  const [points, setPoints] = useState([]);


  useLayoutEffect(() => {
    if (parentRef) {
      setDimensions({ w: parentRef.current.offsetWidth, h: parentRef.current.offsetHeight });
      setPoints(dayToPoints(day, { w: parentRef.current.offsetWidth, h: parentRef.current.offsetHeight }));
    }
  }, [parentRef]);
  console.log(points);
  return (
    <div ref={parentRef} className="flex-1 hidden w-96 sm:block" style={{height: '100%'}}>
      <Stage 
        width={parentRef && dimensions.w} 
        height={parentRef && dimensions.h}>
        <Layer>
          <EmptyTimeLine dimensions={dimensions} time={time}/>
          <Group>
            {points.map((item, index) => (
              <Line
                key={index}
                x={0}
                y={0}
                points={[item[0], item[1], item[2], item[3]]}
                {...console.log(item[0], item[1], item[2], item[3])}
                tension={0.5}
                closed
                stroke="blue"
              />
            ))}
          </Group>
        </Layer>
      </Stage>
    </div>
  )
}

export default Timeline;



const EmptyTimeLine = ({dimensions, time}) => {
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
      <Circle x={currentTimePoint.x} y={currentTimePoint.y} radius={6} fill="#eee" />
      <Text x={currentTimePoint.x - 60} y={currentTimePoint.y-6} text={time} fontSize={15} fill='#eee'/>
    </Group>
  )
}

const typeToColor = {
  clockIn: 'green',
  clockOut: 'green',
  startBreak: 'yellow',
  stopBreak: 'yellow',
  workStarts: 'blue',
  workEnds: 'blue'
};

function dayToPoints(day, dimensions) {
  const list = [];
  day.forEach(item => {
    const xMid = dimensions.w / 2;
    const point = { x: xMid, y: timeToYValue(item.timeStamp, dimensions.h) };
    const points = [point.x - 10, point.y, point.x + 10, point.y];
    console.log(points);
    list.push(points);
  });
  return list;
}

function timeToYValue(date, canvasHeight) {
  let totalMinutes = date.getMinutes() + (date.getHours() * 60);
  const timeY = (totalMinutes / 1440) * (canvasHeight - 12);
  return timeY + 6;
}