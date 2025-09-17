import ShiftDay from "../components/editor/ShiftDay";
import ShiftWorker from "../components/editor/ShiftWorker";
import "../styles/Editor.css";

export default function Editor() {
  return (
    <div className="editorview">
      {/* <ShiftWorker day="mon" workerId={1} /> */}
      <ShiftDay weekDay="mon" />
    </div>
  );
}
