import React from "react";
import { WeekDays, currentShiftData, ShiftF } from "../../data/Shift";
import { currentConfig } from "../../data/Config";
import { PartTimeF } from "../../data/PartTime";
import "../../styles/components/editor/ShiftWorker";

export interface ShiftWorkerProps {
  day: WeekDays;
  workerId: number;
}

const ShiftWorker: React.FC<ShiftWorkerProps> = ({ day, workerId }) => {
  const curDay = currentShiftData.week.days[day];
  const curWorker = ShiftF.getWorker(workerId);

  const name = curWorker.name;
  const roleData = ShiftF.getRoleData(curWorker);
  const partTime = curDay.workers[workerId];

  const start = String(Math.floor(partTime.start)).padStart(2, "0");
  const startHalf = partTime.start - Math.floor(partTime.start);
  const end = String(Math.floor(partTime.end)).padStart(2, "0");
  const endHalf = partTime.end - Math.floor(partTime.end);
  const workTime = PartTimeF.getWorkTime(partTime);

  return (
    <div
      className="editor-shift-worker"
      style={{
        background: `linear-gradient(90deg, ${roleData.displayColor1} 40%, ${roleData.displayColor2 ?? roleData.displayColor1} 70%)`,
      }}
    >
      <div className="editor-shift-worker-infowrapper">
        <div className="editor-shift-worker-name">{name} </div>
        <div className="editor-shift-worker-role">{roleData.nickname}</div>
      </div>
      <div className="editor-shift-worker-timewrapper">
        <div className="editor-shift-worker-partwrapper">
          <div className="editor-shift-worker-time">
            {start}
            {startHalf > 0 ? (
              <div className="editor-shift-worker-timehalf">
                .{startHalf * 10}
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="editor-shift-worker-time">
            {end}
            {endHalf > 0 ? (
              <div className="editor-shift-worker-timehalf">
                .{endHalf * 10}
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="editor-shift-worker-working">{workTime}시간</div>
      </div>
    </div>
  );
};

export default ShiftWorker;
