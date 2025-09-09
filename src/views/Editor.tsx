import React, { useEffect, useState } from "react";
import { currentConfig } from "../data/Config";
import { PartTime, getRestTime } from "../data/PartTime";
import "../styles/Editor.css";

import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";

export default function Editor() {
  useEffect(() => {
    console.log(getRestTime({ start: 9, end: 18 }));
  }, []);
  return <div className="editorview"></div>;
}
