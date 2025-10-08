import React, { useEffect, useState } from "react";
import "../styles/components/FileExplorer.css";
import fileIco from "../assets/file.ico";
import dirIco from "../assets/folder.ico";
import dirgIco from "../assets/folder-gray.ico";
interface FileExplorerProps {
  defaultPath: string;
  filterExt?: string[];
  subDir?: boolean;
  style?: React.CSSProperties;
  onSelected: (p: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = (props) => {
  // props.subDir = props.subDir ?? true;
  // props.filterExt = props.filterExt ?? [];
  const [dirInfo, setDirInfo] = useState<DirectoryInfo>(null);
  const [fold, setFold] = useState<{ [p: string]: boolean }>({});
  const [selected, setSelected] = useState<string>("");
  const imgSize = 18;

  const getRender = (dInfo: DirectoryInfo, p: string = "") => {
    return (
      <ul className="fileexp-dir">
        {Object.entries(dInfo.directories).map(([subDName, subDInfo]) => (
          <li className="fileexp-item" key={`${p}/${subDName}`}>
            <div
              className="fileexp-item-content button"
              onClick={() => {
                const x = `${p}/${subDName}`;
                setFold((prev) => {
                  const o = { ...prev };
                  o[x] = !o[x];
                  return o;
                });
                setSelected(x);
              }}
              style={{
                background:
                  selected === `${p}/${subDName}` ? "#2ef" : undefined,
              }}
            >
              <img
                src={dirIco}
                width={imgSize}
                className="fileexp-item-img"
              ></img>
              <span>{subDName}</span>
            </div>
            {subDInfo.directories &&
              fold[`${p}/${subDName}`] &&
              getRender(subDInfo, `${p}/${subDName}`)}
          </li>
        ))}
        {dInfo.files.map((fName) => (
          <li className="fileexp-item" key={`${p}/${fName}`}>
            {" "}
            <div
              className="fileexp-item-content button"
              onClick={() => {
                setSelected(`${p}/${fName}`);
              }}
              onDoubleClick={() => {
                props.onSelected(`${p}/${fName}`);
              }}
              style={{
                background: selected === `${p}/${fName}` ? "#2ef" : undefined,
              }}
            >
              <img
                src={fileIco}
                width={imgSize}
                className="fileexp-item-img"
              ></img>
              <span> {fName}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  useEffect(() => {
    window.electron
      .getDirectoryInfo(props.defaultPath)
      .then((res) => setDirInfo(res.success ? res.data : null));
  }, []);
  return (
    <div className="fileexp" style={{ ...props?.style }}>
      {dirInfo && getRender(dirInfo)}
    </div>
  );
};

export default FileExplorer;
