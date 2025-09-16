import ShiftWorker from "../components/editor/ShiftWorker";
import "../styles/Editor.css";

import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";

export default function Editor() {
  return (
    <div className="editorview">
      <ShiftWorker day="mon" workerId={1} />
    </div>
  );
}
