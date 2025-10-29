import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../styles/components/editor/ShiftWorkerInfo.css";
import ShiftF from "../../data/ShiftF";
import { format } from "date-fns";
import { weekDayKor } from "../../utils/util";
import { currentConfig } from "../../data/Config";
import { useGlobalState } from "../../hooks/useGlobalState";
import ShiftWorker from "./ShiftWorker";

// Props Interface
interface ShiftWorkerInfoProps {
  shiftInfo: ShiftInformation;
  setShiftData: (data: Shift) => void;
}

export interface ShiftWorkerInfoHandles {
  handleMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: MouseEvent) => void;
}

const ShiftWorkerInfo = forwardRef<
  ShiftWorkerInfoHandles,
  ShiftWorkerInfoProps
>((props, ref) => {
  // Ref 설정
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // State 설정
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const mouseCheck = useRef<boolean>(false);
  const [curWId, _] = useGlobalState(ShiftWorker, "curWId", -1);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const worker = useMemo(
    () => ShiftF.getWorker(props.shiftInfo, curWId),
    [props.shiftInfo, curWId]
  );
  const roleData = useMemo(
    () => (worker ? ShiftF.getRoleData(props.shiftInfo, worker) : null),
    [worker, props.shiftInfo]
  );

  // forwardRef Handlers
  const handlers = {
    handleMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      timerRef.current = setTimeout(() => {
        mouseCheck.current = true;
        handlers.handleMouseMove(e.nativeEvent);
        setShow(true);
      }, 500);
    },
    handleMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      clearTimeout(timerRef.current);
      setShow(false);
      mouseCheck.current = false;
    },
    handleMouseMove: (e: MouseEvent) => {
      if (!mouseCheck.current) return;
      const tooltipWidth = tooltipRef.current?.offsetWidth ?? 250;
      const tooltipHeight = tooltipRef.current?.offsetHeight ?? 400;
      const padding = 10;

      let x = e.clientX + padding;
      let y = e.clientY + padding;

      // 화면 너비/높이 가져오기
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // 오른쪽으로 벗어날 경우 왼쪽으로 위치 조정
      if (x + tooltipWidth > screenWidth) {
        x = e.clientX - tooltipWidth - padding;
      }

      // 아래쪽으로 벗어날 경우 위쪽으로 위치 조정
      if (y + tooltipHeight > screenHeight) {
        y = e.clientY - tooltipHeight - padding;
      }

      // 왼쪽으로 벗어날 경우 오른쪽으로 위치 조정
      if (x < 0) {
        x = padding;
      }

      // 위쪽으로 벗어날 경우 아래쪽으로 위치 조정
      if (y < 0) {
        y = padding;
      }

      x = Math.max(x, padding);
      y = Math.max(y, padding);

      setPosition({ x, y });
    },
  };
  useImperativeHandle(ref, () => handlers);

  useEffect(() => {
    window.addEventListener("mousemove", handlers.handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handlers.handleMouseMove);
    };
  }, []);

  return (
    <div
      className="editor-shift-workerinfo"
      style={{
        width: "250px",
        height: show ? "400px" : "0px",
        top: position.y,
        left: position.x,
      }}
      ref={tooltipRef}
    >
      {worker && (
        <div className="editor-shift-workerinfo-contentbox">
          <table>
            <thead>
              <tr>
                <th colSpan={2}>
                  {worker.name}{" "}
                  <p style={{ fontSize: "12" }}>({worker.role})</p>
                </th>
              </tr>
              <tr className="thr"></tr>
            </thead>

            <tbody>
              <tr>
                <th>직급</th>
                <td>
                  <p
                    className="editor-shift-workerinfo-rolecard"
                    style={{
                      background: ShiftF.getRoleColorGradient(
                        props.shiftInfo,
                        worker
                      ),
                    }}
                  >
                    {roleData.nickname}
                  </p>
                </td>
              </tr>
              <tr>
                <th>담당 구역</th>
                <td>
                  {
                    currentConfig.Brand.multiPositionDisplay[
                      worker.position.length
                    ]
                  }
                  {worker.position.map((x) => (
                    <p key={x} className="editor-shift-workerinfo-poscard">
                      {x}
                    </p>
                  ))}
                </td>
              </tr>
              <tr>
                <th>입사일</th>
                <td>{format(worker.joinDate, "yy-MM-dd")}</td>
              </tr>
              <tr>
                <th>근속 기한</th>
                <td>{ShiftF.getWorkDuration(worker)}</td>
              </tr>
              <tr>
                <th>보건증 만기일</th>
                <td>
                  {format(worker.healthCertExpiryDate, "yy-MM-dd")} (
                  {ShiftF.getHealthCertDaysLeft(worker)}일)
                </td>
              </tr>

              <tr className="thr"></tr>
              <tr>
                <th>최대 근로가능</th>
                <td>{roleData.maxUsageTime}h</td>
              </tr>
              <tr>
                <th>현재 주 근로</th>
                <td>{ShiftF.getTotalWorkingTime(props.shiftInfo, curWId)}h</td>
              </tr>
              <tr>
                <th>근무 요일</th>
                <td>
                  {ShiftF.getWorkWeekdays(props.shiftInfo, curWId).map((wd) => (
                    <p
                      className="editor-shift-workerinfo-wdcard"
                      key={wd}
                      style={{
                        background: props.shiftInfo.shift.week.days[wd].color,
                      }}
                    >
                      {weekDayKor[wd]}
                    </p>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default ShiftWorkerInfo;
