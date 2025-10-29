import React, {
  Dispatch,
  Ref,
  RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ShiftF from "../../data/ShiftF";
import PartTimeF from "../../data/PartTimeF";
import "../../styles/components/editor/ShiftWorker";
import { ContextMenuHandle, ContextMenuItemData } from "../ContextMenu";
import { ShiftWorkerInfoHandles } from "./ShiftWorkerInfo";
import { weekDayKor } from "../../utils/util";

/**
 * Worker Component Props 설정
 */
export interface ShiftWorkerProps {
  day: WeekDays;
  workerId: number;
  error?: string;
  infoRef: React.RefObject<ShiftWorkerInfoHandles>;
  contextMenu: RefObject<ContextMenuHandle>;
  contextMenuItems: ContextMenuItemData[];
  shiftInfo: ShiftInformation;
  setShiftData: Dispatch<React.SetStateAction<Shift>>;
  showNoti: (msg: string) => void;
}

export interface ShiftWorkerHandles {
  remove: () => void;
}

export let currentWorkerId: number = -1;
export function setCurrentWorkerId(id: number) {
  currentWorkerId = id;
}
export let globalEditing: {
  day: WeekDays;
  workerId: number;
} | null = null;
export const onChangedGlobalEditing = new CustomEvent("onChangedGlobalEditing");

const ShiftWorker = forwardRef<ShiftWorkerHandles, ShiftWorkerProps>(
  (
    {
      day,
      workerId,
      error,
      infoRef,
      contextMenu,
      contextMenuItems,
      shiftInfo,
      setShiftData,
      showNoti,
    },
    ref
  ) => {
    // 기본 정보를 가져옴
    error = error ?? "";
    const curDay = shiftInfo.shift.week.days[day];
    const curWorker = ShiftF.getWorker(shiftInfo, workerId);
    const name = curWorker.name;
    const roleData = ShiftF.getRoleData(shiftInfo, curWorker);
    const partTime = curDay.workers[workerId] ?? { start: 0, end: 0 };

    // 색 설정
    const errorColor = "rgba(50,50,50,0.5)";
    const editColor = "rgba(100, 100, 255, 0.3)";

    // State 선언
    const [errorMsg, setErrorMsg] = useState(error);
    const [errorPanel, setErrorPanel] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [startTime, setStartTime] = useState(partTime.start);
    const [beforePartTime, setBeforePartTime] = useState(partTime);
    const [endTime, setEndTime] = useState(partTime.end);
    const [zeroAnim, setZeroAnim] = useState(true);
    const getWorkingTime = () => {
      return (
        Math.round(
          PartTimeF.getWorkTime(shiftInfo, { start: startTime, end: endTime }) *
            10
        ) / 10
      );
    };

    useImperativeHandle(ref, () => ({
      remove: () => handleRemove(),
    }));

    const setError = (msg: string, panel: boolean) => {
      setErrorMsg(msg);
      setErrorPanel(panel);
    };

    // Ref
    const inputRefs = [
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
    ];

    const isFirstEdit = useRef<boolean>(false);
    const isBlur = useRef<boolean>(true);

    // 화면에 표시할 정보 변수 선언
    const start = String(Math.floor(startTime)).padStart(2, "0");
    const startHalf = startTime - Math.floor(startTime);
    const end = String(Math.floor(endTime)).padStart(2, "0");
    const endHalf = endTime - Math.floor(endTime);

    const modifyErrorMsg = () => {
      // 오류 메시지 출력

      const totalWorkingTime = ShiftF.getTotalWorkingTime(shiftInfo, workerId);
      const workingTime = ShiftF.getWorkingTime(shiftInfo, day, workerId);

      // 0 시간 이하
      if (workingTime <= 0) setError("0시간 이하", true);
      // 법정 근로 시간 초과
      else if (totalWorkingTime > roleData.limitUsageTime)
        setError(`주 ${roleData.limitUsageTime}시간 초과`, true);
      // 최대 근로 시간 초과
      else if (totalWorkingTime > roleData.maxUsageTime)
        setError(`주 ${roleData.maxUsageTime}시간 초과`, false);
      // 하루 최대 근로 시간 초과
      else if (workingTime > roleData.maxWorkingTime)
        setError(`일 ${roleData.maxWorkingTime}시간 초과`, false);
      // 오류 제거
      else setError("", false);
    };

    /**
   * Effect
   *
   * 조건 : PartTime 값이 수정되었을 때
   * 실행 : WorkingTime의 값을 수정 함
   *
  // useEffect(() => {
  //   setWorkingTime(
  //     Math.round(
  //       PartTimeF.getWorkTime({ start: startTime, end: endTime }) * 10
  //     ) / 10
  //   );
  //   currentShiftData.week.days[day].workers[workerId] = {
  //     start: startTime,
  //     end: endTime,
  //   };
  //   modifyShiftData();
  // }, [startTime, endTime]);
  */

    const handleOnModifiedShiftData = () => {
      modifyErrorMsg();
    };

    /**
     * Effect
     *
     * 조건 : 수정 모드의 여부가 수정되었을 때
     * 실행 : 수정 모드 시 PartTime.start 값을 수정할 수 있는 input 요소를 focus
     *       일반 모드 시 PartTime의 값을 조정 (0이상 48이하, endTime의 경우 최소값을 startTime으로)
     *       오류를 확인하고, 오류 메시지를 출력
     */
    useEffect(() => {
      if (isEditing) {
        // input start 요소 focus
        isFirstEdit.current = true;
        inputRefs[0].current.focus();

        // 현재 수정 중인 컴포넌트의 정보를 저장 / 수정됨 이벤트 실행
        globalEditing = { day, workerId };
        window.dispatchEvent(onChangedGlobalEditing);
      } else {
        // 0 이상 48 이하로 값 조정
        setStartTime((p) => Math.min(Math.max(0, p), 48));

        // startTime 이상 48 이하로 값 조정
        setEndTime((p) => Math.min(Math.max(startTime, p), 48));

        // 변경 사항 저장
        const x = { ...shiftInfo.shift };
        x.week.days[day].workers[workerId] = {
          start: startTime,
          end: endTime,
        };
        setShiftData(x);
      }

      modifyErrorMsg();
    }, [isEditing]);

    useEffect(() => {
      window.addEventListener("modifiedShiftData", handleOnModifiedShiftData);
      return () =>
        window.removeEventListener(
          "modifiedShiftData",
          handleOnModifiedShiftData
        );
    }, []);

    /**
     * Effect
     *
     * 조건 : globalEditing 변수 수정됨 이벤트가 호출되었을 때
     * 실행 : 방금 수정 중인 컴포넌트가 이 컴포넌트가 아니라면 수정 모드를 해제
     */
    useEffect(() => {
      const handler = () => {
        if (globalEditing === null) return;

        if (day !== globalEditing.day || workerId !== globalEditing.workerId)
          setIsEditing(false);
      };
      window.addEventListener("onChangedGlobalEditing", handler);
      setZeroAnim(false);
      return () =>
        window.removeEventListener("onChangedGlobalEditing", handler);
    }, []);

    /**
     * Handle
     *
     * 조건 : 요소를 더블클릭 했을 때
     * 실행 : 수정 모드를 변경 (toggle)
     */
    const handleDoubleClick = () => {
      setIsEditing((p) => !p);
    };

    /**
     * Handle
     *
     * 조건 : PartTime의 값을 수정했을 때
     * 실행 : 소숫점 첫째 자리까지의 값으로 State에 저장
     *
     * @param e onChange EventArgs
     * @param setValue 변경할 State의 Set 함수
     */
    const handleTimeInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      setValue: React.Dispatch<React.SetStateAction<number>>
    ) => {
      const input = e.target.value;

      // 소수점 첫째 자리까지만 허용
      const regex = /^\d+(\.\d{0,1})?$/;

      if (input === "" || regex.test(input)) {
        setValue(parseFloat(input));
      }
    };

    const handleRemove = () => {
      setZeroAnim(true);
      setTimeout(() => {
        setZeroAnim(false);
        setShiftData((prev) => {
          const x = { ...prev };
          x.week.days[day].workers = Object.fromEntries(
            Object.entries(x.week.days[day].workers).filter(
              ([id, _]) => parseInt(id) !== workerId
            )
          );
          return x;
        });
        if (infoRef.current) infoRef.current?.handleMouseLeave(null);
      }, 100);
      showNoti(`${weekDayKor[day]}요일 ${curWorker.name}(이)가 삭제되었습니다`);
    };

    /**
     * Handle
     *
     * 조건 : input 요소의 Keydown 이벤트가 발생할 때
     * 실행 : [Tab] : 다음 input 요소로 focus
     *       [Enter] : 수정모드 종료 / 변경 내용 저장
     *       [Escape] : 수정모드 종료 / 변경 내용 취소
     *
     * @param e onKeyDown EventArgs
     * @param index ref input 요소 index
     */
    const handleEditingTime = (
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number
    ) => {
      setBeforePartTime({ start: startTime, end: endTime });

      if (e.key === "Tab") {
        e.preventDefault();

        // 현재 요소 안의 다음 input 요소를 focus
        inputRefs[(index + 1) % inputRefs.length].current.focus();
      } else if (e.key === "Enter") {
        e.preventDefault();

        // 수정 모드 종료
        setIsEditing(false);
      } else if (e.key === "Escape") {
        e.preventDefault();

        // 수정 모드 종료
        setIsEditing(false);

        // 변경 사항 취소
        setStartTime(beforePartTime.start);
        setEndTime(beforePartTime.end);
      }
    };

    const handleOnContextMenu = (e: React.MouseEvent) => {
      console.log(curWorker.name, getWorkingTime());
      contextMenu.current?.open(
        [
          ...contextMenuItems,
          { type: "bar" },
          {
            type: "label",
            caption: curWorker.name,
          },
          {
            type: "button",
            caption: isEditing ? "변경 사항 저장" : "시간 수정",
            onClick: handleDoubleClick,
          },
          {
            type: "button",
            caption: "삭제",
            onClick: handleRemove,
          },
        ],
        e
      );
    };

    const handleOnBlur = () => {
      setTimeout(() => {
        if (isBlur.current) setIsEditing(false);
        isBlur.current = true;
      }, 0);
    };

    // RENDERING

    return (
      <>
        <div
          className="editor-shift-worker"
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleOnContextMenu}
          onBlur={handleOnBlur}
          style={{
            backgroundImage: ShiftF.getRoleColorGradient(shiftInfo, curWorker),
            height: zeroAnim
              ? "0px"
              : isEditing || errorMsg.length > 0
                ? "90px"
                : "70px",
            borderColor: isEditing
              ? "blue"
              : errorMsg.length > 0
                ? "red"
                : roleData.displayColor2,
          }}
          // title="더블클릭 하여 수정\n"
          onMouseEnter={(e) => {
            infoRef.current?.handleMouseEnter(e);
            currentWorkerId = workerId;
          }}
          onMouseLeave={(e) => {
            infoRef.current?.handleMouseLeave(e);
            currentWorkerId = -1;
          }}
          // onMouseMove={(e) => {
          //   infoRef.current?.handleMouseMove(e);
          // }}
        >
          <div
            className="editor-shift-worker-editingcolor"
            style={{
              backgroundColor: isEditing
                ? editColor
                : errorPanel
                  ? errorColor
                  : "rgba(0,0,0,0)",
            }}
          ></div>
          <div className="editor-shift-worker-infowrapper">
            <div className="editor-shift-worker-name">{name}</div>
            <div className="editor-shift-worker-role">{roleData.nickname}</div>
            <div className="editor-shift-worker-pos">
              {curWorker.position.map((x) => (
                <p className="editor-shift-worker-poscard" key={x}>
                  {x}
                </p>
              ))}
            </div>
          </div>
          <div className="editor-shift-worker-timewrapper">
            <div className="editor-shift-worker-partwrapper">
              <div className="editor-shift-worker-time">
                {isEditing ? (
                  <>
                    <input
                      ref={inputRefs[0]}
                      className="editor-shift-worker-timeedit"
                      type="number"
                      step={0.1}
                      minLength={0}
                      maxLength={2}
                      value={startTime}
                      onChange={(e) => handleTimeInputChange(e, setStartTime)}
                      onFocus={(e) => {
                        if (!isFirstEdit.current) isBlur.current = false;
                        else isFirstEdit.current = false;
                        e.target.select();
                      }}
                      onKeyDown={(e) => handleEditingTime(e, 0)}
                    ></input>
                  </>
                ) : (
                  <>
                    {start}
                    {startHalf > 0 ? (
                      <div className="editor-shift-worker-timehalf">
                        .{Math.round(startHalf * 10)}
                      </div>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </div>
              <div className="editor-shift-worker-time">
                {isEditing ? (
                  <>
                    <input
                      ref={inputRefs[1]}
                      className="editor-shift-worker-timeedit"
                      type="number"
                      step={0.1}
                      minLength={0}
                      maxLength={2}
                      value={endTime}
                      onChange={(e) => handleTimeInputChange(e, setEndTime)}
                      onFocus={(e) => {
                        if (!isFirstEdit.current) isBlur.current = false;
                        else isFirstEdit.current = false;
                        e.target.select();
                      }}
                      onKeyDown={(e) => handleEditingTime(e, 1)}
                    ></input>
                  </>
                ) : (
                  <>
                    {end}
                    {endHalf > 0 ? (
                      <div className="editor-shift-worker-timehalf">
                        .{Math.round(endHalf * 10)}
                      </div>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="editor-shift-worker-working">
              {getWorkingTime()}시간
            </div>
          </div>

          <div
            className="editor-shift-worker-info"
            style={{ color: errorPanel ? "red" : "blue" }}
          >
            {errorMsg.length > 0 ? errorMsg : isEditing ? "수정 중..." : ""}
          </div>
        </div>
      </>
    );
  }
);

export default ShiftWorker;
