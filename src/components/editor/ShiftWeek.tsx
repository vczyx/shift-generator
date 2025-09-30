import React, { RefObject, useRef, useState } from "react";
import ShiftDay from "./ShiftDay";
import "../../styles/components/editor/ShiftWeek.css";
import { WeekDays } from "../../data/Shift";
import ContextMenu, {
  ContextMenuHandle,
  ContextMenuItemData,
} from "../ContextMenu";

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
  const menuRef = useRef<ContextMenuHandle | null>(null);

  const days: WeekDays[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const menus: {
    display: string;
    items?: ContextMenuItemData[];
    onClick?: () => void;
  }[] = [
    { display: "파일", items: [{ type: "button", caption: "asd" }] },
    { display: "편집", items: [{ type: "button", caption: "asd" }] },
    { display: "근무자 추가" },
    { display: "" },
  ];

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
    <>
      <div className="editor-shift-week" onWheel={handleOnScroll}>
        <ul className="editor-shift-week-menuwrapper">
          {menus.map((x, index) => (
            <li
              key={index}
              onClick={(e) => {
                if (x.items) {
                  menuRef.current.openCustom(x.items, {
                    x: e.currentTarget.offsetLeft,
                    y: e.currentTarget.offsetTop + e.currentTarget.offsetHeight,
                  });
                }

                if (x.onClick) x.onClick();
              }}
              className="editor-shift-week-menuitem"
            >
              {x.display}
            </li>
          ))}
        </ul>
        <div className="editor-shift-week-daywrapper">
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
      </div>
      <ContextMenu enabled ref={menuRef} />
    </>
  );
};
export default ShiftWeek;
