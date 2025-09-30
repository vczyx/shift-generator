import React, { useState } from "react";
import "../../styles/components/editor/AddWorkerPanel.css";
import { days, weekDayKor } from "../../utils/util";
import { WeekDays } from "../../data/Shift";

interface AddWorkerPanelProps {
  visible: boolean;
  onExit: () => void;
}

const AddWorkerPanel: React.FC<AddWorkerPanelProps> = ({ visible, onExit }) => {
  const [selectedWd, setSelectedWd] = useState<WeekDays>("mon");
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
        <h3>요일 선택</h3>
        <ul className="editor-addworker-weekdaywrapper">
          {days.map((wd, index) => (
            <li
              key={index}
              className="button"
              style={{ backgroundColor: selectedWd === wd ? "#f55" : "unset" }}
              onClick={(e) => {
                setSelectedWd(wd);
              }}
            >
              {weekDayKor[wd]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddWorkerPanel;
