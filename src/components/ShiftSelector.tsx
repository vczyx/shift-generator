import React, { useEffect, useState } from "react";
import { Address } from "../views/Editor";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { addDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import util, { range } from "../utils/util";
import "../styles/components/ShiftSelector.css";

interface ShiftSelectorProps {
  visible: boolean;
  onSelected: (date: Date) => void;
  defaultDate: Date;
  defaultShift: string;
  dirInfos: {
    [date: string]: string[];
  };
}

const ShiftSelector: React.FC<ShiftSelectorProps> = (props) => {
  const [weekRange, setWeekRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [path, setPath] = useState(
    `${format(props.defaultDate, "yyyyMMdd")}/${props.defaultShift}`
  );

  useEffect(() => {
    handleChange(props.defaultDate);
  }, [props.defaultDate]);

  // 선택된 날짜 기준으로 월요일~일요일 범위 계산
  const getWeekRange = (date: Date): [Date, Date] => {
    const day = date.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return [monday, sunday];
  };

  const handleChange = (date: Date | null) => {
    if (date) {
      const [start, end] = getWeekRange(date);
      setWeekRange([start, end]);
      setPath(
        (prev) =>
          `${format(start, "yyyyMMdd")}/${prev.split("/")[1] ?? "새 시프트 파일"}`
      );
    } else {
      setWeekRange([null, null]);
    }
  };

  return (
    <>
      <div
        className="overlay"
        style={{
          opacity: props.visible ? 1 : 0,
          pointerEvents: props.visible ? "auto" : "none",
        }}
      >
        <div className="overay-panel shiftselector">
          <h2>다른 이름으로 저장</h2>
          <p>다른 이름으로 저장 할 날짜와 이름을 입력하세요</p>
          {/* <div>
            <div className="button">추가</div>
          </div> */}
          <div className="shiftselector-wrapper">
            <div>
              <DatePicker
                selected={weekRange[0]}
                onChange={(d: [Date, Date]) => handleChange(d[0])}
                startDate={weekRange[0]}
                endDate={weekRange[1]}
                selectsRange
                dateFormat="yyyy-MM-dd"
                locale={ko}
                placeholderText="날짜를 선택하세요"
                calendarStartDay={1}
                inline
              />
            </div>
            <div className="shiftselector-right">
              <p style={{ padding: 5, border: "1px solid black", width: 300 }}>
                {format(weekRange[0], "yyyyMMdd")}
              </p>
              <ul className="shiftselector-itemcontainer">
                {path.split("/")[0] === format(weekRange[0], "yyyyMMdd") &&
                  !props.dirInfos[format(weekRange[0], "yyyyMMdd")]?.includes(
                    path.split("/")[1] + ".json"
                  ) && (
                    <li
                      className="shiftselector-item button"
                      style={{
                        backgroundColor: "#11dddd",
                      }}
                    >
                      {path.split("/")[1]}
                      <br />
                      <p style={{ fontSize: 12 }}>새로 생성</p>
                    </li>
                  )}
                {props.dirInfos[format(weekRange[0], "yyyyMMdd")] &&
                  props.dirInfos[format(weekRange[0], "yyyyMMdd")].map(
                    (shift, i) => (
                      <li
                        className="shiftselector-item button"
                        key={i}
                        style={{
                          backgroundColor:
                            path.split("/")[1] === shift.split(".")[0]
                              ? "#11dd11"
                              : "white",
                        }}
                        onClick={() =>
                          setPath(
                            `${format(weekRange[0], "yyyyMMdd")}/${shift.split(".")[0]}`
                          )
                        }
                      >
                        {shift.split(".")[0]}
                        {props.defaultShift === shift && (
                          <>
                            <br />
                            <p style={{ fontSize: 12 }}>현재 파일</p>
                          </>
                        )}
                      </li>
                    )
                  )}
              </ul>
            </div>
          </div>
          <input
            className="shiftselector-path"
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "enter") {
                handleChange(util.parseYYYYMMDD(path.split("/")[0]));
              }
            }}
          />
          <div className="shiftselector-buttons">
            <div className="button">취소</div>
            <div className="button">저장</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShiftSelector;
