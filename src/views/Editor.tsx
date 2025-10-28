import ShiftWeek from "../components/editor/ShiftWeek";
import "../styles/Editor.css";
import ContextMenu, { ContextMenuHandle } from "../components/ContextMenu";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import ShiftSelector from "../components/ShiftSelector";
import util from "../utils/util";
import AddressF from "../data/Address";
import Notification, { NotificationHandles } from "../components/Notification";

interface EditorProps {
  // contextMenu?: RefObject<ContextMenuHandle>;
}

const Editor: React.FC<EditorProps> = (props) => {
  const params = useParams();
  const query = new URLSearchParams(useLocation().search);
  const contextMenuRef = useRef<ContextMenuHandle | null>(null);
  const getWinId = () => parseInt(query.get("winid"));

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
  const [notiMsg, setNotiMsg] = useState("");

  const notiRef = useRef<NotificationHandles | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

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

  const showNoti = useCallback(
    (message: string) => {
      setNotiMsg(message);
      notiRef.current?.show();
    },
    [notiRef]
  );

  const setWinSize = useCallback(() => {
    requestAnimationFrame(() => {
      const el = divRef.current;
      if (!el) return;

      // 렌더링 완료 후 크기 측정
      const { width, height } = el.getBoundingClientRect();

      if (width > 0 && height > 0) {
        const winId = parseInt(
          new URLSearchParams(location.search).get("winId") || "0"
        );
        window.electron?.setWindowSize(getWinId(), {
          width: Math.round(width),
          height: Math.round(height),
        });
      }
    });
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

      const shiftRes = await window.electron.getShift(address);
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
      }
      console.log(address, shiftRes.data);
      setShiftData(shiftRes.data);
    })();
  }, [address]);

  useEffect(() => {
    const handle = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handle);
    return window.removeEventListener("beforeunload", handle);
  }, []);

  useEffect(() => {
    window.electron.onAskSave(() => exit(shiftData));
  }, []);

  const askSave = useCallback(async (): Promise<boolean | null> => {
    const res = await window.electron.showMsgBox(
      {
        type: "question",
        title: "변경 사항 저장",
        message: "변경 사항을 저장하시겠습니까?",
        buttons: ["취소", "저장 안함", "저장"],
      },
      getWinId()
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
  }, []);

  const save = useCallback(
    async (adr: Address, data: Shift, showMsg?: boolean) => {
      if (adr.shift === "undefined") {
        menuActions.saveAs();
        return;
      }
      const res = await window.electron.writeFile(
        `data/${AddressF.toPath(adr)}.json`,
        JSON.stringify(data.week, null, 2),
        true
      );
      if (!showMsg ?? true) return;
      if (res.success) {
        showNoti("저장되었습니다");
      } else {
        showNoti(
          "저장을 완료하지 못했습니다. 자세한 내용은 Console을 확인하십시오."
        );
        console.error(res.error);
      }
    },
    [getWinId]
  );

  const saveAs = useCallback(
    async (newAdr: Address, data: Shift) => {
      if (!AddressF.equals(address, newAdr)) {
        const msgRes = await window.electron.showMsgBox(
          {
            type: "question",
            title: "다른 이름으로 저장",
            message: dirInfo[newAdr?.date]?.includes(newAdr?.shift + ".json")
              ? "해당 위치에 이미 파일이 존재합니다. 덮어씌우시겠습니까?"
              : "해당 위치에 저장하시겠습니까?",
            buttons: ["아니요", "예"],
          },
          getWinId()
        );
        if (msgRes.data.response === 0) return;

        setAddress(newAdr);
      }
      setShiftSelector(false);
      save(newAdr, data, true);
    },
    [address, dirInfo]
  );

  const open = useCallback(
    async (newAdr: Address) => {
      exit(shiftData, async () => {
        await window.electron.openEditor(newAdr);
      });
    },
    [shiftData]
  );

  const exit = useCallback(
    async (data: Shift, afterSaveCallBack?: () => Promise<void>) => {
      const isSave = await askSave();
      if (isSave === null) return;
      if (isSave === true) await save(address, data, false);
      if (afterSaveCallBack) await afterSaveCallBack();
      const res = await window.electron.closeWindow(getWinId());
      if (!res.success) {
        showNoti("종료하지 못했습니다.");
      }
    },
    [address]
  );

  const menuActions = useMemo(
    () => ({
      openDevTool: async () => {
        window.electron.openDevTool(getWinId());
      },
      save: async (showMsg: boolean = true) => {
        await save(address, shiftData, showMsg);
      },
      saveAs: async () => {
        setMode("saveas");
        setShiftSelector(true);
      },
      open: async () => {
        setMode("open");
        setShiftSelector(true);
      },
      newFile: async () => {
        await open({ ...address, shift: undefined });
      },
      exit: async () => {
        await exit(shiftData);
      },
    }),
    [address, shiftData]
  );

  return (
    <>
      <div className="editorview" ref={divRef}>
        <div className="editorview-title">
          {address &&
            `[ ${address.brand} ] ${address.area} - ${address.restaurant} (${address.date}/${address.shift})`}
        </div>
        {brandConfig && shiftData && (
          <ShiftWeek
            onRendered={setWinSize}
            contextMenu={contextMenuRef}
            shiftInfo={{ brandConfig, shift: shiftData }}
            setShiftData={setShiftData}
            menuAction={menuActions}
          />
        )}
      </div>
      {shiftData && (
        <ShiftSelector
          visible={shiftSelector}
          setVisible={setShiftSelector}
          defaultAddress={address}
          onSelected={(newAdr) => {
            switch (mode) {
              case "saveas": {
                saveAs(newAdr, shiftData);
                break;
              }
              case "open": {
                open(newAdr);
                break;
              }
            }
          }}
          dirInfos={dirInfo}
          options={{ newFile: mode === "saveas" }}
          display={display[mode]}
        />
      )}
      <ContextMenu enabled ref={contextMenuRef} />
      <Notification ref={notiRef} message={notiMsg} time={1000} />
    </>
  );
};
export default Editor;
