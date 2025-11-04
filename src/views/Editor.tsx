import ShiftWeek, { ShiftWeekHandles } from "../components/editor/ShiftWeek";
import "../styles/Editor.css";
import ContextMenu, {
  ContextMenuHandle,
  ContextMenuItemData,
} from "../components/ContextMenu";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import ShiftSelector from "../components/ShiftSelector";
import util from "../utils/util";
import AddressF from "../data/Address";
import Notification, { NotificationHandles } from "../components/Notification";
import useShortcut from "../hooks/useShortcut";
import { useGlobalState } from "../hooks/useGlobalState";
import ShiftWorker, {
  WorkerComponentData,
} from "../components/editor/ShiftWorker";
import WorkerSettingPanel, {
  WorkerSettingPanelHandles,
} from "../components/editor/WorkerSettingPanel";

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

  const [selected, setSelected] = useGlobalState<WorkerComponentData>(
    ShiftWorker,
    "selected",
    null
  );

  const notiRef = useRef<NotificationHandles | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const shiftDataRef = useRef<Shift>(shiftData);
  const addressRef = useRef<Address>(address);
  const shiftWeekRef = useRef<ShiftWeekHandles | null>(null);
  const workerSetPnlRef = useRef<WorkerSettingPanelHandles | null>(null);

  const display = useMemo(
    () => ({
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
    }),
    []
  );

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

  const onModifiedWorkerData = useCallback(async () => {
    const msgRes = await window.electron.showMsgBox(
      {
        type: "question",
        title: "근무자 인적 사항 변동",
        message:
          "근무자 정보가 변경되어 재 시작이 필요합니다. 재 시작 하시겠습니까?",
        buttons: ["안함", "재 시작"],
      },
      getWinId()
    );

    if (msgRes.success && msgRes.data.response === 1) {
      open(address);
    }
  }, [address]);

  useEffect(() => {
    shiftDataRef.current = shiftData;
  }, [shiftData]);
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  useEffect(() => {
    (async () => {
      const brandConfigRes = await window.electron.getBrandConfig(
        address.brand
      );
      if (!brandConfigRes.success) {
        showNoti("BRAND CONFIG를 불러오는 데에 실패했습니다.");
        console.error(brandConfigRes.error);
        return;
      }
      setBrandConfig(brandConfigRes.data);

      const shiftRes = await window.electron.getShift(address);
      if (!shiftRes.success) {
        showNoti("SHIFT DATA를 불러오는 데에 실패했습니다. ");
        console.error(shiftRes.error);
        return;
      }

      const di = await window.electron.getDataInfo();
      if (di.success) {
        const data = di.data[address.brand][address.area][address.restaurant];
        setDirInfo(data);
      }
      setShiftData(shiftRes.data);
    })();
  }, [address]);

  useEffect(() => {
    const handle = () => exit(shiftDataRef.current);

    window.electron.onAskSave(handle);
    return window.electron.clearAskSave(handle);
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
        menuActions.file.saveAs();
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
        showNoti("저장을 완료하지 못했습니다.");
        console.error(res.error);
      }
    },
    []
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

  // SHORT CUT 등록 ====================================
  useShortcut(["ctrl", "s"], () => menuActions.file.save());
  useShortcut(["ctrl", "w"], () => menuActions.file.exit());
  useShortcut(["ctrl", "shift", "s"], () => menuActions.file.saveAs());
  useShortcut(["ctrl", "n"], () => menuActions.file.newFile());
  useShortcut(["ctrl", "o"], () => menuActions.file.open());

  useShortcut(["delete"], () => menuActions.edit.delete());
  useShortcut(["f2"], () => menuActions.edit.edit());
  useShortcut(["ctrl", "g"], () => menuActions.edit.addWorker());
  useShortcut(["ctrl", "shift", "delete"], () =>
    menuActions.edit.resetWorkers()
  );

  useShortcut(["F9"], () => menuActions.settings.workerSetting());
  useShortcut(["F10"], () => menuActions.settings.brandSetting());

  // Menu Item 구성 =====================================
  const menus = useMemo<
    {
      display: string;
      items?: ContextMenuItemData[];
      onClick?: () => void;
    }[]
  >(
    () => [
      {
        display: "파일",
        items: [
          {
            type: "button",
            caption: "새 파일",
            shortInfo: "Ctrl+N",
            onClick: () => menuActions.file.newFile(),
          },
          {
            type: "button",
            caption: "열기",
            shortInfo: "Ctrl+O",
            onClick: () => menuActions.file.open(),
          },
          {
            type: "button",
            caption: "저장",
            shortInfo: "Ctrl+S",
            onClick: () => menuActions.file.save(),
          },
          {
            type: "button",
            caption: "다른 이름으로 저장",
            shortInfo: "Ctrl+Shift+S",
            onClick: () => menuActions.file.saveAs(),
          },
          {
            type: "button",
            caption: "종료",
            shortInfo: "Ctrl+W",
            onClick: () => menuActions.file.exit(),
          },
        ],
      },
      {
        display: "편집",
        items: [
          {
            type: "button",
            caption: "수정",
            enabled: selected !== null,
            shortInfo: "F2",
            onClick: () => menuActions.edit.edit(),
          },
          {
            type: "button",
            caption: "삭제",
            enabled: selected !== null,
            shortInfo: "Del",
            onClick: () => menuActions.edit.delete(),
          },
          { type: "bar" },
          {
            type: "button",
            caption: "근무자 추가",
            shortInfo: "Ctrl+G",
            onClick: () => menuActions.edit.addWorker(),
          },
          {
            type: "button",
            caption: "초기화",
            shortInfo: "Ctrl+Shift+Del",
            onClick: () => menuActions.edit.resetWorkers(),
          },
        ],
      },
      { display: "근무자 추가", onClick: () => menuActions.edit.addWorker() },
      {
        display: "정보 설정",
        items: [
          {
            type: "button",
            caption: "근무자 정보 설정",
            shortInfo: "F9",
            onClick: () => menuActions.settings.workerSetting(),
          },
          {
            type: "button",
            caption: "브랜드 정보 설정",
            shortInfo: "F10",
            onClick: () => menuActions.settings.brandSetting(),
          },
        ],
      },
      { display: "", onClick: () => menuActions.debug.openDevTool() },
    ],
    [selected]
  );

  // Menu Action 구성 ==========================================
  const menuActions = useMemo(
    () => ({
      file: {
        save: async () => {
          if (shiftSelector) return;
          await save(address, shiftData, true);
        },
        saveAs: async () => {
          if (shiftSelector) return;
          setMode("saveas");
          setShiftSelector(true);
        },
        open: async () => {
          if (shiftSelector) return;
          setMode("open");
          setShiftSelector(true);
        },
        newFile: async () => {
          await open({ ...address, shift: undefined });
        },
        exit: async () => {
          await exit(shiftData);
        },
      },
      edit: {
        addWorker: async () => shiftWeekRef.current?.addWorker(),
        resetWorkers: async () => shiftWeekRef.current?.resetWorkers(true),
        delete: async () => shiftWeekRef.current?.deleteWorker(selected),
        edit: async () => shiftWeekRef.current?.editWorker(selected),
      },
      settings: {
        workerSetting: async () => {
          if (!workerSetPnlRef.current) return;
          workerSetPnlRef.current?.setVisible(true);
        },
        brandSetting: async () => {},
      },
      debug: {
        openDevTool: async () => {
          window.electron.openDevTool(getWinId());
        },
      },
    }),
    [address, shiftData, shiftSelector, selected]
  );

  return (
    <>
      <div className="editorview" ref={divRef}>
        <div className="editorview-title">
          {address &&
            `[ ${address.brand} ] ${address.area} - ${address.restaurant} (${address.date}/${address.shift})`}
        </div>
        <ul className="editor-menuwrapper">
          {menus?.map((x, index) => (
            <li
              key={index}
              onClick={(e) => {
                if (x.items) {
                  contextMenuRef.current.openCustom(x.items, {
                    x: e.currentTarget.offsetLeft,
                    y: e.currentTarget.offsetTop + e.currentTarget.offsetHeight,
                  });
                }

                if (x.onClick) x.onClick();
              }}
              className="editor-menuitem"
            >
              {x.display}
            </li>
          ))}
        </ul>
        {brandConfig && shiftData && (
          <ShiftWeek
            onRendered={setWinSize}
            contextMenu={contextMenuRef}
            shiftInfo={{ brandConfig, shift: shiftData }}
            setShiftData={setShiftData}
            winId={getWinId()}
            showNoti={showNoti}
            ref={shiftWeekRef}
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
      <WorkerSettingPanel
        ref={workerSetPnlRef}
        defaultAddress={address}
        editorWinId={getWinId()}
        showNoti={showNoti}
        onModified={onModifiedWorkerData}
      />
      <ContextMenu enabled ref={contextMenuRef} />
      <Notification ref={notiRef} message={notiMsg} time={1000} />
    </>
  );
};
export default Editor;
