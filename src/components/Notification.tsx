import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface NotificationProps {
  message: string;
  time: number;
}
export interface NotificationHandles {
  show: () => void;
  hide: () => void;
}

const Notification = forwardRef<NotificationHandles, NotificationProps>(
  ({ message, time }, ref) => {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    useImperativeHandle(ref, () => ({
      show: () => {
        setVisible(false);
        setVisible(true);
      },
      hide: () => {
        clearTimeout(timerRef.current);
        setVisible(false);
      },
    }));

    useEffect(() => {
      if (visible) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), time);
        return () => clearTimeout(timerRef.current);
      }
    }, [visible]);

    return (
      <div style={{ ...styles.container, opacity: visible ? 1 : 0 }}>
        <div style={styles.message}>{message}</div>
      </div>
    );
  }
);

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none", // 마우스 이벤트 무시
    zIndex: 999999,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    transition: "opacity 0.2s ease-in-out",
  },
  message: {
    backgroundColor: "#333",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "4px",
    marginTop: "8px",
    fontSize: "14px",
    fontWeight: "bole",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  },
};

export default Notification;
