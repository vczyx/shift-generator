import React, { useState } from "react";
import FileExplorer from "../components/FileExplorer";
import AddressF from "../data/Address";

const Main: React.FC = () => {
  const [brand, setBrand] = useState("KFC");
  const [area, setArea] = useState("TestArea");
  const [restaurant, setRestaurant] = useState("TestStation");
  const [date, setDate] = useState("20250922");
  const [shift, setShift] = useState("test1");

  // window.electron.getDataInfo().then((x) => console.log(x));
  return (
    <>
      <input value={brand} onChange={(e) => setBrand(e.target.value)}></input>
      <input value={area} onChange={(e) => setArea(e.target.value)}></input>
      <input
        value={restaurant}
        onChange={(e) => setRestaurant(e.target.value)}
      ></input>
      <input value={date} onChange={(e) => setDate(e.target.value)}></input>
      <input value={shift} onChange={(e) => setShift(e.target.value)}></input>
      <button
        onClick={async () => {
          const res = await window.electron.openEditor({
            brand,
            area,
            restaurant,
            date,
            shift,
          });
        }}
      >
        Open Editor
      </button>
      <FileExplorer defaultPath="data" onSelected={(x) => console.log(x)} />
    </>
  );
};

export default Main;
