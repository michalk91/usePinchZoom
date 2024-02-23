import { CSSProperties } from "react";
import usePinchZoom from "use-pinch-zoom";

export default function RelativeToViewport() {
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

  const navContainerStyles: CSSProperties = {
    position: "fixed",
    width: "100vw",
    maxWidth: "100%",
    textAlign: "center",
    left: "50%",
    bottom: "35px",
    transform: "translateX(-50%)",
    zIndex: "10",
  };

  const containerStyles: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
    maxWidth: "100%",
    maxHeight: "100%",
  };

  const imgStyles: CSSProperties = {
    alignSelf: "center",
    display: "block",
    height: "auto",
    width: "auto",
    maxHeight: "80vh",
    maxWidth: "100%",
    transition: isDragging || isZooming ? "0s" : "0.3s",
    transform: `scale(${zoom}) translateX(${pinchZoomTransitionX}px) translateY(${pinchZoomTransitionY}px)`,
  };

  return (
    <>
      <div style={containerStyles}>
        <img
          onMouseDown={onMouseDown}
          onTouchMove={onDraging}
          onTouchEnd={onTouchEnd}
          onTouchStart={onDragStart}
          onWheel={onMouseWheel}
          style={imgStyles}
          src="https://cdn.pixabay.com/photo/2017/03/09/20/56/zanzibar-2130811_1280.jpg"
        />
        <div style={navContainerStyles}>
          <button onClick={handleIncreaseZoom}> + </button>
          <button onClick={handleDecreaseZoom}> - </button>
          <button onClick={handleResetZoom}>reset </button>
        </div>
      </div>
    </>
  );
}
