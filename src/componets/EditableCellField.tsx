import React, { useState } from "react";

type Props = React.TdHTMLAttributes<HTMLTableCellElement> & {
  value: string | number;
  inputType: "text" | "number";
  onValueChange: React.ChangeEventHandler<HTMLInputElement>;
};

const EditableCellField = (props: Props): JSX.Element => {
  const [mode, setMode] = useState<"edit" | "view">("view");

  const handleFocus = () => {
    setMode("edit");
  };

  const handleBlur = () => {
    setMode("view");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTableCellElement> = (
    e
  ) => {
    if (e.key === "Enter") {
      setMode("view");
    }
  };

  return (
    <td
      {...props}
      onClick={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="min-w-fit"
    >
      {mode === "edit" ? (
        <span>
          <input
            type={props.inputType}
            value={props.value}
            onChange={props.onValueChange}
            className="w-full"
          />
        </span>
      ) : (
        <span>{props.value}</span>
      )}
    </td>
  );
};

export default EditableCellField;
