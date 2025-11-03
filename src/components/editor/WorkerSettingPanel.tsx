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

interface WorkerSettingPanelProps {
  defaultAddress: Address;
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
  }, [address]);

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
          {optionsArr[identifier].map((option) => (
            <option value={option}>{option}</option>
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
        >{`[ ${roleData.nickname} ] ${wInfo.name}`}</li>
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
      function setValue<T>(v: T) {
        setWorkersData((prev) => {
          const res = { ...prev };
          (res[selected][identifier] as T) = v;
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
              value={value as string}
              setValue={(v) => setValue(v)}
              type="list"
              list={brandConfig.positions}
            />
          );
        case "role":
          return (
            <ValueEditComponent
              value={value as string}
              setValue={(v) => setValue(v)}
              type="list"
              list={Object.keys(brandConfig.roles)}
            />
          );
        case "roleDetail":
          const roleData =
            brandConfig.roles[workersData[selected].role].details;
          return (
            <ValueEditComponent
              value={value as string}
              setValue={(v) => setValue(v)}
              type="list"
              list={Object.values(roleData).map((v) => v.nickname)}
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

  const renderWorkerDataKeyValue = useCallback(
    (identifier: keyof WorkerInfo) => {
      const label = workerDataKeyLabels[identifier];
      const value = workersData[selected][identifier];
      return (
        <tr>
          <th>{label}</th>
          <td>{renderWorkerDataValue(identifier)}</td>
        </tr>
      );
    },
    [workersData, selected, renderWorkerDataValue]
  );
  const renderWorkerDataSet = useCallback(() => {
    const wInfo = workersData[selected];
    console.log(workersData, selected);
    if (!wInfo) return <></>;

    return (
      <>
        {(Object.keys(wInfo) as (keyof WorkerInfo)[]).map((key) =>
          renderWorkerDataKeyValue(key)
        )}
      </>
    );
  }, [workersData, selected, renderWorkerDataKeyValue]);

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
            <tr className="workersetpnl-header-label">
              <td>브랜드명</td>
              <td>지역명</td>
              <td>매장명</td>
            </tr>
            <tr>
              <td>{renderAddressCombobox("brand")}</td>
              <td>{renderAddressCombobox("area")}</td>
              <td>{renderAddressCombobox("restaurant")}</td>
            </tr>
          </table>
          <div className="workersetpnl-workerlisttoolstrip">
            <div className="button">추가</div>
            <div className="button">삭제</div>
          </div>
          <div className="workersetpnl-contentwrapper">
            <div className="workersetpnl-workerlistwrapper">
              <ul>{renderWorkerList()}</ul>
            </div>
            <div className="workersetpnl-workerdataset">
              {renderWorkerDataSet()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default WorkerSettingPanel;
