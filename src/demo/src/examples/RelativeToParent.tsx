import { CSSProperties } from "react";
import usePinchZoom from "use-pinch-zoom";

export default function RelativeToParent() {
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
  } = usePinchZoom({ maxZoom: 7, relativeTo: "parent" });

  const continerStyles: CSSProperties = {
    touchAction: " none",
    zIndex: "-1",
    position: "fixed",
    left: "0",
    top: "0",
    right: "0",
    bottom: "0",
  };

  const navContainerStyles: CSSProperties = {
    position: "fixed",
    margin: "0 auto",
    width: "100%",
    textAlign: "center",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "35px",
    zIndex: "10",
  };

  const imgContainerStyles: CSSProperties = {
    margin: "200px auto 0 auto",
    border: "3px solid black",
    maxWidth: "80vw",
    maxHeight: "60vh",
    aspectRatio: "960/1280",
    overflow: "hidden",
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
            src="https://cdn.pixabay.com/photo/2019/03/09/22/36/dog-4045119_1280.jpg"
          />
        </div>
      </div>
    </>
  );
}
