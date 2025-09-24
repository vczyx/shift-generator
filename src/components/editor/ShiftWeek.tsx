import React, { RefObject, useRef, useState } from "react";
import ShiftDay from "./ShiftDay";
import "../../styles/components/editor/ShiftWeek.css";
import { WeekDays } from "../../data/Shift";
import { ContextMenuHandle, ContextMenuProps } from "../ContextMenu";

interface ShiftWeekProps {
  contextMenu: RefObject<ContextMenuHandle>;
}

const ShiftWeek: React.FC<ShiftWeekProps> = (props) => {
  const [visibles, setVisibles] = useState<Record<WeekDays, boolean>>({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: true,
  });
  const [isDetails, setIsDetails] = useState(false);
  const days: WeekDays[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  const handleOnSelect = (wd: WeekDays) => {
    setVisibles(() => {
      let res = { ...visibles };

      setIsDetails((p) => {
        for (const w of Object.keys(visibles)) {
          if (!p) {
            res[w as WeekDays] = wd === w;
          } else {
            res[w as WeekDays] = true;
          }
        }

        return !p;
      });

      return res;
    });
  };

  return (
    <div className="editor-shift-week">
      {days.map((wd) => (
        <ShiftDay
          key={days.indexOf(wd)}
          weekDay={wd}
          onSelect={handleOnSelect}
          visible={visibles[wd]}
          detail={isDetails}
          contextMenu={props.contextMenu}
        />
      ))}
    </div>
  );
};
export default ShiftWeek;
