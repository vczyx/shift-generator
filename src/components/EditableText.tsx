import React, {
  Dispatch,
  ForwardedRef,
  ReactNode,
  SetStateAction,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface EditableTextRenderArgs {
  valueState: [string | number, Dispatch<SetStateAction<string | number>>];
  isEditingState: [boolean, Dispatch<SetStateAction<boolean>>];
}

interface CommonProps {
  isEditing?: boolean;
  render?: (e: EditableTextRenderArgs) => ReactNode;
  editable?: boolean;
  defaultInputAttributes?: React.HTMLAttributes<HTMLInputElement>;
  onChangeValue?: (value: string | number) => void;
  maxValue?: number;
  minValue?: number;
}

type TypedProps =
  | { type: "text"; value: string }
  | { type: "number"; value: number };

type EditableTextProps = CommonProps &
  TypedProps &
  React.HTMLAttributes<HTMLSpanElement>;

const EditableText = forwardRef<HTMLSpanElement, EditableTextProps>(
  (
    {
      render,
      value,
      isEditing,
      editable,
      onChangeValue,
      defaultInputAttributes,
      type,
      maxValue,
      minValue,
      ...rest
    },
    ref
  ) => {
    const [valueState, setValue] = useState(
      value ?? (type === "number" ? 0 : "")
    );
    const [isEditingState, setIsEditing] = useState(isEditing ?? false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => setValue(value), [value]);
    useEffect(() => setIsEditing(isEditing), [isEditing]);
    useEffect(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }, [isEditingState]);

    const handleEndEdit = useCallback(() => {
      setIsEditing(false);
      setValue((prev) => {
        let v: number | string;
        if (type === "number") {
          v = parseInt(prev.toString().replace(/,/g, ""), 10);
          if (minValue) v = Math.max(minValue, v);
          if (maxValue) v = Math.min(maxValue, v);
          v = isNaN(v) ? 0 : v;
        } else {
          v = prev.toString();
          if (minValue) v = v.slice(minValue, v.length);
          if (maxValue) v = v.slice(0, maxValue);
        }
        onChangeValue(v);
        return v;
      });
    }, []);

    return (
      <span
        ref={ref}
        onClick={(e) => {
          setIsEditing(true);
        }}
        {...rest}
      >
        {render ? (
          render({
            valueState: [valueState, setValue],
            isEditingState: [isEditingState, setIsEditing],
          })
        ) : isEditingState ? (
          <input
            type="text"
            ref={inputRef}
            value={valueState}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              height: "100%",
              background: "inherit",
              fontSize: "inherit",
              fontFamily: "inherit",
              lineHeight: "inherit",
              textAlign: "inherit",
              fontWeight: "inherit",
            }}
            onChange={(e) => setValue(e.target.value)}
            // onFocus={(e) => }
            onBlur={(e) => {
              e.stopPropagation();
              handleEndEdit();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") handleEndEdit();
            }}
            {...defaultInputAttributes}
          />
        ) : type === "text" ? (
          valueState
        ) : (
          valueState.toLocaleString("ko-kr")
        )}
      </span>
    );
  }
);

export default EditableText;
