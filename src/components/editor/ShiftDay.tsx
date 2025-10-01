import React, {
  RefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import { ShiftF, WeekDays, currentShiftData } from "../../data/Shift";
import ShiftWorker from "./ShiftWorker";
import { addDays, format } from "date-fns";
import "../../styles/components/editor/ShiftDay.css";
import ShiftWorkerInfo from "./ShiftWorkerInfo";
import { weekDayKor } from "../../utils/util";
import { currentConfig } from "../../data/Config";
import { PartTimeF } from "../../data/PartTime";
import ChartDataLabels from "chartjs-plugin-datalabels";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { ContextMenuHandle, ContextMenuItemData } from "../ContextMenu";

// ChartJS 설정
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartDataLabels,
  Title,
  Tooltip,
  Legend
);

// Props Interface
export interface ShiftDayProps {
  weekDay: WeekDays;
  onSelect: (wd: WeekDays, v: boolean) => void;
  visible: boolean;
  detail: boolean;
  contextMenu: RefObject<ContextMenuHandle>;
  scrollTop: number;
  maxHeight: number;
  infoRef: RefObject<any>;
  openAddPanel: (wd?: WeekDays) => void;
}

export interface ShiftDayHandle {
  refresh: () => void;
  workerRef: RefObject<HTMLDivElement>;
}

const weekDayDateAdd: Record<WeekDays, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

const ShiftDay = forwardRef<ShiftDayHandle, ShiftDayProps>(
  (
    {
      weekDay,
      onSelect,
      visible,
      detail,
      contextMenu,
      scrollTop,
      maxHeight,
      infoRef,
      openAddPanel,
    },
    ref
  ) => {
    // 기본 정보 설정
    const dayData = currentShiftData.week.days[weekDay];
    const curDate = format(
      addDays(currentShiftData.firstDate, weekDayDateAdd[weekDay]),
      "MM/dd"
    );

    // STATES
    const [targetSale, setTargetSale] = useState(dayData.targetSales);
    const [expectedSale, setExpectedSale] = useState(dayData.expectedSales);
    const [targetUsage, setTargetUsage] = useState(dayData.targetUsageTime);
    const [plannedUsage, setPlannedUsage] = useState(0);
    const [smh, setSmh] = useState(0);
    const [desc, setDesc] = useState(dayData.descriptions);
    const [chartData, setChartData] = useState<{
      options: ChartOptions;
      data: any;
    }>(undefined);
    const [workers, setWorkers] = useState(dayData.workers);
    const [chartHeight, setChartHeight] = useState(0);

    // REFS
    const chartRef = useRef<any>(null);
    const workerWrapperRef = useRef<HTMLDivElement>(null);

    const handlers: ShiftDayHandle = {
      refresh: () => {
        setWorkers(dayData.workers);
      },
      workerRef: useRef<HTMLDivElement>(null),
    };

    useImperativeHandle(ref, () => handlers);

    /**
     * Handle
     *
     *  조건 : window.onModifiedShiftData 커스텀 이벤트가 실행 되었을 때
     *  실행 : state를 재설정하고, 차트 데이터를 설정
     */
    const handleOnChangedWorkers = () => {
      setWorkers(dayData.workers);

      // 차트 데이터 설정 (인원 사용 현황)
      setChartHeight(Object.keys(dayData.workers).length * 44 + 100);
      setChartData({
        options: {
          responsive: true,
          maintainAspectRatio: false, // 👈 비율 고정 해제
          indexAxis: "y" as const, // 👈 이 부분이 핵심!
          plugins: {
            legend: {
              display: false,
            },
            // DATALABEL 설정 (BAR에 내용 출력)
            datalabels: {
              color: "#000",
              anchor: "start",
              align: "left",
              textAlign: "right",
              font: { size: 14, weight: "bold" },
              formatter: (value: any, context: any) => {
                const label = context.chart.data.labels?.[context.dataIndex];
                const w = ShiftF.getWorker(label);
                const roleData = ShiftF.getRoleData(w);
                const pt = { start: value[0], end: value[1] };
                return [
                  `[ ${roleData.nickname} ] ${w.name} (${w.position.join(", ")})`,
                  `${pt.start} - ${pt.end} ( ${PartTimeF.getWorkTime(pt)} )`,
                ]; // 줄바꿈
              },
            },
            // TOOLTIP 설정 (마우스 갖다 대면 세부 내용 출력)
            tooltip: {
              callbacks: {
                // 제목 (이름)
                title: (context) => {
                  const w = ShiftF.getWorker(parseInt(context[0].label));
                  if (!w)
                    return `예기치 않은 오류로 정보를 표시할 수 없습니다.`;
                  return w.name;
                },
                // 내용 (직급, 담당 포지션)
                beforeBody: (context) => {
                  const w = ShiftF.getWorker(parseInt(context[0].label));
                  if (!w)
                    return `예기치 않은 오류로 정보를 표시할 수 없습니다.`;
                  const roleData = ShiftF.getRoleData(w);
                  const posData = currentConfig.Restaurant.multiPositionDisplay;
                  return [
                    `[ 직급 ]   ${roleData.nickname}`,
                    `[ 담당 구역 ]   ${posData[w.position.length]} (${w.position.join("+")})`,
                    `[ 입사일 ]   ${format(w.joinDate, "yyyy-MM-dd")} (${ShiftF.getWorkDuration(w)})`,
                    `[ 보건증 만기일 ]   ${format(w.healthCertExpiryDate, "yyyy-MM-dd")} (${ShiftF.getHealthCertDaysLeft(w)})`,
                  ];
                },
                // 레이블 (근무 시간)
                label: (context) => {
                  const value = context.parsed.y;
                  const label = context.dataset.label || "";
                  const w = ShiftF.getWorker(parseInt(context.label));
                  if (!w)
                    return `예기치 않은 오류로 정보를 표시할 수 없습니다.`;
                  const roleData = ShiftF.getRoleData(w);
                  // 원하는 설명 추가
                  const data = context.raw as number[];
                  const pt = { start: data[0], end: data[1] };
                  return `[IN] ${pt.start}   [OUT] ${pt.end}   [WORK] ${PartTimeF.getWorkTime(pt)}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: ["영업 시간", "(인원수)"],
              },
              ticks: {
                stepSize: 1,
                callback: (value) => {
                  const workerCount = ShiftF.getWorkerCount(
                    weekDay,
                    parseInt(value.toString())
                  );
                  return [`${value}시`, `(${workerCount}명)`];
                },
              },
              min: currentConfig.Restaurant.operatingStart,
              max: currentConfig.Restaurant.operatingEnd,
            },
            y: {
              display: false,
            },
          },
        },
        data: {
          labels: Object.keys(dayData.workers),
          datasets: [
            {
              label: "근무 시간",
              type: "bar" as const,
              data: Object.values(dayData.workers).map((pt) => [
                pt.start,
                pt.end,
              ]),
              backgroundColor: (context: any) => {
                const label = context.chart.data.labels?.[context.dataIndex];
                const meta = context.chart.getDatasetMeta(context.datasetIndex);
                const bar = meta.data[context.dataIndex];
                const ctx = context.chart.ctx; // CanvasRenderingContext2D
                const w = ShiftF.getWorker(label);
                if (!w) return "white";
                const roleData = w ? ShiftF.getRoleData(w) : null;
                const x = bar?.x ?? 0;
                const y = bar?.y ?? 0;

                const gradient = ctx.createLinearGradient(
                  x - 0,
                  y - 10,
                  x + 0,
                  y + 10
                );

                gradient.addColorStop(0, roleData.displayColor1); // 시작 색
                gradient.addColorStop(
                  1,
                  roleData.displayColor2 ?? roleData.displayColor1
                ); // 끝 색

                return gradient;
              },
              barThickness: 40,
              maxBarThickness: 40,
            },
          ],
        },
      });
    };

    /**
     * Handle
     *
     *  조건 : window.onModifiedShiftData 커스텀 이벤트가 실행 되었을 때
     *  실행 : handleOnChangedWorkers 실행, SMH 계산
     */
    const handleOnModifiedShiftData = () => {
      handleOnChangedWorkers();
      setPlannedUsage(() => {
        const plan = ShiftF.getWeekPlannedUsageTime(weekDay);
        setSmh(plan > 0 ? (expectedSale * 1000) / plan : 0);
        return plan;
      });
    };

    const handleOnDoubleClick = () => {
      onSelect(weekDay, true);
    };

    /**
     * Effect
     *
     *  조건 : 렌더링 시작
     *  실행 : window.onModifiedShiftData 커스텀 이벤트를 handleOnModifiedShiftData 핸들 지정
     */
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
     *  조건 : 예상 매출 값이 수정되었을 때
     *  실행 : onModifiedShiftData 실행
     */
    useEffect(() => {
      handleOnModifiedShiftData();
    }, [expectedSale]);

    /**
     * Effect
     *
     *  조건 : 행사 내용 값이 수정되었을 때
     *  실행 : ShiftData 값 수정
     */
    useEffect(() => {
      currentShiftData.week.days[weekDay].descriptions = desc;
    }, [desc]);

    // useEffect(() => {
    //   if (!workerWrapperRef.current) return;
    //   workerWrapperRef.current.scrollTop = scrollTop;
    // }, [scrollTop]);

    // useEffect(() => {
    //   const el = workerWrapperRef.current;
    //   if (!el) return;

    //   const preventScroll = (e: WheelEvent) => {
    //     e.preventDefault();
    //   };
    //   const preventMiddleClick = (e: MouseEvent) => {
    //     if (e.button === 1) {
    //       e.preventDefault();
    //     }
    //   };

    //   el.addEventListener("wheel", preventScroll, { passive: false });
    //   el.addEventListener("mousedown", preventMiddleClick);
    //   return () => {
    //     el.removeEventListener("wheel", preventScroll);
    //     el.removeEventListener("mousedown", preventMiddleClick);
    //   };
    // }, []);

    useEffect(() => {
      workerWrapperRef.current.scrollTop = scrollTop;
    }, [scrollTop]);

    /**
     * 근무자 추가
     * @param wId 근무자 ID
     */
    const addWorker = (wId: number) => {
      ShiftF.addWorker(weekDay, wId);
      setWorkers(dayData.workers);
    };

    /**
     * ContextMenuItem 구성
     * @returns ContextMenuItems
     */
    const getContextMenuItems = (): ContextMenuItemData[] => {
      return [
        {
          type: "label",
          caption: `${curDate} (${weekDayKor[weekDay]})`,
        },
        {
          type: "button",
          caption: "추가",
          // child: Object.entries(currentShiftData.workers).map(([id, w]) => ({
          //   type: "button",
          //   caption: w.name,
          //   onClick: () => addWorker(parseInt(id)),
          // })),
          onClick: () => openAddPanel(weekDay),
        },
        {
          type: "button",
          caption: "세부 사항 " + (!detail ? "펼치기" : "접기"),
          onClick: handleOnDoubleClick,
        },
      ];
    };

    /**
     * Handle
     *
     *  조건 : 컴포넌트의 onContextMenu 이벤트가 실행되었을 때
     *  실행 : Custom Context Menu 실행
     */
    const handleOnContextMenu = (e: React.MouseEvent) => {
      contextMenu.current?.open(getContextMenuItems(), e);
    };

    // RENDERRING
    return (
      <>
        <div
          className="editor-shift-day"
          style={{
            width: detail && visible ? "1260px" : visible ? "180px" : "0px",
          }}
          onContextMenu={(e) => handleOnContextMenu(e)}
        >
          <div
            className="editor-shift-day-header"
            onClick={handleOnDoubleClick}
            title={"클릭하여 세부 사항 " + (!detail ? "펼치기" : "접기")}
            // style={{ width: detail ? "1200px" : "200px" }}
          >
            <div
              className="editor-shift-day-header-wd"
              style={{ color: dayData.color }}
            >
              {weekDayKor[weekDay]}
            </div>
            <div className="editor-shift-day-header-wrapper">
              <div
                className="editor-shift-day-header-date"
                style={{
                  color: dayData.color,
                  fontSize: desc.length > 0 ? "12" : "24",
                }}
              >
                {curDate}
              </div>
              <div className="editor-shift-day-header-desc">{desc}</div>
            </div>
          </div>
          <div className="editor-shift-day-contentwrapper">
            <div className="editor-shift-day-daywrapper">
              <div
                className="editor-shift-day-workerwrapper"
                ref={(el) => {
                  handlers.workerRef.current = el;
                  workerWrapperRef.current = el;
                }}
              >
                <ul
                  style={{
                    height: maxHeight + workerWrapperRef.current?.clientHeight,
                  }}
                >
                  {Object.keys(workers).map((wId) => (
                    <li key={parseInt(wId)}>
                      <ShiftWorker
                        day={weekDay}
                        workerId={parseInt(wId)}
                        infoRef={infoRef}
                        contextMenu={contextMenu}
                        contextMenuItems={getContextMenuItems()}
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="editor-shift-day-footer">
                <div className="editor-shift-day-footer-groupwrapper">
                  <div className="editor-shift-day-footer-valuewrapper">
                    <div className="editor-shift-day-footer-label">
                      목표 매출
                    </div>
                    <div className="editor-shift-day-footer-value">
                      {targetSale.toLocaleString("ko-kr")}
                    </div>
                  </div>
                  <div className="editor-shift-day-footer-valuewrapper">
                    <div className="editor-shift-day-footer-label">
                      예상 매출
                    </div>
                    <div className="editor-shift-day-footer-value">
                      {expectedSale.toLocaleString("ko-kr")}
                    </div>
                  </div>
                </div>
                <div className="editor-shift-day-footer-groupwrapper">
                  <div className="editor-shift-day-footer-valuewrapper">
                    <div className="editor-shift-day-footer-label">
                      목표 시간
                    </div>
                    <div className="editor-shift-day-footer-value">
                      {targetUsage.toLocaleString("ko-kr")}
                    </div>
                  </div>
                  <div className="editor-shift-day-footer-valuewrapper">
                    <div className="editor-shift-day-footer-label">
                      계획 시간
                    </div>
                    <div className="editor-shift-day-footer-value">
                      {plannedUsage.toLocaleString("ko-kr")}
                    </div>
                  </div>
                </div>
                <div className="editor-shift-day-footer-smhwrapper">
                  <div className="editor-shift-day-footer-label">S.M.H.</div>
                  <div className="editor-shift-day-footer-value">
                    {Math.floor(smh).toLocaleString("ko-kr")}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="editor-shift-day-detail-wrapper"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="editor-shift-day-detail">
                <div className="editor-shift-day-detail-info">
                  <input
                    className="editor-shift-day-detail-input"
                    placeholder="행사 내용"
                    style={{ flex: "1" }}
                    value={desc}
                    onChange={(x) => setDesc(x.target.value)}
                  ></input>
                </div>
                <div className="editor-shift-day-detail-worker">
                  <div className="editor-shift-day-detail-header">
                    인원 사용 현황
                  </div>
                  <div
                    className="editor-shift-day-detail-workercount"
                    style={{ height: chartHeight, width: 1000 }}
                  >
                    {chartData && (
                      <Chart
                        type="bar"
                        // key={chartKey}
                        ref={chartRef}
                        options={chartData?.options}
                        data={chartData?.data}
                        redraw
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

export default ShiftDay;
