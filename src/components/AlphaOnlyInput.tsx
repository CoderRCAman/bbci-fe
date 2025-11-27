import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function AlphaOnlyInput(props: Props) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const controlKeys = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"];
    if (controlKeys.includes(e.key)) return;
    if (/\d/.test(e.key)) {
      e.preventDefault();
      return;
    }
    if (props.onKeyDown) props.onKeyDown(e);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (/\d/.test(pasted)) {
      const filtered = pasted.replace(/\d+/g, "");
      const target = e.target as HTMLInputElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      const newVal = target.value.slice(0, start) + filtered + target.value.slice(end);
      // inject filtered value and prevent default paste
      (target as any).value = newVal;
      e.preventDefault();
      if (props.onChange) {
        const synthetic = { target: { value: newVal } } as any;
        (props.onChange as any)(synthetic);
      }
      return;
    }
    if (props.onPaste) props.onPaste(e);
  };

  return <input {...props} onKeyDown={onKeyDown} onPaste={onPaste} />;
}
