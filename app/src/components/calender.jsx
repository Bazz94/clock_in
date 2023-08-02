import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';

/*
  0 : After today       : transparent
  1 : No data           : Black
  2 : Perfect day       : Green
  3 : late or half day  : yellow
  4 : absent            : red
*/

const typeToCount = {
  future: 0,
  none: 1,
  perfect: 2,
  present: 3,
  absent: 4,
}

function Calendar({user}) {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipText, setTooltipText] = useState('');
  const [values, setValues] = useState(null);
  
  useEffect(() => {
    const {from , to} = getFromAndToDates();
    setFromDate(from);
    setToDate(to);
    setValues(populateEmptyDays(user.currentDay, user.days));
  }, [user.currentDay, user.days])

  const handleMouseMove = (e) => {
    setTooltipPosition({ y: e.pageY, x: e.pageX });
  };
  return (
    <div className="flex w-full h-full px-4" onMouseMove={handleMouseMove}>
      {values && <CalendarHeatmap
        startDate={fromDate}
        endDate={toDate}
        values={values}
        showWeekdayLabels={true}
        showOutOfRangeDays={true}
        onMouseOver={(event, value) => {
          if (!value) {
            return false;
          }
          setShowTooltip(true);
          setTooltipText({ date: value.date, count: Object.keys(typeToCount).find((key) => typeToCount[key] === value.count) });
        }}
        onMouseLeave={(event, value) => {
          setShowTooltip(false)
        }}
        classForValue={(value) => {
          if (value == null) {
            return `color-scale-0`;
          }
          return `color-scale-${value.count}`;
        }}
      />}
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
  date.setDate(date.getDate() + date.getDay());
  to = date.toISOString().split('T')[0];
  date.setDate(date.getDate() - 364 + date.getDay());

  from = date.toISOString().split('T')[0];
  return {from: from, to: to}
}

// needs useMemo
function populateEmptyDays(currentDay, days) {
  const currentDate = new Date(currentDay.date);
  const strCurrentDate = currentDate.toISOString().split('T')[0];
  const newCurrentDay = { date: strCurrentDate, count: 1 }
  const newData = [];
  const date = new Date();
  const today = new Date();
  let index = 0;
  date.setDate(date.getDate() + 1);
  for (let i = 0; i < 364; i++) {
    date.setDate(date.getDate() - 1);
    const strDate = date.toISOString().split('T')[0];
    let day = { date: strDate, count: date > today ? 0 : 1 };
    if (index < days.length) {
      const dateObj = new Date(days[index].date);
      if (dateObj.toISOString().split('T')[0] === strDate) {
        day.count = typeToCount[days[index].status];
        index++;
      }
    }
    newData.push(day);
  }
  newData.push(newCurrentDay);
  return newData;
}

