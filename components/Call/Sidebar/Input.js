import React, { useState } from "react";

const Input = ({
  icon,
  onChange,
  type,
  placeholder,
  value,
  onsubmit,
  rows,
  setRows,
  isTabWidth,
}) => {
  const [prevValue, setPrevValue] = useState("");

  return (
    <div className="flex justify-center items-center bg-gray-100 w-full rounded-3xl py-4 px-4 ">
      <textarea
        type={type}
        rows={rows}
        onChange={(e) => {
          let diff =
            prevValue.split("\n").length - e.target.value.split("\n").length;
          if (diff > 0) {
            setRows(rows - diff);
          }
          setPrevValue(e.target.value);
          onChange(e);
        }}
        value={value}
        class="text-sm outline-none focus:outline bg-transparent border-none w-10/12 text-grey-800 placeholder:text-color-grey-700 max-h-24 overflow-auto custom-scroll"
        style={{ marginRight: 100 / 12 + "%", resize: "none" }}
        placeholder={placeholder}
        data-max-row={5}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (isTabWidth) {
              setRows(rows + 1);
              return;
            }
            if (e.shiftKey) {
              setRows(rows + 1);
            } else {
              e.preventDefault();
              onsubmit(e.target.value);
            }
          }
        }}
      />
      {icon}
    </div>
  );
};

export default Input;
