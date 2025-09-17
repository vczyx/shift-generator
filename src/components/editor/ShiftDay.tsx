import React, { useEffect, useRef, useState } from "react";
import { ShiftF, WeekDays, currentShiftData } from "../../data/Shift";
import ShiftWorker, { currentWorkerId } from "./ShiftWorker";
import { addDays, format } from "date-fns";
import "../../styles/components/editor/ShiftDay.css";
import ShiftWorkerInfo from "./ShiftWorkerInfo";
import { weekDayKor } from "../../utils/util";

export interface ShiftDayProps {
  weekDay: WeekDays;
}

const weekDayDateAdd: Record<WeekDays, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

const ShiftDay: React.FC<ShiftDayProps> = ({ weekDay }) => {
  const dayData = currentShiftData.week.days[weekDay];
  const curDate = format(
    addDays(currentShiftData.firstDate, weekDayDateAdd[weekDay]),
    "MM/dd"
  );
  const [targetSale, setTargetSale] = useState(dayData.targetSales);
  const [expectedSale, setExpectedSale] = useState(dayData.expectedSales);
  const [targetUsage, setTargetUsage] = useState(dayData.targetUsageTime);
  const [plannedUsage, setPlannedUsage] = useState(0);
  const [smh, setSmh] = useState(0);

  const infoRef = useRef<any>(null);

  const handleOnModifiedShiftData = () => {
    setPlannedUsage((pre) => {
      const plan = ShiftF.getWeekPlannedUsageTime(weekDay);
      setSmh(plan > 0 ? (expectedSale * 1000) / plan : 0);
      return plan;
    });
  };

  useEffect(() => {
    window.addEventListener("onModifiedShiftData", handleOnModifiedShiftData);
    handleOnModifiedShiftData();
    return () =>
      window.removeEventListener(
        "onModifiedShiftData",
        handleOnModifiedShiftData
      );
  }, []);

  useEffect(() => {
    handleOnModifiedShiftData();
  }, [expectedSale]);

  return (
    <>
      <div className="editor-shift-day">
        <div className="editor-shift-day-header">
          <div
            className="editor-shift-day-header-wd"
            style={{ color: dayData.color }}
          >
            {weekDayKor[weekDay]}
          </div>
          <div className="editor-shift-day-header-wrapper">
            <div
              className="editor-shift-day-header-date"
              style={{ color: dayData.color }}
            >
              {curDate}
            </div>
            <div className="editor-shift-day-header-desc">
              {dayData.descriptions}
            </div>
          </div>
        </div>
        <ul className="editor-shift-day-workerwrapper">
          {Object.keys(dayData.workers).map((wId) => (
            <li key={parseInt(wId)}>
              <ShiftWorker
                day={weekDay}
                workerId={parseInt(wId)}
                infoRef={infoRef}
              />
            </li>
          ))}
        </ul>
        <div className="editor-shift-day-footer">
          <div className="editor-shift-day-footer-groupwrapper">
            <div className="editor-shift-day-footer-valuewrapper">
              <div className="editor-shift-day-footer-label">목표 매출</div>
              <div className="editor-shift-day-footer-value">
                {targetSale.toLocaleString("ko-kr")}
              </div>
            </div>
            <div className="editor-shift-day-footer-valuewrapper">
              <div className="editor-shift-day-footer-label">예상 매출</div>
              <div className="editor-shift-day-footer-value">
                {expectedSale.toLocaleString("ko-kr")}
              </div>
            </div>
          </div>
          <div className="editor-shift-day-footer-groupwrapper">
            <div className="editor-shift-day-footer-valuewrapper">
              <div className="editor-shift-day-footer-label">목표 시간</div>
              <div className="editor-shift-day-footer-value">
                {targetUsage.toLocaleString("ko-kr")}
              </div>
            </div>
            <div className="editor-shift-day-footer-valuewrapper">
              <div className="editor-shift-day-footer-label">계획 시간</div>
              <div className="editor-shift-day-footer-value">
                {plannedUsage.toLocaleString("ko-kr")}
              </div>
            </div>
          </div>
          <div className="editor-shift-day-footer-smhwrapper">
            <div className="editor-shift-day-footer-label">S.M.H.</div>
            <div className="editor-shift-day-footer-value">
              {Math.floor(smh).toLocaleString("ko-kr")}
            </div>
          </div>
        </div>
      </div>
      <ShiftWorkerInfo ref={infoRef} getWId={() => currentWorkerId} />
    </>
  );
};

export default ShiftDay;
