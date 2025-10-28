import React, { useCallback, useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import util from "../utils/util";
import "../styles/components/ShiftSelector.css";
import AddressF from "../data/Address";

interface ShiftSelectorProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  onSelected: (address: Address) => void;
  defaultAddress: Address;
  dirInfos: {
    [date: string]: string[];
  };

  display?: {
    title?: string;
    descriptions?: string;
    buttons?: {
      no: string;
      yes: string;
    };
  };
  options?: { newFile?: boolean };
}

const ShiftSelector: React.FC<ShiftSelectorProps> = (props) => {
  const [weekRange, setWeekRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [curAddress, setCurAddress] = useState(props.defaultAddress);
  const [path, setPath] = useState(AddressF.toShiftPath(props.defaultAddress));
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const handleChange = useCallback(
    (date: Date | null, modifyPath?: boolean) => {
      if (date) {
        const [start, end] = getWeekRange(date);
        setWeekRange([start, end]);
        setCurAddress((prev) => {
          const newV = { ...prev, date: format(start, "yyyyMMdd") };
          if (modifyPath ?? true) setPath(AddressF.toShiftPath(newV));
          return newV;
        });
        // setPath(
        //   (prev) =>
        //     `${format(start, "yyyyMMdd")}/${prev.split("/")[1] ?? "새 시프트 파일"}`
        // );
      } else {
        setWeekRange([null, null]);
      }
    },
    []
  );

  useEffect(() => {
    if (!props.visible) return;
    setPath(AddressF.toShiftPath(props.defaultAddress));
    setCurAddress(props.defaultAddress);
    handleChange(AddressF.getDate(props.defaultAddress));
    setError("");
    inputRef.current?.focus();
  }, [props.visible]);

  useEffect(() => {
    if (!util.isValidDateYYYYMMDD(curAddress.date))
      setError("날짜가 유효하지 않습니다.");
    else if (!!!curAddress.shift.trim()) setError("이름을 입력하세요.");
    else if (
      !(props?.options?.newFile ?? true) &&
      !props.dirInfos[curAddress.date]?.includes(curAddress.shift + ".json")
    )
      setError("파일이 존재하지 않습니다.");
    else setError("");
  }, [curAddress]);

  const handleSelect = () => {
    if (error !== "") return;
    // props.setVisible(false);
    props.onSelected(curAddress);
  };

  return (
    <>
      <div
        className="overlay"
        style={{
          opacity: props.visible ? 1 : 0,
          pointerEvents: props.visible ? "auto" : "none",
        }}
        onMouseDown={() => props.setVisible(false)}
      >
        <div
          className="overay-panel shiftselector"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <h2>{props?.display?.title ?? "시프트 파일을 선택하세요."}</h2>
          <p>
            {props?.display?.descriptions ??
              "날짜에 대한 시프트 파일을 선택하세요."}
          </p>
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
                {(props?.options?.newFile ?? true) &&
                  curAddress.date === format(weekRange[0], "yyyyMMdd") &&
                  !props.dirInfos[format(weekRange[0], "yyyyMMdd")]?.includes(
                    curAddress.shift + ".json"
                  ) &&
                  !!curAddress.shift.trim() && (
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
                            curAddress.shift === shift.split(".")[0]
                              ? "#11dd11"
                              : "white",
                        }}
                        onClick={() =>
                          setCurAddress((prev) => {
                            const newV = {
                              ...prev,
                              shift: shift.split(".")[0],
                            };
                            setPath(AddressF.toShiftPath(newV));
                            return newV;
                          })
                        }
                      >
                        {shift.split(".")[0]}
                        {props?.defaultAddress.shift ===
                          shift.split(".")[0] && (
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
          <div
            className="shiftselector-path"
            onFocus={() => inputRef?.current?.focus()}
            tabIndex={0}
          >
            <input
              type="text"
              ref={inputRef}
              value={path}
              onChange={(e) =>
                setCurAddress((prev) => {
                  const path = e.target.value;
                  const adr = AddressF.fromShiftPath(path, prev);

                  if (adr?.date) handleChange(AddressF.getDate(adr), false);
                  if (!adr?.shift) adr.shift = "";
                  setPath(path);
                  console.log(adr);
                  return adr;
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSelect();
                else if (e.key === "Escape") props.setVisible(false);
              }}
            />
            <br />
            <p
              className="shiftselector-errorlabel"
              style={{ height: error === "" ? "0px" : "16px" }}
            >
              {error}
            </p>
          </div>

          <div className="shiftselector-buttons">
            <div
              className="button"
              onClick={() => {
                props.setVisible(false);
              }}
            >
              {props?.display?.buttons?.no ?? "취소"}
            </div>
            <div className="button" onClick={handleSelect}>
              {props?.display?.buttons?.yes ?? "선택"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShiftSelector;
