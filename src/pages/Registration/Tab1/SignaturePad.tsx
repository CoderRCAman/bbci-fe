// import { getStroke } from "perfect-freehand";
// import { useRef, useState } from "react";
// export function roundPoint(point: number[]): number[] {
//   // Round x and y to 2 decimal places
//   const x = Math.round(point[0] * 100) / 100;
//   const y = Math.round(point[1] * 100) / 100;
//   // Round pressure to 3 decimal places (optional, or just 2)
//   const p = Math.round(point[2] * 1000) / 1000;
//   return [x, y, p];
// }
// function getSvgPathFromStroke(stroke: any): string {
//   if (!stroke.length) return "";

//   const d = stroke.reduce(
//     (acc: any, [x0, y0]: any, i: any, arr: any) => {
//       const [x1, y1] = arr[(i + 1) % arr.length];
//       acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
//       return acc;
//     },
//     ["M", ...stroke[0], "Q"]
//   );

//   d.push("Z");
//   return d.join(" ");
// }

// export default function SignaturePad({
//   strokes,
//   setStrokes,
// }: {
//   strokes: number[][][];
//   setStrokes: React.Dispatch<React.SetStateAction<number[][][]>>;
// }) {
//   // 1. Change state to store an array of strokes (array of arrays of points)
//   // 2. Add state for the stroke currently being drawn
//   const [currentStroke, setCurrentStroke] = useState<number[][]>([]);
//   const svgRef = useRef<SVGSVGElement>(null);
//   const lastCommitTimeRef = useRef(0);
//   const MIN_DELAY_MS = 200; // Minimum delay between strokes (e.g., 200 milliseconds)
//   // ... getRelativePoint remains the same (as in previous answer)

//   function getRelativePoint(e: React.PointerEvent<SVGSVGElement>): number[] {
//     // ... (Your implementation of getRelativePoint here)
//     // You must keep this logic from the previous answer for correct coordinates

//     const svg = svgRef.current;
//     if (!svg) return [0, 0, 0];

//     const rect = svg.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     return [x, y, e.pressure];
//   }

//   function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
//     e.preventDefault();
//     e.currentTarget.setPointerCapture(e.pointerId);
//     setCurrentStroke([getRelativePoint(e)]);
//   }

//   function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
//     e.preventDefault();
//     if (e.buttons !== 1) return;
//     if (currentStroke.length === 0) return; // Ignore move events if not drawing
//     setCurrentStroke((prev) => [...prev, getRelativePoint(e)]);
//   }

//   function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
//     svgRef.current?.releasePointerCapture(e.pointerId);

//     if (currentStroke.length > 0) {
//       setStrokes((prev) => [...prev, currentStroke]);
//       setCurrentStroke([]); // Clear the current stroke for the next one
//     }
//   }

//   function handlePointerCancel(e: React.PointerEvent<SVGSVGElement>) {
//     svgRef.current?.releasePointerCapture(e.pointerId);
//     if (currentStroke.length > 0) {
//       setStrokes((prev) => [...prev, currentStroke]);
//       setCurrentStroke([]); // Clear the current stroke
//     }
//   }

//   const allStrokes = strokes.concat(
//     currentStroke.length > 0 ? [currentStroke] : []
//   );

//   return (
//     <svg
//       ref={svgRef}
//       onPointerDown={handlePointerDown}
//       onPointerMove={handlePointerMove}
//       onPointerUp={handlePointerUp} // 3. Add pointer up handler
//       onPointerCancel={handlePointerCancel}
//       style={{
//         touchAction: "none",
//         width: "100%",
//         height: "300px",
//         border: "1px solid #ccc",
//         background: "#fff",
//       }}
//     >
//       {allStrokes.map((strokePoints, i) => {
//         const outline = getStroke(strokePoints, {
//           size: 3.5, // ✅ smaller tip like a real ball pen (2–4px range)
//           simulatePressure: true, // ✅ allows natural variation on devices without pressure
//         });
//         const pathData = getSvgPathFromStroke(outline as number[][]);

//         return (
//           <path
//             key={i} // Key is necessary for React lists
//             d={pathData}
//             fill="black"
//           />
//         );
//       })}
//     </svg>
//   );
// }


import { getStroke } from "perfect-freehand";
import { useRef } from "react";
// No more useState for currentStroke!

// --- Helper functions remain the same ---
export function roundPoint(point: number[]): number[] {
  // ... (same as your code)
  const x = Math.round(point[0] * 100) / 100;
  const y = Math.round(point[1] * 100) / 100;
  const p = Math.round(point[2] * 1000) / 1000;
  return [x, y, p];
}

function getSvgPathFromStroke(stroke: any): string {
  // ... (same as your code)
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc: any, [x0, y0]: any, i: any, arr: any) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
}

// Options for perfect-freehand, defined once.
const strokeOptions = {
  size: 3.5,
  simulatePressure: true, // You can set this to false if your stylus provides pressure
};

export default function SignaturePad({
  strokes,
  setStrokes,
  setIsUnsaved
}: {
  strokes: number[][][];
  setStrokes: React.Dispatch<React.SetStateAction<number[][][]>>;
  setIsUnsaved: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // 1. Remove `currentStroke` state
  // 2. Add refs for the live stroke data and the live path element
  const currentStrokeRef = useRef<number[][]>([]);
  const livePathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Your lastCommitTimeRef is no longer needed

  function getRelativePoint(e: React.PointerEvent<SVGSVGElement>): number[] {
    const svg = svgRef.current;
    if (!svg) return [0, 0, 0];
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return [x, y, e.pressure > 0 ? e.pressure : 0.5]; // Use 0.5 as default pressure
  }

  // This helper updates the live path directly, bypassing React
  function updateLivePath() {
    if (livePathRef.current && currentStrokeRef.current.length > 0) {
      const outline = getStroke(currentStrokeRef.current, strokeOptions);
      const pathData = getSvgPathFromStroke(outline as number[][]);
      livePathRef.current.setAttribute("d", pathData);
    }
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    e.preventDefault();
    // if (e.pointerType !== 'pen') return;
    e.currentTarget.setPointerCapture(e.pointerId);

    // Start a new stroke in our ref
    currentStrokeRef.current = [getRelativePoint(e)];

    // Draw the first "dot"
    updateLivePath();
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (e.pointerType !== 'pen') return;
    e.preventDefault();
    if (e.buttons !== 1) return;

    // Add point to the ref (no state update!)
    currentStrokeRef.current.push(getRelativePoint(e));

    // Directly update the SVG path
    updateLivePath();
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    svgRef.current?.releasePointerCapture(e.pointerId);

    const stroke = currentStrokeRef.current;
    if (stroke.length > 0) {
      // 3. ONLY update React state ONCE when the stroke is finished
      setStrokes((prev) => [...prev, stroke]); 
      setIsUnsaved(true);
    }

    // Clear the ref and the live path
    currentStrokeRef.current = [];
    if (livePathRef.current) {
      livePathRef.current.setAttribute("d", "");
    }
  }

  function handlePointerCancel(e: React.PointerEvent<SVGSVGElement>) {
    // Replicate original logic: commit stroke on cancel
    handlePointerUp(e);
  }

  // No more `allStrokes`. We render committed strokes and the live stroke separately.

  return (
    <svg
      ref={svgRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        touchAction: "none",
        width: "100%",
        height: "300px",
        border: "1px solid #ccc",
        background: "#fff",
      }}
    >
      {/* 1. Render all COMMITTED strokes from React state */}
      {strokes.map((strokePoints, i) => {
        const outline = getStroke(strokePoints, strokeOptions);
        const pathData = getSvgPathFromStroke(outline as number[][]);
        return (
          <path
            key={i}
            d={pathData}
            fill="black"
          />
        );
      })}

      {/* 2. Render ONE path for the LIVE stroke */}
      {/* This path is updated directly via its ref, not via React re-renders */}
      <path ref={livePathRef} fill="black" />
    </svg>
  );
}