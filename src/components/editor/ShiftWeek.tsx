import React, { RefObject, WheelEventHandler, useRef, useState } from "react";
import ShiftDay from "./ShiftDay";
import "../../styles/components/editor/ShiftWeek.css";
import { WeekDays } from "../../data/Shift";
import { ContextMenuHandle, ContextMenuProps } from "../ContextMenu";

// Props Interface
interface ShiftWeekProps {
  contextMenu: RefObject<ContextMenuHandle>;
}

const ShiftWeek: React.FC<ShiftWeekProps> = (props) => {
  // STATES
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
  const [scrollTop, setScrollTop] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);

  const days: WeekDays[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  /**
   * Handle
   *
   *  조건 : ShiftDay 컴포넌트 내에서 자세히 보기를 실행했을 때
   *  실행 : 다른 요일의 컴포넌트를 비활성화 (visible 설정), isDetail을 설정
   * @param wd WeekDays
   */
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

  const handleOnScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    // setScrollTop(e.)
    // console.log(dayRefs.current);

    const max = Math.max(
      ...dayRefs.current.map((el) => el.scrollHeight - el.clientHeight)
    );
    if (maxHeight !== max) setMaxHeight(max);
    setScrollTop((prev) => {
      console.log("max", max);
      console.log("cur", Math.min(Math.max(0, prev + e.deltaY), max));
      return Math.min(Math.max(0, prev + e.deltaY), max);
    });
  };

  // RENDERRING
  return (
    <div
      className="editor-shift-week"
      onWheel={handleOnScroll}
      // onMouseDown={() => {
      //   console.log(dayRefs.current);
      // }}
    >
      {days.map((wd, index) => (
        <ShiftDay
          key={index}
          weekDay={wd}
          onSelect={handleOnSelect}
          visible={visibles[wd]}
          detail={isDetails}
          contextMenu={props.contextMenu}
          scrollTop={scrollTop}
          ref={(el) => {
            dayRefs.current[index] = el;
          }}
          maxHeight={maxHeight}
        />
      ))}
    </div>
  );
};
export default ShiftWeek;
