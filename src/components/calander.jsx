import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';

/*
  none: black
  1 : Current day : blue
  2 : late        : yellow
  3 : absent      : red
  4 : perfect     : green
  5 : overtime    : dark green
  6 : half day    : light green
  7 : sick        : grey
  8 : leave       : purple
  9 : off day (weekend) : neutral
  10 : misused (never clocked-out) : yellow
*/

// should be sorted by date
const data = [
  { date: '2023-07-14', count: 1 },
  { date: '2023-07-13', count: 2 },
  { date: '2023-07-12', count: 3 },
  // ...and so on
]

function Calendar() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipText, setTooltipText] = useState('');
  const [days, setDays] = useState([]);
  
  useEffect(() => {
    const {from , to} = getFromAndToDates();
    setFromDate(from);
    setToDate(to);
    setDays(populateEmptyDays(data));
  }, [])

  const handleMouseMove = (e) => {
    setTooltipPosition({ y: e.pageY, x: e.pageX });
  };

  return (
    <div className="flex w-full h-full px-4" onMouseMove={handleMouseMove}>
      <CalendarHeatmap
        startDate={fromDate}
        endDate={toDate}
        values={days}
        showWeekdayLabels={true}
        showOutOfRangeDays={true}
        onMouseOver={(event, value) => {
          if (!value) {
            return false;
          }
          setShowTooltip(true);
          setTooltipText({date: value.date, count: value.count});
        }}
        onMouseLeave={(event, value) => {
          setShowTooltip(false)
        }}
        classForValue={(value) => {
          if (!value) {
            return 'color-empty';
          }
          return `color-scale-${value.count}`;
        }}
      />
      {showTooltip && (
        <span className={`absolute bg-white text-neutral-950 p-2 flex flex-col justify-center items-center rounded-lg animate-fadeOut`} 
          style={{ left: tooltipPosition.x -50 +'px', top: tooltipPosition.y - 70 + 'px' }}>
          <p className=''>{tooltipText.date}</p>
          <p className=''>{tooltipText.count}</p>
        </span>
      )}
    </div>
  )
}

export default Calendar;

function getFromAndToDates() {
  let to, from;
  const date = new Date();
  to = date.toISOString().split('T')[0];
  date.setDate(date.getDate() - 182 );
  from = date.toISOString().split('T')[0];
  return {from: from, to: to}
}

// needs useMemo
function populateEmptyDays(data) {
  const newData = [];
  let date = new Date();
  let index = 0;
  date.setDate(date.getDate() + 1);
  for (let i = 0; i < 182; i++) {
    date.setDate(date.getDate() - 1);
    const strDate = date.toISOString().split('T')[0];
    let day = { date: strDate, count: 0 };
    if (index < data.length && data[index].date === strDate) {
      console.log('found: ', strDate);
      day.count = data[index].count;
      index++;
    }
    newData.push(day);
  }
  console.log(newData.length);
  return newData;
}