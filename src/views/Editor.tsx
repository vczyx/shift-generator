import ShiftWeek from "../components/editor/ShiftWeek";
import "../styles/Editor.css";
import ContextMenu, { ContextMenuHandle } from "../components/ContextMenu";
import { RefObject, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

interface EditorProps {
  // contextMenu?: RefObject<ContextMenuHandle>;
}

const Editor: React.FC<EditorProps> = (props) => {
  const params = useParams();
  const contextMenuRef = useRef<ContextMenuHandle | null>(null);
  const [brand, setBrand] = useState<string>(params.brand);
  const [area, setArea] = useState<string>(params.area);
  const [restaurant, setRestaurant] = useState<string>(params.restaurant);
  const [shift, setShift] = useState<string>(params.shift);

  const [brandConfig, setBrandConfig] = useState<BrandConfig>(null);
  const [shiftData, setShiftData] = useState<Shift>(null);

  // const
  console.log(params);
  console.log(brand, area, restaurant, shift);
  useEffect(() => {
    (async () => {
      const brandConfigRes = await window.electron.getBrandConfig(brand);
      if (!brandConfigRes.success) {
        window.alert(
          "BRAND CONFIG를 불러오는 데에 실패했습니다. 자세한 내용은 Console을 확인하십시오."
        );
        console.error(brandConfigRes.error);
        return;
      }
      setBrandConfig(brandConfigRes.data);

      const shiftRes = await window.electron.getShift(
        brand,
        area,
        restaurant,
        shift
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
  }, [brand, area, restaurant, shift]);

  return (
    <>
      <div className="editorview">
        {brandConfig && shiftData && (
          <ShiftWeek
            contextMenu={contextMenuRef}
            shiftInfo={{ brandConfig, shift: shiftData }}
            setShiftData={setShiftData}
          />
        )}
      </div>
      <ContextMenu enabled ref={contextMenuRef} />
    </>
  );
};
export default Editor;
