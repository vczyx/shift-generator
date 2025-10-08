import React, { useState } from "react";

const Main: React.FC = () => {
  const [brand, setBrand] = useState("KFC");
  const [area, setArea] = useState("TestArea");
  const [restaurant, setRestaurant] = useState("TestStation");
  const [shift, setShift] = useState("20250922");

  window.electron.getDataInfo().then((x) => console.log(x));
  return (
    <>
      <input value={brand} onChange={(e) => setBrand(e.target.value)}></input>
      <input value={area} onChange={(e) => setArea(e.target.value)}></input>
      <input
        value={restaurant}
        onChange={(e) => setRestaurant(e.target.value)}
      ></input>
      <input value={shift} onChange={(e) => setShift(e.target.value)}></input>
      <button
        onClick={() =>
          window.electron.openEditor(brand, area, restaurant, shift)
        }
      >
        Open Editor
      </button>
    </>
  );
};

export default Main;
