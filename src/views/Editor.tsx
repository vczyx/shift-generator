import ShiftWeek from "../components/editor/ShiftWeek";
import "../styles/Editor.css";
import { ContextMenuHandle } from "../components/ContextMenu";
import { RefObject } from "react";

interface EditorProps {
  contextMenu?: RefObject<ContextMenuHandle>;
}

const Editor: React.FC<EditorProps> = (props) => {
  return (
    <div className="editorview">
      {/* <ShiftWorker day="mon" workerId={1} /> */}
      <ShiftWeek contextMenu={props.contextMenu} />
    </div>
  );
};
export default Editor;
