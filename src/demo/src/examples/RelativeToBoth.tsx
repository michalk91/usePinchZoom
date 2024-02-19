import { CSSProperties } from "react";
import usePinchZoom from "use-pinch-zoom";

export default function RelativeToBoth() {
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
  } = usePinchZoom({ maxZoom: 7, relativeTo: "both", zoomFactor: 20 });

  const containerStyles: CSSProperties = {
    display: "flex",
    width: "100vw",
    maxWidth: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "22vh",
    height: "70vh",
  };

  const navContainerStyles: CSSProperties = {
    display: window.innerWidth < 600 ? "none" : "block",
    position: "absolute",
    margin: "10px auto 0 auto",
    width: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    top: "100%",
    textAlign: "center",
  };

  const imgContainerStyles: CSSProperties = {
    position: "relative",
    margin: "20px",
    aspectRatio: "1280/822",
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

  const textContainerStyles: CSSProperties = {
    padding: "5%",
    flexBasis: "8%",
  };

  return (
    <>
      <section style={containerStyles}>
        <div style={imgContainerStyles}>
          <img
            onMouseDown={onMouseDown}
            onTouchMove={onDraging}
            onTouchEnd={onTouchEnd}
            onTouchStart={onDragStart}
            onWheel={onMouseWheel}
            style={imgStyles}
            src="https://cdn.pixabay.com/photo/2017/09/07/10/07/english-2724442_1280.jpg"
          />
          <div style={navContainerStyles}>
            <button onClick={handleIncreaseZoom}> + </button>
            <button onClick={handleDecreaseZoom}> - </button>
            <button onClick={handleResetZoom}>reset </button>
          </div>
        </div>

        <div style={textContainerStyles}>
          <h1 style={{ margin: "0" }}>
            Four times more people speak English as a second language than as a
            native one.
          </h1>
        </div>
      </section>
    </>
  );
}
