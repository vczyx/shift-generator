import ShiftWeek from "../components/editor/ShiftWeek";
import "../styles/Editor.css";
import ContextMenu, { ContextMenuHandle } from "../components/ContextMenu";
import { RefObject, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ipcRenderer } from "electron";
import ShiftSelector from "../components/ShiftSelector";
import util from "../utils/util";

interface EditorProps {
  // contextMenu?: RefObject<ContextMenuHandle>;
}

const Editor: React.FC<EditorProps> = (props) => {
  const params = useParams();
  const query = new URLSearchParams(useLocation().search);
  const contextMenuRef = useRef<ContextMenuHandle | null>(null);
  const winId = parseInt(query.get("winId"));

  const [address, setAddress] = useState<Address>({
    brand: params.brand,
    area: params.area,
    restaurant: params.restaurant,
    date: params.date,
    shift: params.shift,
  });

  const [brandConfig, setBrandConfig] = useState<BrandConfig>(null);
  const [shiftData, setShiftData] = useState<Shift>(null);
  const [shiftSelector, setShiftSelector] = useState(false);
  const [mode, setMode] = useState<"saveas" | "open">("saveas");

  const [dirInfo, setDirInfo] = useState<{
    [date: string]: string[];
  }>();

  const display = {
    saveas: {
      title: "다른 이름으로 저장",
      buttons: {
        yes: "저장",
        no: "취소",
      },
    },
    open: {
      title: "열기",
      buttons: {
        yes: "열기",
        no: "취소",
      },
    },
  };

  const getDate = () =>
    shiftData?.firstDate ?? util.parseYYYYMMDD(address.date);
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
        address.date,
        address.shift
      );
      if (!shiftRes.success) {
        window.alert(
          "SHIFT DATA를 불러오는 데에 실패했습니다. 자세한 내용은 Console을 확인하십시오."
        );
        console.error(shiftRes.error);
        return;
      }

      const di = await window.electron.getDataInfo();
      if (di.success) {
        const data = di.data[address.brand][address.area][address.restaurant];
        setDirInfo(data);
        console.log(di);
      }

      setShiftData(shiftRes.data);
    })();
  }, [address]);

  useEffect(() => {
    window.electron.onAskSave(menuActions.exit);
  }, []);

  const askSave = async (): Promise<boolean | null> => {
    const res = await window.electron.showMsgBox(
      {
        type: "question",
        title: "변경 사항 저장",
        message: "변경 사항을 저장하시겠습니까?",
        buttons: ["취소", "저장 안함", "저장"],
      },
      winId
    );

    if (!res.success) {
      window.alert(res.error);
      return;
    }

    switch (res.data.response) {
      case 2:
        return true;
      case 1:
        return false;
      case 0:
        return null;
    }
  };

  const menuActions = {
    openDevTool: async () => {
      window.electron.openDevTool(winId);
    },
    save: async (showMsg: boolean = true) => {
      const res = await window.electron.writeFile(
        `data/${address.brand}/${address.area}/${address.restaurant}/${address.shift}.json`,
        JSON.stringify(shiftData.week, null, 2),
        true
      );
      if (!showMsg) return;
      if (res.success) {
        await window.electron.showMsgBox(
          {
            type: "info",
            title: "저장 완료",
            message: "성공적으로 저장되었습니다.",
            buttons: ["확인"],
          },
          winId
        );
      } else {
        await window.electron.showMsgBox(
          {
            type: "error",
            title: "오류",
            message: "저장을 완료하지 못했습니다. " + res.error,
            buttons: ["확인"],
          },
          winId
        );
      }
    },
    saveAs: async () => {
      setMode("saveas");
      setShiftSelector(true);
    },
    open: async () => {
      setMode("open");
      setShiftSelector(true);
    },
    newFile: async () => {},
    exit: async () => {
      const isSave = await askSave();

      if (isSave === null) return;
      if (isSave === true) await menuActions.save(false);
      const res = await window.electron.closeWindow(winId);
      if (!res.success) {
        await window.electron.showMsgBox(
          {
            type: "error",
            title: "오류",
            message: "종료 수행을 완료하지 못했습니다." + res.error,
            buttons: ["확인"],
          },
          winId
        );
      }
    },
  };

  return (
    <>
      <div className="editorview" ref={divRef}>
        {brandConfig && shiftData && (
          <ShiftWeek
            contextMenu={contextMenuRef}
            shiftInfo={{ brandConfig, shift: shiftData }}
            setShiftData={setShiftData}
            menuAction={menuActions}
          />
        )}
      </div>
      <ContextMenu enabled ref={contextMenuRef} />
      {shiftData && (
        <ShiftSelector
          visible={shiftSelector}
          setVisible={setShiftSelector}
          defaultAddress={address}
          onSelected={(d) => {
            window.alert(`${d.date}/${d.shift}`);
          }}
          dirInfos={dirInfo}
          options={{ newFile: mode === "saveas" }}
          display={display[mode]}
        />
      )}
    </>
  );
};
export default Editor;
