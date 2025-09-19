import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface ShiftWorkerInfoProps {
  getWId: () => number;
}

import "../../styles/components/editor/ShiftWorkerInfo.css";
import { ShiftF, currentShiftData } from "../../data/Shift";
import { format } from "date-fns";
import { currentWorkerId } from "./ShiftWorker";
import { weekDayKor } from "../../utils/util";
import { currentConfig } from "../../data/Config";
const ShiftWorkerInfo = forwardRef<unknown, ShiftWorkerInfoProps>(
  (props, ref) => {
    // 기본 값
    const worker = ShiftF.getWorker(props.getWId());
    const roleData = worker ? ShiftF.getRoleData(worker) : null;

    // Ref 설정
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // State 설정
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [show, setShow] = useState(false);

    // forwardRef Handlers
    const handlers = {
      handleMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
        timerRef.current = setTimeout(() => {
          setShow(true);
        }, 500);
      },
      handleMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
        clearTimeout(timerRef.current);
        setShow(false);
      },
      handleMouseMove: (e: MouseEvent) => {
        // const tooltipWidth = 200; // 예상 툴팁 너비
        // const tooltipHeight = 200; // 예상 툴팁 높이
        const padding = 10;

        let x = e.clientX + padding;
        let y = e.clientY + padding;

        // // 화면 너비/높이 가져오기
        // const screenWidth = window.innerWidth;
        // const screenHeight = window.innerHeight;

        // // 오른쪽으로 벗어날 경우 왼쪽으로 위치 조정
        // if (x + tooltipWidth > screenWidth) {
        //   x = e.clientX - tooltipWidth - padding;
        // }

        // // 아래쪽으로 벗어날 경우 위쪽으로 위치 조정
        // if (y + tooltipHeight > screenHeight) {
        //   y = e.clientY - tooltipHeight - padding;
        // }

        // // 왼쪽으로 벗어날 경우 오른쪽으로 위치 조정
        // if (x < 0) {
        //   x = padding;
        // }

        // // 위쪽으로 벗어날 경우 아래쪽으로 위치 조정
        // if (y < 0) {
        //   y = padding;
        // }

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
                        background: ShiftF.getRoleColorGradient(worker),
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
                      currentConfig.Restaurant.multiPositionDisplay[
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
                  <td>{ShiftF.getTotalWorkingTime(currentWorkerId)}h</td>
                </tr>
                <tr>
                  <th>근무 요일</th>
                  <td>
                    {ShiftF.getWorkWeekdays(currentWorkerId).map((wd) => (
                      <p
                        className="editor-shift-workerinfo-wdcard"
                        key={wd}
                        style={{
                          background: currentShiftData.week.days[wd].color,
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
  }
);

export default ShiftWorkerInfo;
