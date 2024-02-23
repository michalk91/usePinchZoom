import { CSSProperties } from "react";
import usePinchZoom from "use-pinch-zoom";

export default function KeepZoomOff() {
  const {
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
  } = usePinchZoom({
    maxZoom: 7,
    keepZoom: false,
  });

  const containerStyles: CSSProperties = {
    display: "flex",
    width: "100vw",
    maxWidth: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "170px",
    marginBottom: "200px",
    height: "70vh",
    touchAction: "pan-y",
  };

  const imgContainerStyles: CSSProperties = {
    position: "relative",
    margin: "20px",
    aspectRatio: "1280/853",
    maxHeight: "100%",
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
    paddingLeft: "5%",
    paddingRight: "5%",
    paddingTop: "2%",
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
            src="https://cdn.pixabay.com/photo/2020/07/15/22/07/instagram-5409107_1280.jpg"
          />
        </div>

        <div style={textContainerStyles}>
          <h1 style={{ margin: "0" }}>
            Instagram was launched on October 6, 2010, and gained 25,000 users
            on its first day.
          </h1>
        </div>
      </section>
    </>
  );
}
