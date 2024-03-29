import { CSSProperties, useState } from "react";
import usePinchZoom from "use-pinch-zoom";

export default function KeepZoomOff() {
  const [activeIndex, setActiveIndex] = useState(0);
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
  } = usePinchZoom({
    maxZoom: 7,
    keepZoom: false,
  });

  const elements = [
    {
      src: "https://cdn.pixabay.com/photo/2020/07/15/22/07/instagram-5409107_1280.jpg",
      text: "Instagram was launched on October 6, 2010, and gained 25,000 users on its first day.",
    },
    {
      src: "https://cdn.pixabay.com/photo/2014/03/22/22/17/phone-292994_1280.jpg",
      text: "Initially, Instagram was called Codename, but the name changed to Instagram before it was launched.",
    },
    {
      src: "https://cdn.pixabay.com/photo/2021/06/25/12/26/social-media-6363633_1280.jpg",
      text: "The name Instagram comes from combining “instant camera” and “telegram.",
    },
    {
      src: "https://cdn.pixabay.com/photo/2019/08/19/07/45/corgi-4415649_1280.jpg",
      text: "The first photo ever posted was by the co-founder, @kevin, on July 16, 2010. The photo is a picture of a dog.",
    },
    {
      src: "https://cdn.pixabay.com/photo/2018/03/30/15/10/skyscraper-3275591_1280.jpg",
      text: "New York City was the most Instagrammed city in 2017. However, the most Instagrammed location was Disneyland in Anaheim, California.",
    },
  ];

  const wrapperStyles: CSSProperties = {
    boxSizing: "border-box",
    width: "100vw",
    maxWidth: "100%",
    touchAction: "pan-y",
    overflow: "hidden",
    paddingTop: "170px",
  };

  const containerStyles: CSSProperties = {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "40px",
  };

  const imgContainerStyles: CSSProperties = {
    aspectRatio: "1280/853",
    maxHeight: "100%",
  };

  const imgStyles: CSSProperties = {
    position: "relative",
    display: "block",
    height: "auto",
    width: "auto",
    maxHeight: "100%",
    maxWidth: "100%",
    transition: isDragging || isZooming ? "0s" : "0.3s",
  };

  const textStyles: CSSProperties = {
    fontSize: "1.1rem",
    padding: "0 0.83em 0 0.83em ",
  };

  return (
    <>
      <section style={wrapperStyles}>
        {elements.map((item, index) => (
          <article key={index} style={containerStyles}>
            <div
              onTouchStart={() => {
                setActiveIndex(index);
              }}
              style={imgContainerStyles}
            >
              <img
                onMouseDown={onMouseDown}
                onTouchMove={onDraging}
                onTouchEnd={onTouchEnd}
                onTouchStart={onDragStart}
                style={{
                  zIndex: index === activeIndex ? 2 : 1,
                  transform:
                    index === activeIndex
                      ? `scale(${zoom}) translateX(${pinchZoomTransitionX}px) translateY(${pinchZoomTransitionY}px)`
                      : "",
                  ...imgStyles,
                }}
                src={item.src}
                alt={`image ${index}`}
              />
            </div>

            <div>
              <h2 style={textStyles}>{item.text}</h2>
            </div>
          </article>
        ))}

        <a
          style={textStyles}
          href="https://www.thefactsite.com/instagram-facts"
        >
          source: https://www.thefactsite.com/instagram-facts
        </a>
      </section>
    </>
  );
}
