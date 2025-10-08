import React, {
  RefObject,
  useState,
  useReducer,
  useImperativeHandle,
  forwardRef,
} from "react";
import "../../styles/components/editor/AddWorkerPanel.css";
import { days, weekDayKor } from "../../utils/util";
import ShiftF from "../../data/ShiftF";
import { setCurrentWorkerId } from "./ShiftWorker";
import { ShiftDayHandle } from "./ShiftDay";

interface AddWorkerPanelProps {
  visible: boolean;
  onExit: () => void;
  infoRef: RefObject<any>;
  dayRefs: RefObject<(ShiftDayHandle | null)[]>;
  selectedWdState: [WeekDays, React.Dispatch<React.SetStateAction<WeekDays>>];
  shiftInfo: ShiftInformation;
  setShiftData: (data: Shift) => void;
}

interface AddWorkerPanelHandle {
  forceLoad: () => void;
}

const AddWorkerPanel = forwardRef<AddWorkerPanelHandle, AddWorkerPanelProps>(
  (
    {
      visible,
      onExit,
      infoRef,
      dayRefs,
      selectedWdState,
      shiftInfo,
      setShiftData,
    },
    ref
  ) => {
    const [selectedWd, setSelectedWd] = selectedWdState;
    const [, forceLoad] = useReducer((e) => e + 1, 0);
    useImperativeHandle(ref, () => ({
      forceLoad: forceLoad,
    }));

    return (
      <div
        className="editor-addworker-overlay"
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
        onClick={onExit}
      >
        <div
          className="editor-addworker-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <h2>근무자 추가</h2>
          <ul className="editor-addworker-weekdaywrapper">
            {days.map((wd, index) => (
              <li
                key={index}
                className="button"
                style={{
                  backgroundColor: selectedWd === wd ? "#f55" : undefined,
                }}
                onClick={(e) => {
                  setSelectedWd(wd);
                }}
              >
                {weekDayKor[wd]}
              </li>
            ))}
          </ul>
          <ul className="editor-addworker-workerwrapper">
            {Object.entries(shiftInfo.shift.workers).map(([wId, w], index) => {
              const enabled = !(
                wId in shiftInfo.shift.week.days[selectedWd].workers
              );

              return (
                <li
                  key={index}
                  className={enabled ? "button" : undefined}
                  style={{
                    backgroundImage: ShiftF.getRoleColorGradient(shiftInfo, w),
                    filter: enabled ? undefined : "brightness(0.5)",
                  }}
                  onMouseEnter={(e) => {
                    infoRef.current?.handleMouseEnter(e);
                    setCurrentWorkerId(parseInt(wId));
                  }}
                  onMouseLeave={(e) => {
                    infoRef.current?.handleMouseLeave(e);
                    setCurrentWorkerId(-1);
                  }}
                  onClick={() => {
                    if (!enabled) return;
                    setShiftData(
                      ShiftF.addWorker(shiftInfo, selectedWd, parseInt(wId))
                    );
                    dayRefs.current[days.indexOf(selectedWd)].refresh();
                    forceLoad();
                    onExit();
                  }}
                >
                  {w.name}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
);

export default AddWorkerPanel;
