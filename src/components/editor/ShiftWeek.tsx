import React, { useState } from "react";
import ShiftDay from "./ShiftDay";
import "../../styles/components/editor/ShiftWeek.css";
import { WeekDays } from "../../data/Shift";

export default function ShiftWeek() {
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
      <ShiftDay
        weekDay="mon"
        onSelect={handleOnSelect}
        visible={visibles["mon"]}
        detail={isDetails}
      />
      <ShiftDay
        weekDay="tue"
        onSelect={handleOnSelect}
        visible={visibles["tue"]}
        detail={isDetails}
      />
      <ShiftDay
        weekDay="wed"
        onSelect={handleOnSelect}
        visible={visibles["wed"]}
        detail={isDetails}
      />
      <ShiftDay
        weekDay="thu"
        onSelect={handleOnSelect}
        visible={visibles["thu"]}
        detail={isDetails}
      />
      <ShiftDay
        weekDay="fri"
        onSelect={handleOnSelect}
        visible={visibles["fri"]}
        detail={isDetails}
      />
      <ShiftDay
        weekDay="sat"
        onSelect={handleOnSelect}
        visible={visibles["sat"]}
        detail={isDetails}
      />
      <ShiftDay
        weekDay="sun"
        onSelect={handleOnSelect}
        visible={visibles["sun"]}
        detail={isDetails}
      />
    </div>
  );
}
