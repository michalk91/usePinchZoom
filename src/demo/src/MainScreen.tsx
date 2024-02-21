import { CSSProperties } from "react";

export default function MainScreen() {
  const containerStyles: CSSProperties = {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    maxHeight: "100%",
    maxWidth: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: "10%",
  };

  const textStyles: CSSProperties = {
    fontSize: "1.5rem",
    wordWrap: "break-word",
  };

  return (
    <>
      <div style={containerStyles}>
        <h1>usePinchZoom</h1>
        <p style={textStyles}>
          The examples above illustrate some of the features of the
          "use-pinch-zoom" React hook.
        </p>
      </div>
    </>
  );
}
