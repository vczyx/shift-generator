import React, { useEffect, useState } from "react";
import { currentConfig } from "../data/Config";
import { PartTimeF } from "../data/PartTime";
import "../styles/Editor.css";

import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import { ShiftF } from "../data/Shift";
import { TestWorker } from "../test/TestData";

export default function Editor() {
  useEffect(() => {
    console.log(ShiftF.getWorkDuration(TestWorker));
  }, []);
  return <div className="editorview"></div>;
}
