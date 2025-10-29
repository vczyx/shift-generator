import React, {
  DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES,
  RefObject,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "../styles/components/ContextMenu.css";

type ContextMenuItemType = "label" | "button" | "bar";
export interface ContextMenuItemData {
  type: ContextMenuItemType;
  visible?: boolean;
  enabled?: boolean;
  caption?: string;
  shortInfo?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  child?: ContextMenuItemData[];
}

export interface ContextMenuProps {
  enabled: boolean;
  style?: React.CSSProperties;
}

export interface ContextMenuHandle {
  open: (items: ContextMenuItemData[], e: React.MouseEvent) => void;
  openCustom: (
    items: ContextMenuItemData[],
    position: { x: number; y: number }
  ) => void;
}

const ContextMenu = forwardRef<ContextMenuHandle, ContextMenuProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [items, setItems] = useState<ContextMenuItemData[]>([]);
    const [childVisible, setChildVisible] = useState([]);
    const [childLevel, setChildLevel] = useState(-1);
    const [tmpChildLevel, setTmpChildLevel] = useState(-1);
    const [tmpIndex, setTmpIndex] = useState(-1);
    const [enteredLevel, setEnteredLevel] = useState(-1);

    const [submenuPositions, setSubmenuPositions] = useState<
      { top: number; left: number }[]
    >([]);

    const childRefs = useRef<HTMLLIElement[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const divRef = useRef(null);

    const handles: ContextMenuHandle = {
      openCustom: (items, pos) => {
        if (!items || items.length == 0) return;
        setVisible(false);
        setItems(items);
        setPosition(pos);
        setVisible(true);
        divRef.current?.focus({ preventScroll: true });
      },
      open: (items, e) => {
        if (!items || items.length == 0) return;
        e.stopPropagation();
        handles.openCustom(items, { x: e.pageX, y: e.pageY });
      },
    };
    useImperativeHandle(ref, () => handles);

    useLayoutEffect(() => {
      const newPositions = [...submenuPositions];

      for (let level = 0; level <= childLevel; level++) {
        const ref = childRefs.current[level];
        if (ref) {
          const bound = ref.getBoundingClientRect();
          const menuWidth = 200;
          let left = bound.left + bound.width;
          let top = bound.top;

          if (left + menuWidth > window.innerWidth) {
            left = bound.left - menuWidth;
          }

          newPositions[level] = { top, left };
        }
      }

      setSubmenuPositions(newPositions);
    }, [childLevel, childVisible]);

    useEffect(() => {
      console.log(childLevel);
    }, [childLevel]);

    const handleOnBlur = (e: React.FocusEvent) => {
      setVisible(false);
    };

    const render = (dataItems: ContextMenuItemData[], level: number = -1) => {
      let top = position.y,
        left = position.x;

      if (level > -1) {
        const bound = childRefs.current[level]?.getBoundingClientRect();
        if (bound) {
          top = bound.top;
          left = bound.left + bound.width; // 부모 항목의 오른쪽에 위치
        }
        const childMenuWidth = 200; // 예상 너비
        if (left + childMenuWidth > window.innerWidth) {
          left = bound.left - childMenuWidth; // 왼쪽으로 뜨게 조정
        }
      }

      const handleTimeOut = (index: number) => {
        setChildVisible((prev) => {
          const newArr = [...prev];
          newArr[level + 1] = index;
          return newArr;
        });
        setChildLevel(level + 1);
      };

      const handleOnMouseEnter = (
        item: ContextMenuItemData,
        level: number,
        index: number,
        e: React.MouseEvent
      ) => {
        // if (childLevel - 1 === level && tmpIndex !== index) {
        //   handleOnMouseLeave(level,e);
        // }
        if (item.child) {
          if (tmpChildLevel !== childLevel) setTmpChildLevel(childLevel);

          setTmpIndex(index);
          timerRef.current = setTimeout(() => handleTimeOut(index), 500);
        }
      };

      const handleOnMouseLeave = (level: number, e: React.MouseEvent) => {
        clearTimeout(timerRef.current);

        setChildVisible((prev) => {
          const newArr = [...prev];
          newArr[level + 1] = -1;
          return newArr;
        });

        setChildLevel(level);
      };

      return (
        <>
          <ul
            style={{
              position: level > -1 ? "fixed" : "absolute",
              top:
                level > -1
                  ? (submenuPositions[level]?.top ?? position.y)
                  : position.y,
              left:
                level > -1
                  ? (submenuPositions[level]?.left ?? position.x)
                  : position.x,
            }}
            className="contextmenu-wrapper"
            onMouseEnter={() => setEnteredLevel(level)}
          >
            {dataItems.map((item, index) => {
              let childRender = <></>;

              if (item.child && childVisible[level + 1] === index) {
                childRender = render(item.child, level + 1);
              }
              return (
                <>
                  <li
                    key={index}
                    ref={(el) => {
                      if (
                        el &&
                        childRefs.current[level + 1] !== el &&
                        item.child &&
                        tmpIndex === index
                      ) {
                        childRefs.current[level + 1] = el;
                      }
                    }}
                    className={`contextmenu-item contextmenu-${item.type}`}
                    onMouseEnter={(e) =>
                      handleOnMouseEnter(item, level, index, e)
                    }
                    onMouseLeave={(e) => handleOnMouseLeave(level, e)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.onClick && item.onClick(e);
                      if (!item.child) setVisible(false);
                      else {
                        handleTimeOut(index);
                        clearTimeout(timerRef.current);
                      }
                    }}
                  >
                    <p>{item.caption}</p>
                    {item.shortInfo && (
                      <p className="contextmenu-shortinfo">{item.shortInfo}</p>
                    )}
                    {item.child &&
                      childVisible[level + 1] === index &&
                      render(item.child, level + 1)}
                  </li>
                </>
              );
            })}
          </ul>
        </>
      );
    };

    return (
      props.enabled && (
        <div
          className="contextmenu"
          tabIndex={0}
          style={{
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? "unset" : "none",
          }}
          ref={divRef}
          onBlur={handleOnBlur}
        >
          {render(items)}
        </div>
      )
    );
  }
);

export default ContextMenu;
