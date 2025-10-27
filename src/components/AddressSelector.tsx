import React, { useState } from "react";
import { Address } from "../views/Editor";
import "../styles/components/AddressSelector.css";

interface AddressSelectorProps {
  visible: boolean;
  mode: "brand" | "area" | "restaurant" | "shift";
  maxMode: "brand" | "area" | "restaurant" | "shift";
  onSelected: (address: Address) => void;
  defaultAddress: Address;
}

const AddressSelector: React.FC<AddressSelectorProps> = (props) => {
  const [address, setAddress] = useState(props.defaultAddress)
  return (
    <>
      <div
        className="overlay"
        style={{
          opacity: props.visible ? 1 : 0,
          pointerEvents: props.visible ? "auto" : "none",
        }}
      ></div>
      <div className="adrselector"></div>
    </>
  );
};

export default AddressSelector;
