import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ShiftDay, { ShiftDayHandle } from "./ShiftDay";
import "../../styles/components/editor/ShiftWeek.css";
import ContextMenu, {
  ContextMenuHandle,
  ContextMenuItemData,
} from "../ContextMenu";
import AddWorkerPanel from "./AddWorkerPanel";
import { days } from "../../utils/util";
import { currentWorkerId } from "./ShiftWorker";
import ShiftWorkerInfo, { ShiftWorkerInfoHandles } from "./ShiftWorkerInfo";

// Props Interface
interface ShiftWeekProps {
  contextMenu: RefObject<ContextMenuHandle>;
  shiftInfo: ShiftInformation;
  setShiftData: Dispatch<SetStateAction<Shift>>;
  onRendered: () => void;
  winId: number;
  showNoti: (msg: string) => void;
}

export interface ShiftWeekHandles {
  addWorker: () => void;
}

const ShiftWeek = forwardRef<ShiftWeekHandles, ShiftWeekProps>((props, ref) => {
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
  const [addPanelVisible, setAddPanelVisible] = useState(false);
  const [addPanelSelectedWd, setAddPanelSelectedWd] = useState<WeekDays>("mon");
  const dayRefs = useRef<(ShiftDayHandle | null)[]>([]);
  const menuRef = useRef<ContextMenuHandle | null>(null);

  const openAddPanel = (wd?: WeekDays) => {
    setAddPanelSelectedWd(wd ?? "mon");
    setAddPanelVisible(true);
  };

  useImperativeHandle(ref, () => ({
    addWorker: () => openAddPanel(),
  }));

  const infoRef = useRef<ShiftWorkerInfoHandles | null>(null);

  useEffect(() => {
    props.onRendered();
  }, []);

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
      ...dayRefs.current.map(
        (el) =>
          el.workerRef.current.scrollHeight - el.workerRef.current.clientHeight
      )
    );
    if (maxHeight !== max) setMaxHeight(max);
    setScrollTop((prev) => {
      return Math.min(Math.max(0, prev + e.deltaY), max);
    });
  };

  // RENDERRING
  return (
    <>
      <div className="editor-shift-week" onWheel={handleOnScroll}>
        <div className="editor-shift-week-daywrapper">
          {days.map((wd, index) => (
            <ShiftDay
              key={index}
              weekDay={wd}
              onSelect={handleOnSelect}
              visible={visibles[wd as WeekDays]}
              detail={isDetails}
              contextMenu={props.contextMenu}
              scrollTop={scrollTop}
              ref={(el) => {
                dayRefs.current[index] = el;
              }}
              maxHeight={maxHeight}
              infoRef={infoRef}
              openAddPanel={openAddPanel}
              setShiftData={props.setShiftData}
              shiftInfo={props.shiftInfo}
              winId={props.winId}
              showNoti={props.showNoti}
            />
          ))}
        </div>
      </div>
      <ContextMenu enabled ref={menuRef} />
      <AddWorkerPanel
        visible={addPanelVisible}
        onExit={() => setAddPanelVisible(false)}
        infoRef={infoRef}
        dayRefs={dayRefs}
        selectedWdState={[addPanelSelectedWd, setAddPanelSelectedWd]}
        setShiftData={props.setShiftData}
        shiftInfo={props.shiftInfo}
      />
      <ShiftWorkerInfo
        ref={infoRef}
        getWId={() => currentWorkerId}
        setShiftData={props.setShiftData}
        shiftInfo={props.shiftInfo}
      />
    </>
  );
});
export default ShiftWeek;
