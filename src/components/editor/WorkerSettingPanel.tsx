import React, {
  Dispatch,
  SetStateAction,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import "../../styles/components/editor/WorkerSettingPanel.css";
import ShiftF from "../../data/ShiftF";
import ValueEditComponent from "../ValueEditComponent";
import { generateNumericId } from "../../utils/util";

interface WorkerSettingPanelProps {
  defaultAddress: Address;
  editorWinId: number;
  showNoti: (text: string) => void;
  onModified: () => void;
}

export interface WorkerSettingPanelHandles {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

const WorkerSettingPanel = forwardRef<
  WorkerSettingPanelHandles,
  WorkerSettingPanelProps
>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [address, setAddress] = useState<Address>(props.defaultAddress);
  const [dataInfo, setDataInfo] = useState<GetDataInfoResponse>(null);
  const [workersData, setWorkersData] = useState<{
    [workerId: number]: WorkerInfo;
  }>({});
  const [brandConfig, setBrandConfig] = useState<BrandConfig>();
  const [selected, setSelected] = useState<number>(-1);

  const optionsArr = useMemo(
    () => ({
      brand: dataInfo ? Object.keys(dataInfo ?? {}) : [],
      area: dataInfo ? Object.keys(dataInfo[address?.brand] ?? {}) : [],
      restaurant: dataInfo
        ? Object.keys(dataInfo[address?.brand][address?.area])
        : [],
    }),
    [dataInfo, address]
  );

  const loadData = useCallback(async () => {
    const res = await window.electron.getDataInfo();
    if (res.success) {
      setDataInfo(res.data);
    }
  }, []);

  useEffect(() => {
    if (visible) loadData();
  }, [visible]);

  useEffect(() => {
    window.electron
      .getBrandConfig(address.brand)
      .then((res) => setBrandConfig(res.data));
    window.electron.getWorkers(address).then((res) => {
      setWorkersData(res.data);
      const list = Object.keys(res.data).map((v) => Number(v));
      if (list.length > 0) setSelected(list[0]);
    });
  }, [address, dataInfo]);

  const handleAddWorker = useCallback(() => {
    let id: number;
    setWorkersData((prev) => {
      const arr = { ...prev };
      id = generateNumericId(Object.keys(arr).map((v) => Number(v)));
      arr[id] = {
        name: "새 근무자",
        joinDate: new Date(),
        healthCertExpiryDate: new Date(),
        position: [],
        role: Object.keys(brandConfig.roles)[0],
        roleDetail: Object.keys(Object.values(brandConfig.roles)[0].details)[0],
        fixedShift: undefined,
        maxWorkTime: 1,
        minWorkTime: 1,
        tcCoveragePerHour: 0,
        workType: "variable",
      };
      return arr;
    });
    setSelected(id);
  }, [brandConfig]);
  const handleRemoveWorker = useCallback(async () => {
    if (!workersData[selected]) return;
    const msgRes = await window.electron.showMsgBox(
      {
        type: "question",
        title: "근무자 삭제",
        message: `${workersData[selected].name}(을)를 정말로 삭제하시겠습니까?`,
        buttons: ["아니요", "예"],
      },
      props.editorWinId
    );
    if (msgRes.success && msgRes.data.response === 1) {
      setWorkersData((prev) => {
        const arr = { ...prev };
        delete arr[selected];
        return arr;
      });
    }
  }, [workersData, selected]);
  const handleCancel = useCallback(() => setVisible(false), []);
  const handleSave = useCallback(async () => {
    const res = await window.electron.setWorkers(address, workersData);
    setVisible(false);
    props.onModified();
  }, [address, workersData]);

  const renderAddressCombobox = useCallback(
    (identifier: "brand" | "area" | "restaurant") => {
      return (
        <select
          id={identifier}
          name={identifier}
          className="workersetpnl-combobox"
          value={address[identifier]}
          onChange={(e) =>
            setAddress((prev) => {
              const res = { ...prev };
              res[identifier] = e.target.value;
              return res;
            })
          }
        >
          {optionsArr[identifier].map((option, i) => (
            <option key={i} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    },
    [address, optionsArr]
  );

  const renderWorkerList = useCallback(() => {
    return Object.entries(workersData).map(([wId, wInfo], i) => {
      const roleData = ShiftF.getRoleData({ brandConfig, shift: null }, wInfo);
      return (
        <li
          key={i}
          className={
            "button" +
            (selected === Number(wId) ? " workersetpnl-selecteditem" : "")
          }
          onClick={() => setSelected(Number(wId))}
        >{`[ ${roleData?.nickname} ] ${wInfo?.name}`}</li>
      );
    });
  }, [brandConfig, workersData, selected]);

  const workerDataKeyLabels = useMemo<Record<keyof WorkerInfo, string>>(
    () => ({
      name: "이름",
      role: "직급",
      roleDetail: "세부 직급",
      position: "담당 포지션",
      joinDate: "입사일",
      healthCertExpiryDate: "보건증 만기일",
      tcCoveragePerHour: "시간 당 TC 완료율",
      maxWorkTime: "최대 근로 가능 시간",
      minWorkTime: "최소 근로 가능 시간",
      workType: "근무 시간",
      fixedShift: "고정 근무",
    }),
    []
  );

  const renderWorkerDataValue = useCallback(
    (identifier: keyof WorkerInfo) => {
      const value = workersData[selected][identifier];
      function setValue<T>(v: T, ext?: [i: keyof WorkerInfo, v: any][]) {
        setWorkersData((prev) => {
          const res = { ...prev };
          (res[selected][identifier] as T) = v;
          if (ext) {
            ext.forEach(([idf, val]) => ((res[selected][idf] as any) = val));
          }
          return res;
        });
      }
      switch (identifier) {
        case "joinDate":
        case "healthCertExpiryDate":
          return (
            <ValueEditComponent
              value={value as Date}
              setValue={(v) => setValue(v)}
              type="date"
            />
          );
        case "position":
          return (
            <ValueEditComponent
              value={value as string[]}
              setValue={(v) => setValue(v)}
              type="multilist"
              list={brandConfig.positions}
            />
          );
        case "role":
          return (
            <ValueEditComponent
              value={value as string}
              setValue={(v) =>
                setValue(v, [
                  ["roleDetail", Object.keys(brandConfig.roles[v].details)[0]],
                ])
              }
              type="list"
              list={Object.keys(brandConfig.roles)}
            />
          );
        case "roleDetail":
          const roleData =
            brandConfig.roles[workersData[selected].role].details;
          return (
            <ValueEditComponent
              value={roleData[value as string].nickname}
              setValue={(v) =>
                setValue(
                  Object.entries(roleData)
                    .filter(([_, value]) => value.nickname === v)
                    .map(([key, _]) => key)
                )
              }
              type="list"
              list={Object.values(roleData).map((v) => v.nickname)}
            />
          );
        case "maxWorkTime":
        case "minWorkTime":
          return (
            <ValueEditComponent
              value={value as number}
              setValue={(v) => setValue(v)}
              type="number"
              min={1}
            />
          );
        case "tcCoveragePerHour":
          return (
            <ValueEditComponent
              value={value as number}
              setValue={(v) => setValue(v)}
              type="number"
              min={0}
            />
          );
        case "workType":
          return (
            <ValueEditComponent
              value={value === "fixed" ? "고정" : "가변"}
              setValue={(v) => setValue(v === "고정" ? "fixed" : "variable")}
              list={["고정", "가변"]}
              type="list"
            />
          );
        default:
          return (
            <ValueEditComponent
              value={value as string}
              setValue={(v) => setValue(v)}
              type="string"
            />
          );
      }
    },
    [workersData, selected]
  );

  const renderWorkerDataSet = useCallback(() => {
    const wInfo = workersData[selected];
    console.log(workersData, selected);
    if (!wInfo) return <></>;

    return (
      <>
        {(Object.keys(wInfo) as (keyof WorkerInfo)[]).map((key, i) => (
          <tr key={i}>
            <th>{workerDataKeyLabels[key]}</th>
            <td>{renderWorkerDataValue(key)}</td>
          </tr>
        ))}
      </>
    );
  }, [workersData, selected]);

  useImperativeHandle(
    ref,
    () => ({ visible: visible, setVisible: setVisible }),
    [visible]
  );

  return (
    <>
      <div
        className="overlay"
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
        onMouseDown={() => setVisible(false)}
      >
        <div
          className="overay-panel workersetpnl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <h2>근무자 인적 정보 설정</h2>
          <table className="workersetpnl-header">
            <thead>
              <tr className="workersetpnl-header-label">
                <td>브랜드명</td>
                <td>지역명</td>
                <td>매장명</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{renderAddressCombobox("brand")}</td>
                <td>{renderAddressCombobox("area")}</td>
                <td>{renderAddressCombobox("restaurant")}</td>
              </tr>
            </tbody>
          </table>
          <div className="workersetpnl-workerlisttoolstrip">
            <div className="button" onClick={handleAddWorker}>
              추가
            </div>
            <div className="button" onClick={handleRemoveWorker}>
              삭제
            </div>
          </div>
          <div className="workersetpnl-contentwrapper">
            <div className="workersetpnl-workerlistwrapper">
              <ul>{renderWorkerList()}</ul>
            </div>
            <div className="workersetpnl-workerdataset">
              <table>
                <tbody>{renderWorkerDataSet()}</tbody>
              </table>
            </div>
          </div>
          <div className="workersetpnl-footer">
            <div
              className="button"
              style={{ background: "coral" }}
              onClick={handleCancel}
            >
              취소
            </div>
            <div
              className="button"
              style={{ background: "lightgreen", width: 100 }}
              onClick={handleSave}
            >
              저장
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default WorkerSettingPanel;
