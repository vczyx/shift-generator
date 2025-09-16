export type CSSColor =
  | "red"
  | "blue"
  | "green"
  | "black"
  | "white"
  | "gray"
  | "yellow"
  | "purple"
  | "orange"
  | "pink"
  | `#${string}` // HEX
  | `rgb(${number}, ${number}, ${number})`
  | `rgba(${number}, ${number}, ${number}, ${number})`
  | `hsl(${number}, ${number}%, ${number}%)`
  | `hsla(${number}, ${number}%, ${number}%, ${number})`;
