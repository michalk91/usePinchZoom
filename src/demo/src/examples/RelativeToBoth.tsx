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

  const wrapperStyles: CSSProperties = {
    boxSizing: "border-box",
    height: "100vh",
    width: "100vw",
    maxHeight: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    padding: "0 20px 0 20px",
  };

  const containerStyles: CSSProperties = {
    display: "flex",
    width: "100vw",
    maxWidth: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "17vh",
    height: "70vh",
  };

  const navContainerStyles: CSSProperties = {
    display: window.innerWidth < 600 ? "none" : "block",
    position: "relative",
    margin: "20px auto 0 auto",
    textAlign: "center",
  };

  const imgContainerStyles: CSSProperties = {
    position: "relative",
    aspectRatio: "1280/822",
    maxHeight: "100%",
  };

  const imgStyles: CSSProperties = {
    display: "block",
    height: "auto",
    width: "auto",
    maxHeight: "100%",
    maxWidth: "100%",
    transition: isDragging || isZooming ? "0s" : "0.3s",
    transform: `scale(${zoom}) translateX(${pinchZoomTransitionX}px) translateY(${pinchZoomTransitionY}px)`,
  };

  const textContainerStyles: CSSProperties = {
    padding: "15px 0 15px 0",
    flexBasis: "8%",
  };

  const textStyles = { fontSize: "1.3rem", margin: "0" };

  return (
    <div style={wrapperStyles}>
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
        </div>

        <div style={textContainerStyles}>
          <h2 style={textStyles}>
            Four times more people speak English as a second language than as a
            native one.
          </h2>
          <div style={navContainerStyles}>
            <button onClick={handleIncreaseZoom}> + </button>
            <button onClick={handleDecreaseZoom}> - </button>
            <button onClick={handleResetZoom}>reset </button>
          </div>
        </div>
      </section>
    </div>
  );
}
