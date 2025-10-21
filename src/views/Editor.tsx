import ShiftWeek from "../components/editor/ShiftWeek";
import "../styles/Editor.css";
import ContextMenu, { ContextMenuHandle } from "../components/ContextMenu";
import { RefObject, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

interface EditorProps {
  // contextMenu?: RefObject<ContextMenuHandle>;
}

const Editor: React.FC<EditorProps> = (props) => {
  const params = useParams();
  const query = new URLSearchParams(useLocation().search);
  const contextMenuRef = useRef<ContextMenuHandle | null>(null);

  const [address, setAddress] = useState<{
    brand: string;
    area: string;
    restaurant: string;
    shift: string;
  }>({
    brand: params.brand,
    area: params.area,
    restaurant: params.restaurant,
    shift: params.shift,
  });

  const [brandConfig, setBrandConfig] = useState<BrandConfig>(null);
  const [shiftData, setShiftData] = useState<Shift>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    // 렌더링 완료 후 크기 측정
    const { width, height } = el.getBoundingClientRect();

    if (width > 0 && height > 0) {
      const winId = parseInt(
        new URLSearchParams(location.search).get("winId") || "0"
      );
      window.electron?.setWindowSize(winId, {
        width: Math.round(width),
        height: Math.round(height),
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      const brandConfigRes = await window.electron.getBrandConfig(
        address.brand
      );
      if (!brandConfigRes.success) {
        window.alert(
          "BRAND CONFIG를 불러오는 데에 실패했습니다. 자세한 내용은 Console을 확인하십시오."
        );
        console.error(brandConfigRes.error);
        return;
      }
      setBrandConfig(brandConfigRes.data);

      const shiftRes = await window.electron.getShift(
        address.brand,
        address.area,
        address.restaurant,
        address.shift
      );
      if (!shiftRes.success) {
        window.alert(
          "SHIFT DATA를 불러오는 데에 실패했습니다. 자세한 내용은 Console을 확인하십시오."
        );
        console.error(shiftRes.error);
        return;
      }

      setShiftData(shiftRes.data);
    })();
  }, [address]);

  const saveFile = async () => {
    const res = await window.electron.writeFile(
      `data/${address.brand}/${address.area}/${address.restaurant}/${address.shift}.json`,
      JSON.stringify(shiftData.week, null, 2),
      true
    );
    if (res.success) {
      await window.electron.showMsgBox({
        type: "info",
        title: "저장 완료",
        message: "성공적으로 저장되었습니다.",
        button: ["확인"],
      });
    } else {
      await window.electron.showMsgBox({
        type: "error",
        title: "오류",
        message: "저장을 완료하지 못했습니다. " + res.error,
        button: ["확인"],
      });
    }
  };

  return (
    <>
      <div className="editorview" ref={divRef}>
        {brandConfig && shiftData && (
          <ShiftWeek
            contextMenu={contextMenuRef}
            shiftInfo={{ brandConfig, shift: shiftData }}
            setShiftData={setShiftData}
            save={saveFile}
          />
        )}
      </div>
      <ContextMenu enabled ref={contextMenuRef} />
    </>
  );
};
export default Editor;
