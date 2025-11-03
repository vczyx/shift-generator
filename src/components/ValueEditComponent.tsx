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
  const style: CSSProperties = {
    width: props.width ?? "unset",
    height: props.height,
  };
  switch (props.type) {
    case "list":
      return (
        <select
          value={props.value}
          onChange={(e) => props.setValue(e.target.value)}
          style={style}
        >
          {props.list.map((v) => (
            <option>{v}</option>
          ))}
        </select>
      );
    case "date":
      return (
        <DatePicker
          selected={props.value as Date}
          onChange={(e: Date) => props.setValue(e)}
          locale={ko}
          dateFormat={"yyyy-MM-dd"}
        />
      );
    case "multilist":
      return <></>; // todo
    default:
      return (
        <input
          value={props.value}
          onChange={(e) => props.setValue(e.target.value)}
          style={style}
        />
      );
  }
});

export default ValueEditComponent;
