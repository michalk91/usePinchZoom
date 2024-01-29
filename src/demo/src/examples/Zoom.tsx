import { CSSProperties } from "react";
import usePinchZoom from "../../../usePinchZoom";

export default function Zoom() {
  const {
    handleDecreaseZoom,
    handleIncreaseZoom,
    handleResetZoom,
    pinchZoomTransitionX,
    pinchZoomTransitionY,
    onMouseDown,
    onDragStart,
    isDragging,
    zoom,
    onDraging,
    onTouchEnd,
    isZooming,
    onMouseWheel,
  } = usePinchZoom({ maxZoom: 7 });

  const continerStyles: CSSProperties = {
    touchAction: " none",
    position: "fixed",
    left: "0",
    top: "0",
    right: "0",
    bottom: "0",
  };

  const navContainerStyles: CSSProperties = {
    position: "fixed",
    left: "5%",
    top: "5%",
    zIndex: "10",
  };

  const imgContainerStyles: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  };

  const imgStyles: CSSProperties = {
    alignSelf: "center",
    display: "block",
    height: "auto",
    width: "auto",
    maxHeight: "100%",
    maxWidth: "100%",
    transition: isDragging || isZooming ? "0s" : "0.3s",
    transform: `scale(${zoom}) translateX(${pinchZoomTransitionX}px) translateY(${pinchZoomTransitionY}px)`,
  };

  return (
    <>
      <div style={continerStyles}>
        <div style={navContainerStyles}>
          <button onClick={handleIncreaseZoom}> + </button>
          <button onClick={handleDecreaseZoom}> - </button>
          <button onClick={handleResetZoom}>reset </button>
        </div>
        <div style={imgContainerStyles}>
          <img
            onMouseDown={onMouseDown}
            onTouchMove={onDraging}
            onTouchEnd={onTouchEnd}
            onTouchStart={onDragStart}
            onWheel={onMouseWheel}
            style={imgStyles}
            src="src/assets/zanzibar-2130811_1920.jpg"
          />
        </div>
      </div>
    </>
  );
}
