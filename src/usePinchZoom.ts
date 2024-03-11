import { useState, useCallback, useEffect, useRef } from "react";

interface Props {
  /**
   * How far you can drag the zoomed element out of scope. Default value: 50(px).
   */
  boundaryResistance?: number;

  /**
   * Maximum zoom value. Default value: 3,
   */
  maxZoom?: number;

  /**
   * Double tap sensivity. Default value: 300(ms),
   */
  doubleTapSensivity?: number;

  /**
   * The minimum distance between fingers that allows for zooming with two fingers. Default value: 80(px).
   */
  minDistBetweenFingers?: number;

  /**
   * You can set this to false if you want after touchend zoom return to the initial position. Default value: true.
   */
  keepZoom?: boolean;

  /**
   * You can set this option to true if you want to disable double-tap zoom. Default value: false.
   */
  disableDoubleTap?: boolean;

  /**
   * Defines how many times the increaseZoom function will need to be called to obtain the maximum zoom. For example, if you set 5, each function call will increase the element by 20 percent of its size. Default value: 4.
   */
  zoomFactor?: number;

  /**
   * Defines the element against which the boundaries will be set and zoom calculations will be performed. Remember that the element being enlarged must always be centered relative to its parent. Default value: "viewport".
   */
  relativeTo?: "viewport" | "parent" | "both";

  /**
   * It defines whether you can move an element during pinch zoom. Default value: true.
   */
  allowDragWhenZooming?: boolean;

  /**
   * Prevents the default pinch zoom and scroll functionality of the web browser when an element is enlarged with two fingers or when the zoom level is greater than 1. Default value: true.
   */
  preventDefaultTouchBehavior?: boolean;

  /**
   * Prevents the default scroll functionality of the web browser when the zoom level of an element is greater than 1. Default value: true.
   */
  preventDefaultWheelBehavior?: boolean;
}

interface ZoomInfo {
  allowDragAndZoom: boolean;
  isDragging: boolean;
  isZooming: boolean;
  doubleTapped: boolean;
  wheeled: boolean;
  originX: number;
  originY: number;
  transitionX: number;
  transitionY: number;
  zoom: number;
}

interface GetLimitedValue {
  min: number;
  max: number;
  value: number;
}

interface GetDragBoundries {
  target: HTMLElement;
  zoom: number;
  higherThanParent: boolean;
  widderThanParent: boolean;
  widderThanViewport: boolean;
  higherThanViewport: boolean;
}

interface CalculateOverMargin {
  transitionX: number;
  transitionY: number;
  marginTop: number;
  marginLeft: number;
  marginRight: number;
  marginBottom: number;
}

interface GetDistanceBetweenFingers {
  fingerOne: React.Touch;
  fingerTwo: React.Touch;
}

interface TapInfoRef {
  lastTap: number;
  timeout: undefined | number;
}
interface ZoomInfoRef {
  target: null | HTMLElement;
  startDistance: number;
  lastX: number;
  lastY: number;
  lastZoom: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  startZoomPosX: number;
  startZoomPosY: number;
  isHigher: boolean;
  isWidder: boolean;
  scrolled: boolean;
}

const getDistanceBetweenFingers = ({
  fingerOne,
  fingerTwo,
}: GetDistanceBetweenFingers) => {
  const X1 = fingerOne.clientX;
  const Y1 = fingerOne.clientY;
  const X2 = fingerTwo.clientX;
  const Y2 = fingerTwo.clientY;

  return Math.sqrt((X2 - X1) * (X2 - X1) + (Y2 - Y1) * (Y2 - Y1));
};

const isWidderThanViewport = (target: HTMLElement, zoom: number) => {
  return target?.offsetWidth * zoom > window?.innerWidth;
};

const isHigherThanViewport = (target: HTMLElement, zoom: number) => {
  return target?.offsetHeight * zoom > window?.innerHeight;
};

const isWidderThanParent = (target: HTMLElement, zoom: number) => {
  if (!target?.parentElement) return false;
  else return target?.offsetWidth * zoom > target.parentElement.offsetWidth;
};

const isHigherThanParent = (target: HTMLElement, zoom: number) => {
  if (!target?.parentElement) return false;
  else return target?.offsetHeight * zoom > target.parentElement.offsetHeight;
};

const calculateHorizontalShift = (target: HTMLElement) => {
  if (!target.parentElement) return 0;

  const { left, right } = target.parentElement.getBoundingClientRect();

  const offsetLeft = left;
  const offsetRight = window.innerWidth - right;

  return offsetRight - offsetLeft;
};

const calculateVerticalShift = (target: HTMLElement) => {
  if (!target.parentElement) return 0;

  const { top, bottom } = target.parentElement?.getBoundingClientRect();

  const offsetTop = top;
  const offsetBottom = window?.innerHeight - bottom;

  return offsetBottom - offsetTop;
};

const getLimitedValue = ({ min, max, value }: GetLimitedValue) =>
  Math.min(max, Math.max(value, min));

const estimateOverflow = (
  relativeTo: "viewport" | "parent" | "both",
  target: HTMLElement,
  zoom: number
) => {
  let higherThanParent = false,
    widderThanParent = false,
    higherThanViewport = false,
    widderThanViewport = false,
    isHigher = false,
    isWidder = false;

  if (relativeTo === "both") {
    higherThanParent = isHigherThanParent(target, zoom);
    widderThanParent = isWidderThanParent(target, zoom);

    higherThanViewport = isHigherThanViewport(target, zoom);
    widderThanViewport = isWidderThanViewport(target, zoom);

    isWidder = widderThanParent || widderThanViewport;

    isHigher = higherThanParent || higherThanViewport;
  } else if (relativeTo === "viewport") {
    higherThanViewport = isHigherThanViewport(target, zoom);
    widderThanViewport = isWidderThanViewport(target, zoom);

    isWidder = widderThanViewport;
    isHigher = higherThanViewport;
  } else if (relativeTo === "parent") {
    higherThanParent = isHigherThanParent(target, zoom);
    widderThanParent = isWidderThanParent(target, zoom);

    isWidder = widderThanParent;
    isHigher = higherThanParent;
  }

  return {
    isHigher,
    isWidder,
    higherThanParent,
    widderThanParent,
    higherThanViewport,
    widderThanViewport,
  };
};

const calculateOverMargin = ({
  transitionX,
  transitionY,
  marginTop,
  marginLeft,
  marginRight,
  marginBottom,
}: CalculateOverMargin) => {
  const overMarginedY =
    transitionY !== 0 &&
    (transitionY > marginTop || transitionY < -marginBottom);

  const overMarginedX =
    transitionX !== 0 &&
    (transitionX > marginLeft || transitionX < -marginRight);

  const overMarginY = overMarginedY
    ? transitionY > marginTop
      ? transitionY - marginTop
      : transitionY + marginBottom
    : 0;
  const overMarginX = overMarginedX
    ? transitionX > marginLeft
      ? transitionX - marginLeft
      : transitionX + marginRight
    : 0;

  return { overMarginX, overMarginY };
};

const getDragBoundries = ({
  target,
  zoom,
  higherThanParent,
  widderThanParent,
  widderThanViewport,
  higherThanViewport,
}: GetDragBoundries) => {
  let marginLeft = 0,
    marginTop = 0,
    marginBottom = 0,
    marginRight = 0;

  if (!target) return { marginTop, marginLeft, marginBottom, marginRight };

  if (widderThanParent && !widderThanViewport) {
    if (!target.parentElement)
      return { marginTop, marginLeft, marginBottom, marginRight };

    const parentWidth = target?.parentElement?.offsetWidth;
    marginLeft = (target?.offsetWidth * zoom - parentWidth) / 2 / zoom;
    marginRight = (target?.offsetWidth * zoom - parentWidth) / 2 / zoom;
  } else if (widderThanViewport) {
    const horizontalShift = calculateHorizontalShift(target);

    marginLeft =
      (target?.offsetWidth * zoom - window.innerWidth + horizontalShift) /
      2 /
      zoom;

    marginRight =
      (target?.offsetWidth * zoom - window.innerWidth - horizontalShift) /
      2 /
      zoom;
  }

  if (higherThanParent && !higherThanViewport) {
    if (!target.parentElement)
      return { marginTop, marginLeft, marginBottom, marginRight };

    const parentHeight = target?.parentElement?.offsetHeight;
    marginTop = (target?.offsetHeight * zoom - parentHeight) / 2 / zoom;
    marginBottom = (target?.offsetHeight * zoom - parentHeight) / 2 / zoom;
  } else if (higherThanViewport) {
    const verticalShift = calculateVerticalShift(target);

    marginTop =
      (target?.offsetHeight * zoom - window.innerHeight + verticalShift) /
      2 /
      zoom;
    marginBottom =
      (target?.offsetHeight * zoom - window.innerHeight - verticalShift) /
      2 /
      zoom;
  }

  return { marginTop, marginLeft, marginBottom, marginRight };
};

function usePinchZoom({
  boundaryResistance = 50,
  maxZoom = 3,
  doubleTapSensivity = 300,
  minDistBetweenFingers = 80,
  keepZoom = true,
  disableDoubleTap = false,
  relativeTo = "viewport",
  zoomFactor = 4,
  allowDragWhenZooming = true,
  preventDefaultTouchBehavior = true,
  preventDefaultWheelBehavior = true,
}: Props) {
  const [zoomInfo, setZoomInfo] = useState<ZoomInfo>({
    allowDragAndZoom: true,
    isDragging: false,
    isZooming: false,
    doubleTapped: false,
    wheeled: false,
    originX: 0,
    originY: 0,
    transitionX: 0,
    transitionY: 0,
    zoom: 1,
  });

  const zoomInfoRef = useRef<ZoomInfoRef>({
    target: null,
    startDistance: 0,
    lastX: 0,
    lastY: 0,
    lastZoom: 1,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    isHigher: false,
    isWidder: false,
    startZoomPosX: 0,
    startZoomPosY: 0,
    scrolled: false,
  }).current;

  const tapInfoRef = useRef<TapInfoRef>({
    lastTap: 0,
    timeout: undefined,
  }).current;

  const prevDefaultPinchBehavior = useCallback(
    (e: TouchEvent) => {
      if (
        zoomInfo.isZooming ||
        (zoomInfo.isDragging && zoomInfoRef.lastZoom > 1)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [zoomInfo.isZooming, zoomInfoRef.lastZoom, zoomInfo.isDragging]
  );

  const prevDefaultPinchTouchStart = useCallback(
    (e: TouchEvent) => {
      if (zoomInfo.isZooming) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [zoomInfo.isZooming]
  ); //In Safari, to block native pinch zoom, you need to call preventDefault on touchstart as well.

  const prevDefaultWheelBehavior = useCallback(
    (e: WheelEvent) => {
      if (zoomInfoRef.lastZoom > 1) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [zoomInfoRef.lastZoom]
  );

  const enableDragAndZoom = useCallback(() => {
    setZoomInfo((state: ZoomInfo) => ({
      ...state,
      allowDragAndZoom: true,
    }));
  }, []);

  const disableDragAndZoom = useCallback(() => {
    setZoomInfo((state: ZoomInfo) => ({
      ...state,
      allowDragAndZoom: false,
    }));
  }, []);

  const handleIncreaseZoom = useCallback(() => {
    setZoomInfo((state: ZoomInfo) => {
      const currentZoom = getLimitedValue({
        min: 1,
        max: maxZoom,
        value: state.zoom + maxZoom / zoomFactor,
      });

      zoomInfoRef.lastZoom = currentZoom;

      return {
        ...state,
        zoom: currentZoom,
      };
    });
  }, [maxZoom, zoomFactor, zoomInfoRef]);

  const handleDecreaseZoom = useCallback(() => {
    setZoomInfo((state: ZoomInfo) => {
      const currentZoom = getLimitedValue({
        min: 1,
        max: maxZoom,
        value: state.zoom - maxZoom / zoomFactor,
      });

      zoomInfoRef.lastZoom = currentZoom;

      let marLeft = 0,
        marRight = 0,
        marTop = 0,
        marBottom = 0;

      if (zoomInfoRef.target) {
        const {
          higherThanParent,
          widderThanParent,
          higherThanViewport,
          widderThanViewport,
        } = estimateOverflow(relativeTo, zoomInfoRef.target, currentZoom);

        const { marginTop, marginLeft, marginBottom, marginRight } =
          getDragBoundries({
            target: zoomInfoRef.target,
            zoom: currentZoom,
            higherThanParent,
            widderThanParent,
            higherThanViewport,
            widderThanViewport,
          });

        marTop = marginTop;
        marBottom = marginBottom;
        marLeft = marginLeft;
        marRight = marginRight;
      }

      return {
        ...state,
        zoom: currentZoom,
        transitionX: getLimitedValue({
          min: marRight > 0 ? -marRight : 0,
          max: marLeft > 0 ? marLeft : 0,
          value: state.transitionX,
        }),
        transitionY: getLimitedValue({
          min: marBottom > 0 ? -marBottom : 0,
          max: marTop > 0 ? marTop : 0,
          value: state.transitionY,
        }),
      };
    });
  }, [maxZoom, zoomFactor, zoomInfoRef, relativeTo]);

  const handleResetZoom = useCallback(() => {
    setZoomInfo((state: ZoomInfo) => ({
      ...state,
      isDragging: false,
      isZooming: false,
      doubleTapped: false,
      wheeled: false,
      zoom: 1,
      transitionX: 0,
      transitionY: 0,
    }));
    zoomInfoRef.lastZoom = 1;
    zoomInfoRef.lastX = 0;
    zoomInfoRef.lastY = 0;
  }, [zoomInfoRef]);

  const detectDoubleTap = useCallback((): boolean => {
    let doubleTapped = false;

    const curTime = new Date().getTime();
    const tapLen = curTime - tapInfoRef.lastTap;

    if (tapLen < doubleTapSensivity && tapLen > 0) {
      doubleTapped = true;
    } else {
      tapInfoRef.timeout = window.setTimeout(() => {
        clearTimeout(tapInfoRef.timeout);
      }, doubleTapSensivity);
    }
    tapInfoRef.lastTap = curTime;

    return doubleTapped;
  }, [tapInfoRef, doubleTapSensivity]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoomInfo.isZooming || zoomInfo.isDragging) return;

      zoomInfoRef.target = e.currentTarget as HTMLElement;

      e.preventDefault();

      const {
        higherThanParent,
        widderThanParent,
        higherThanViewport,
        widderThanViewport,
        isHigher,
        isWidder,
      } = estimateOverflow(
        relativeTo,
        e.currentTarget as HTMLElement,
        zoomInfo.zoom
      );

      zoomInfoRef.isHigher = isHigher;
      zoomInfoRef.isWidder = isWidder;

      const { marginTop, marginLeft, marginBottom, marginRight } =
        getDragBoundries({
          target: e.currentTarget as HTMLElement,
          zoom: zoomInfo.zoom,
          higherThanParent,
          widderThanParent,
          higherThanViewport,
          widderThanViewport,
        });

      zoomInfoRef.marginTop = marginTop;
      zoomInfoRef.marginLeft = marginLeft;
      zoomInfoRef.marginBottom = marginBottom;
      zoomInfoRef.marginRight = marginRight;

      const currentPosX = e.clientX / zoomInfo.zoom;
      const currentPosY = e.clientY / zoomInfo.zoom;

      zoomInfoRef.lastZoom = zoomInfo.zoom;
      zoomInfoRef.lastX = zoomInfo.transitionX;
      zoomInfoRef.lastY = zoomInfo.transitionY;

      setZoomInfo((state: ZoomInfo) => ({
        ...state,
        wheeled: false,
        isDragging: state.allowDragAndZoom ? true : false,
        originX: currentPosX,
        originY: currentPosY,
      }));
    },
    [
      zoomInfo.zoom,
      zoomInfoRef,
      zoomInfo.isZooming,
      zoomInfo.isDragging,
      zoomInfo.transitionX,
      zoomInfo.transitionY,
      relativeTo,
    ]
  );

  const onDragStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 2) return;

      zoomInfoRef.target = e.currentTarget as HTMLElement;

      zoomInfoRef.lastZoom = zoomInfo.zoom;
      zoomInfoRef.lastX = zoomInfo.transitionX;
      zoomInfoRef.lastY = zoomInfo.transitionY;

      const verticalShift = calculateVerticalShift(zoomInfoRef.target);
      const horizontalShift = calculateHorizontalShift(zoomInfoRef.target);

      if (e.touches.length === 2) {
        tapInfoRef.lastTap = 0; //prevent double tap with two fingers
        const fingerOne = e.touches[0];
        const fingerTwo = e.touches[1];

        const startMidPointX = (fingerOne.clientX + fingerTwo.clientX) / 2;
        const startMidPointY = (fingerOne.clientY + fingerTwo.clientY) / 2;

        const distance =
          e.touches.length === 2 &&
          getDistanceBetweenFingers({
            fingerOne,
            fingerTwo,
          });

        zoomInfoRef.startZoomPosX =
          (window.innerWidth / 2 - startMidPointX - horizontalShift / 2) *
          zoomInfoRef.lastZoom;

        zoomInfoRef.startZoomPosY =
          (window.innerHeight / 2 - startMidPointY - verticalShift / 2) *
          zoomInfoRef.lastZoom;

        zoomInfoRef.startDistance = distance ? distance : 0;

        setZoomInfo({
          ...zoomInfo,
          wheeled: false,
          isZooming: zoomInfo.allowDragAndZoom ? true : false,
          isDragging: false,
          originX: startMidPointX,
          originY: startMidPointY,
        });
      }
      if (e.touches.length === 1) {
        const fingerOne = e.touches[0];

        const startPointX = fingerOne.clientX;
        const startPointY = fingerOne.clientY;

        const doubleTapped = keepZoom && !disableDoubleTap && detectDoubleTap();

        if (doubleTapped) {
          const startZoomPosX =
            window.innerWidth / 2 - startPointX - horizontalShift / 2;
          const startZoomPosY =
            window.innerHeight / 2 - startPointY - verticalShift / 2;

          const dx = startZoomPosX - startZoomPosX / maxZoom;
          const dy = startZoomPosY - startZoomPosY / maxZoom;

          const {
            higherThanParent,
            widderThanParent,
            higherThanViewport,
            widderThanViewport,
            isHigher,
            isWidder,
          } = estimateOverflow(
            relativeTo,
            e.currentTarget as HTMLElement,
            maxZoom
          );

          zoomInfoRef.isHigher = isHigher;
          zoomInfoRef.isWidder = isWidder;

          const { marginTop, marginLeft, marginBottom, marginRight } =
            getDragBoundries({
              target: e.currentTarget as HTMLElement,
              zoom: maxZoom,
              widderThanViewport,
              higherThanViewport,
              higherThanParent,
              widderThanParent,
            });

          setZoomInfo({
            ...zoomInfo,
            wheeled: false,
            doubleTapped: true,
            isDragging: false,
            isZooming: false,
            zoom: zoomInfo.zoom === 1 ? maxZoom : 1,
            transitionX: getLimitedValue({
              max: isWidder ? marginLeft : 0,
              min: isWidder ? -marginRight : 0,
              value: zoomInfo.zoom === 1 ? zoomInfo.transitionX + dx : 0,
            }),
            transitionY: getLimitedValue({
              max: isHigher ? marginTop : 0,
              min: isHigher ? -marginBottom : 0,
              value: zoomInfo.zoom === 1 ? zoomInfo.transitionY + dy : 0,
            }),
          });
        } else if (!doubleTapped) {
          const {
            higherThanParent,
            widderThanParent,
            higherThanViewport,
            widderThanViewport,
            isHigher,
            isWidder,
          } = estimateOverflow(
            relativeTo,
            e.currentTarget as HTMLElement,
            zoomInfo.zoom
          );

          const { marginTop, marginLeft, marginBottom, marginRight } =
            getDragBoundries({
              target: e.currentTarget as HTMLElement,
              zoom: zoomInfo.zoom,
              widderThanViewport,
              higherThanViewport,
              higherThanParent,
              widderThanParent,
            });

          zoomInfoRef.marginTop = marginTop;
          zoomInfoRef.marginLeft = marginLeft;
          zoomInfoRef.marginBottom = marginBottom;
          zoomInfoRef.marginRight = marginRight;
          zoomInfoRef.isHigher = isHigher;
          zoomInfoRef.isWidder = isWidder;

          setZoomInfo({
            ...zoomInfo,
            wheeled: false,
            isDragging: zoomInfo.allowDragAndZoom ? true : false,
            isZooming: false,
            originX: startPointX,
            originY: startPointY,
          });
        }
      }
    },
    [
      zoomInfoRef,
      zoomInfo,
      detectDoubleTap,
      maxZoom,
      disableDoubleTap,
      keepZoom,
      relativeTo,
      tapInfoRef,
    ]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!zoomInfo.isDragging) return;

      setZoomInfo((state: ZoomInfo) => ({
        ...state,
        transitionX: zoomInfoRef.isWidder
          ? getLimitedValue({
              max: zoomInfoRef.marginLeft + boundaryResistance / state.zoom,
              min: -zoomInfoRef.marginRight - boundaryResistance / state.zoom,
              value: zoomInfoRef.lastX + e.clientX / state.zoom - state.originX,
            })
          : 0,

        transitionY: zoomInfoRef.isHigher
          ? getLimitedValue({
              max: zoomInfoRef.marginTop + boundaryResistance / state.zoom,
              min: -zoomInfoRef.marginBottom - boundaryResistance / state.zoom,
              value: zoomInfoRef.lastY + e.clientY / state.zoom - state.originY,
            })
          : 0,
      }));
    },
    [zoomInfoRef, boundaryResistance, zoomInfo.isDragging]
  );

  const onDraging = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 2) return;

      if (preventDefaultTouchBehavior) {
        if (!zoomInfoRef.scrolled) {
          if (e.touches.length === 1 && zoomInfoRef.lastZoom === 1)
            zoomInfoRef.scrolled = true;
          //If only one finger is touching the screen and the zoom value is 1, we can assume that the user is scrolling. When the user is scrolling, we want to lock the zoom.
          tapInfoRef.lastTap = 0; //prevent double tapping while scrolling

          document.body.style.touchAction = "pan-y pan-x";
        }
      }

      if (zoomInfo.isZooming && !zoomInfoRef.scrolled) {
        const fingerOne = e.touches[0];
        const fingerTwo = e.touches[1];

        const distance =
          e.touches.length === 2 &&
          getDistanceBetweenFingers({
            fingerOne,
            fingerTwo,
          });

        const endDist = distance ? distance : 0;

        const endMidPointX = (fingerOne?.clientX + fingerTwo?.clientX) / 2;
        const endMidPointY = (fingerOne?.clientY + fingerTwo?.clientY) / 2;

        setZoomInfo((state: ZoomInfo) => {
          const currentZoom = getLimitedValue({
            min: 1,
            max: maxZoom,
            value:
              zoomInfoRef.startDistance > minDistBetweenFingers
                ? (zoomInfoRef.lastZoom * endDist) / zoomInfoRef.startDistance
                : state.zoom,
          });

          const dx =
            (zoomInfoRef.startZoomPosX / zoomInfoRef.lastZoom -
              zoomInfoRef.startZoomPosX / currentZoom) /
            zoomInfoRef.lastZoom;

          const dy =
            (zoomInfoRef.startZoomPosY / zoomInfoRef.lastZoom -
              zoomInfoRef.startZoomPosY / currentZoom) /
            zoomInfoRef.lastZoom;

          return {
            ...state,
            zoom: currentZoom,
            transitionX:
              zoomInfoRef.startDistance > minDistBetweenFingers
                ? allowDragWhenZooming
                  ? zoomInfoRef.lastX +
                    (endMidPointX - state.originX) / currentZoom +
                    dx
                  : zoomInfoRef.lastX + dx
                : state.transitionX,
            transitionY:
              zoomInfoRef.startDistance > minDistBetweenFingers
                ? allowDragWhenZooming
                  ? zoomInfoRef.lastY +
                    (endMidPointY - state.originY) / currentZoom +
                    dy
                  : zoomInfoRef.lastY + dy
                : state.transitionY,
          };
        });
      }
      if (zoomInfo.isDragging) {
        const fingerOne = e.touches[0];

        setZoomInfo((state: ZoomInfo) => ({
          ...state,
          transitionX: getLimitedValue({
            min: zoomInfoRef.isWidder
              ? -zoomInfoRef.marginRight - boundaryResistance / state.zoom
              : 0,
            max: zoomInfoRef.isWidder
              ? zoomInfoRef.marginLeft + boundaryResistance / state.zoom
              : 0,
            value:
              zoomInfoRef.lastX +
              (fingerOne.clientX - state.originX) / state.zoom,
          }),

          transitionY: getLimitedValue({
            max: zoomInfoRef.isHigher
              ? zoomInfoRef.marginTop + boundaryResistance / state.zoom
              : 0,

            min: zoomInfoRef.isHigher
              ? -zoomInfoRef.marginBottom - boundaryResistance / state.zoom
              : 0,

            value:
              zoomInfoRef.lastY +
              (fingerOne.clientY - state.originY) / state.zoom,
          }),
        }));
      }
    },
    [
      zoomInfo.isZooming,
      zoomInfo.isDragging,
      boundaryResistance,
      maxZoom,
      minDistBetweenFingers,
      zoomInfoRef,
      allowDragWhenZooming,
      preventDefaultTouchBehavior,
      tapInfoRef,
    ]
  );

  const onTouchEnd = useCallback(() => {
    if (zoomInfo.isZooming) {
      const {
        higherThanParent,
        widderThanParent,
        higherThanViewport,
        widderThanViewport,
        isHigher,
        isWidder,
      } = estimateOverflow(
        relativeTo,
        zoomInfoRef.target as HTMLElement,
        zoomInfo.zoom
      );

      zoomInfoRef.isHigher = isHigher;
      zoomInfoRef.isWidder = isWidder;

      zoomInfoRef.startDistance = 0;
      const { marginTop, marginLeft, marginBottom, marginRight } =
        getDragBoundries({
          target: zoomInfoRef.target as HTMLElement,
          zoom: zoomInfo.zoom,
          higherThanViewport,
          widderThanViewport,
          higherThanParent,
          widderThanParent,
        });

      zoomInfoRef.marginTop = marginTop;
      zoomInfoRef.marginLeft = marginLeft;
      zoomInfoRef.marginBottom = marginBottom;
      zoomInfoRef.marginRight = marginRight;
    }

    const { overMarginX, overMarginY } = calculateOverMargin({
      transitionX: zoomInfo.transitionX,
      transitionY: zoomInfo.transitionY,
      marginTop: zoomInfoRef.marginTop,
      marginLeft: zoomInfoRef.marginLeft,
      marginBottom: zoomInfoRef.marginBottom,
      marginRight: zoomInfoRef.marginRight,
    });

    if (zoomInfo.doubleTapped) {
      setZoomInfo((state: ZoomInfo) => ({
        ...state,
        doubleTapped: false,
      }));
    } else if (!zoomInfo.doubleTapped && !zoomInfo.wheeled) {
      setZoomInfo((state: ZoomInfo) => ({
        ...state,
        isDragging: false,
        isZooming: false,
        zoom: keepZoom ? state.zoom : zoomInfoRef.lastZoom,
        transitionX:
          zoomInfoRef.isWidder && keepZoom
            ? state.transitionX - overMarginX
            : 0,
        transitionY:
          zoomInfoRef.isHigher && keepZoom
            ? state.transitionY - overMarginY
            : 0,
      }));
    }
    if (preventDefaultTouchBehavior) {
      zoomInfoRef.scrolled = false;
      document.body.style.touchAction = "auto";
    }
  }, [
    zoomInfo,
    zoomInfoRef,
    keepZoom,
    relativeTo,
    preventDefaultTouchBehavior,
  ]);

  const onMouseWheel = useCallback(
    (e: React.WheelEvent) => {
      zoomInfoRef.target = e.currentTarget as HTMLElement;

      const { higherThanParent, higherThanViewport, isHigher } =
        estimateOverflow(relativeTo, zoomInfoRef.target, zoomInfoRef.lastZoom);

      if (!isHigher) return;

      const { marginTop, marginBottom } = getDragBoundries({
        target: zoomInfoRef.target,
        zoom: zoomInfoRef.lastZoom,
        higherThanViewport,
        widderThanViewport: false,
        widderThanParent: false,
        higherThanParent,
      });

      setZoomInfo((state: ZoomInfo) => {
        const currentTransitionY = getLimitedValue({
          max: marginTop,
          min: -marginBottom,
          value: state.transitionY - e.deltaY / state.zoom,
        });

        return {
          ...state,
          wheeled: true,
          transitionY: currentTransitionY,
        };
      });
    },

    [zoomInfoRef, relativeTo]
  );

  useEffect(() => {
    document.addEventListener("mouseup", onTouchEnd);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mouseup", onTouchEnd);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [onTouchEnd, onMouseMove]);

  useEffect(() => {
    if (!preventDefaultTouchBehavior && !preventDefaultWheelBehavior) return;

    if (preventDefaultTouchBehavior) {
      document.addEventListener("touchstart", prevDefaultPinchTouchStart, {
        passive: false,
      });
      document.addEventListener("touchmove", prevDefaultPinchBehavior, {
        passive: false,
      });
    }
    if (preventDefaultWheelBehavior) {
      document.addEventListener("wheel", prevDefaultWheelBehavior, {
        passive: false,
      });
    }
    return () => {
      if (preventDefaultTouchBehavior) {
        document.removeEventListener("touchstart", prevDefaultPinchTouchStart);
        document.removeEventListener("touchmove", prevDefaultPinchBehavior);
      }
      if (preventDefaultWheelBehavior) {
        document.removeEventListener("wheel", prevDefaultWheelBehavior);
      }
    };
  }, [
    prevDefaultPinchBehavior,
    preventDefaultTouchBehavior,
    prevDefaultWheelBehavior,
    preventDefaultWheelBehavior,
    prevDefaultPinchTouchStart,
  ]);

  return {
    /**
     * Function to handle "onMouseDown" event.
     */
    onMouseDown,

    /**
     * Function to handle "onTouchStart" event.
     */
    onDragStart,

    /**
     * Add this as a transform css property to your zoom element.
     */
    pinchZoomTransitionX: zoomInfo.transitionX,

    /**
     * Add this as a transform css property to your zoom element.
     */
    pinchZoomTransitionY: zoomInfo.transitionY,

    /**
     * Call this function to decrease the zoom.
     */
    handleDecreaseZoom,

    /**
     * Call this function to increase the zoom.
     */
    handleIncreaseZoom,

    /**
     * Call this function to reset the zoom/translation to its initial values.
     */
    handleResetZoom,

    /**
     * Add this as css property to your zoom element.
     */
    zoom: zoomInfo.zoom,

    /**
     * Changes the value to true when dragging.
     */
    isDragging: zoomInfo.isDragging,

    /**
     * Changes the value to true when zooming with two fingers.
     */
    isZooming: zoomInfo.isZooming,

    /**
     * Changes the value to true after double tap.
     */
    wasDoubleTapped: zoomInfo.doubleTapped,

    /**
     * Function to handle "onTouchMove" event.
     */
    onDraging,

    /**
     * Function to handle "onTouchEnd" event.
     */
    onTouchEnd,

    /**
     * Function to handle "onWheel" event. You should add this if you want to be able to scroll the zoomed element using the mouse wheel.
     */
    onMouseWheel,

    /**
     * Call this function to enable zooming/dragging.
     */
    enableDragAndZoom,

    /**
     * Call this function to disable zooming/dragging.
     */
    disableDragAndZoom,
  };
}

export default usePinchZoom;
