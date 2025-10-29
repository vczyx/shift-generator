import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  forwardRef,
  useCallback,
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
import ShiftWorkerInfo, { ShiftWorkerInfoHandles } from "./ShiftWorkerInfo";
import { useGlobalState } from "../../hooks/useGlobalState";
import ShiftWorker, { WorkerComponentData } from "./ShiftWorker";

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
  editWorker: (wcd: WorkerComponentData) => void;
  deleteWorker: (wcd: WorkerComponentData) => void;
  resetWorkers: (ask: boolean) => void;
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

  const [curWId, _] = useGlobalState(ShiftWorker, "curWId", -1);
  const [globalEditing, setGlobalEditing] = useGlobalState<WorkerComponentData>(
    ShiftWorker,
    "globalEditing",
    null
  );

  const dayRefs = useRef<Record<WeekDays, ShiftDayHandle | null>>({
    mon: null,
    tue: null,
    fri: null,
    sat: null,
    sun: null,
    thu: null,
    wed: null,
  });
  const menuRef = useRef<ContextMenuHandle | null>(null);

  const openAddPanel = (wd?: WeekDays) => {
    setAddPanelSelectedWd(wd ?? "mon");
    setAddPanelVisible(true);
  };

  const getWorkerComponent = useCallback((wcd: WorkerComponentData) => {
    if (!dayRefs.current) return null;
    if (!wcd) return null;
    return dayRefs.current[wcd.weekday]
      .getWorkerCompRefs()
      .current.find((comp) => comp.getWorkerId() === wcd.workerId);
  }, []);

  useImperativeHandle(ref, () => ({
    addWorker: () => openAddPanel(),
    editWorker: (wcd) => {
      setGlobalEditing(wcd);
    },
    deleteWorker: (wcd) => {
      getWorkerComponent(wcd)?.remove();
    },
    resetWorkers: async (ask: boolean) => {
      if (ask) {
        const askRes = await window.electron.showMsgBox(
          {
            type: "question",
            title: "근무자 초기화",
            message: `근무자를 전부 삭제하시겠습니까?`,
            buttons: ["취소", "삭제"],
          },
          props.winId
        );

        if (!askRes.success || askRes.data.response === 0) return;
      }
      Object.values(dayRefs.current).forEach((dr) =>
        dr.resetWorkers(false, false)
      );
      props.showNoti(`근무자를 초기화 하였습니다.`);
    },
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
      ...Object.values(dayRefs.current).map(
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
                dayRefs.current[wd] = el;
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
        setShiftData={props.setShiftData}
        shiftInfo={props.shiftInfo}
      />
    </>
  );
});
export default ShiftWeek;
