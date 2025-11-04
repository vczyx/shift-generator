import { ko } from "date-fns/locale/ko";
import React, { CSSProperties, forwardRef } from "react";
import DatePicker from "react-datepicker";

export interface ValueEditComponentHandles {}

type ValueEditComponentProps =
  | {
      value: string;
      setValue: (value: string) => void;
      type: "string";
    }
  | {
      value: number;
      setValue: (value: number) => void;
      min?: number;
      max?: number;
      increase?: number;
      type: "number";
    }
  | {
      value: Date;
      setValue: (value: Date) => void;
      type: "date";
    }
  | {
      value: string;
      setValue: (value: string) => void;
      list: string[];
      type: "list";
    }
  | {
      value: string[];
      setValue: (value: string[]) => void;
      list: string[];
      type: "multilist";
    };

interface ValueEditComponentDefProps {
  width?: number;
  height?: number;
}
const ValueEditComponent = forwardRef<
  ValueEditComponentHandles,
  ValueEditComponentProps & ValueEditComponentDefProps
>((props, ref) => {
  const styleP: CSSProperties = { display: "flex" };
  const styleC: CSSProperties = { flex: "1" };
  switch (props.type) {
    case "list":
      return (
        <span style={styleP}>
          <select
            value={props.value}
            onChange={(e) => props.setValue(e.target.value)}
            style={styleC}
          >
            {props.list.map((v, i) => (
              <option key={i}>{v}</option>
            ))}
          </select>
        </span>
      );
    case "date":
      return (
        <span style={styleP}>
          <DatePicker
            selected={props.value as Date}
            onChange={(e: Date) => props.setValue(e)}
            locale={ko}
            dateFormat={"yyyy-MM-dd"}
          />
        </span>
      );
    case "multilist":
      return (
        <span style={styleP}>
          {props.list.map((v, i) => (
            <label key={i} style={styleC}>
              <input
                type="checkbox"
                checked={props.value.includes(v)}
                onChange={(e) => {
                  const isChecked = props.value.includes(v);
                  const res = isChecked
                    ? props.value.filter((x) => x !== v)
                    : props.value.concat(v);
                  props.setValue(res);
                }}
              />
              {v}
            </label>
          ))}
        </span>
      );
    case "number":
      const btnStyle: CSSProperties = {
        width: "20px",
        padding: 0,
        borderRadius: 0,
        border: "1px solid black",
      };
      return (
        <span style={styleP}>
          <button
            onClick={(e) => props.setValue(props.value - (props.increase ?? 1))}
            disabled={props.value <= props.min}
            style={btnStyle}
            className="button"
          >
            -
          </button>
          <input
            type="number"
            value={props.value}
            min={props.min}
            max={props.max}
            onChange={(e) => props.setValue(parseInt(e.target.value))}
          />
          <button
            onClick={(e) => props.setValue(props.value + (props.increase ?? 1))}
            disabled={props.value >= props.max}
            style={btnStyle}
            className="button"
          >
            +
          </button>
        </span>
      );
    default:
      return (
        <span style={styleP}>
          <input
            style={styleC}
            value={props.value}
            onChange={(e) => props.setValue(e.target.value)}
          />
        </span>
      );
  }
});

export default ValueEditComponent;
