import { useState, useCallback, useEffect, useRef } from "react";

interface Props {
  /**
   * How far you can drag the zoomed element out of scope. Default value: 50.
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
}

interface ZoomInfo {
  allowDragAndZoom: boolean;
  isDragging: boolean;
  isZooming: boolean;
  doubleTapped: boolean;
  originX: number;
  originY: number;
  transitionX: number;
  transitionY: number;
  zoom: number;
}

interface GetLimitedState {
  min: number;
  max: number;
  value: number;
}

interface GetDragBoundries {
  target: HTMLElement;
  zoom: number;
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
  zoom: number;
  verticalCompensation: number;
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
  fingersStart: number;
  widderThanViewport: boolean;
  higherThanViewport: boolean;
  startZoomPosX: number;
  startZoomPosY: number;
  verticalOffset: number;
  horizontalOffset: number;
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
  return target.offsetWidth * zoom > window.innerWidth;
};

const isHigherThanViewport = (target: HTMLElement, zoom: number) => {
  return target.offsetHeight * zoom > window.innerHeight;
};

const calculateOverMargin = ({
  transitionX,
  transitionY,
  marginTop,
  marginLeft,
  marginRight,
  marginBottom,
  zoom,
  verticalCompensation,
}: CalculateOverMargin) => {
  const overMarginedY =
    transitionY !== 0 &&
    (transitionY > marginTop ||
      transitionY < -marginBottom + verticalCompensation / zoom);

  const overMarginedX =
    transitionX !== 0 &&
    (transitionX > marginLeft || transitionX < -marginRight);

  const overMarginY = overMarginedY
    ? transitionY > 0
      ? transitionY - marginTop
      : transitionY + marginBottom
    : 0;
  const overMarginX = overMarginedX
    ? transitionX > 0
      ? transitionX - marginLeft
      : transitionX + marginRight
    : 0;

  return { overMarginX, overMarginY };
};

const calculateHorizontalOffset = (target: HTMLElement) => {
  const offsetLeft = target.offsetLeft;
  const offsetRight = window.innerWidth - (offsetLeft + target.offsetWidth);

  return offsetRight - offsetLeft;
};

const calculateVerticalOffset = (target: HTMLElement) => {
  const offsetTop = target.offsetTop;
  const offsetBottom = window.innerHeight - (offsetTop + target.offsetHeight);

  return offsetBottom - offsetTop;
};

const getLimitedState = ({ min, max, value }: GetLimitedState) =>
  Math.min(max, Math.max(value, min));

const getDragBoundries = ({
  target,
  zoom,
  widderThanViewport,
  higherThanViewport,
}: GetDragBoundries) => {
  let marginLeft = 0,
    marginTop = 0,
    marginBottom = 0,
    marginRight = 0;

  if (widderThanViewport) {
    const offsetHorizontal = calculateHorizontalOffset(target);

    marginLeft =
      (target?.clientWidth * zoom - window.innerWidth + offsetHorizontal) /
      2 /
      zoom;

    marginRight =
      (target?.clientWidth * zoom - window.innerWidth - offsetHorizontal) /
      2 /
      zoom;
  }

  if (higherThanViewport) {
    const offsetVertical = calculateVerticalOffset(target);

    marginTop =
      (target?.clientHeight * zoom - window.innerHeight + offsetVertical) /
      2 /
      zoom;
    marginBottom =
      (target?.clientHeight * zoom - window.innerHeight - offsetVertical) /
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
}: Props) {
  const [zoomInfo, setZoomInfo] = useState({
    allowDragAndZoom: true,
    isDragging: false,
    isZooming: false,
    doubleTapped: false,
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
    fingersStart: 0,
    widderThanViewport: false,
    higherThanViewport: false,
    startZoomPosX: 0,
    startZoomPosY: 0,
    verticalOffset: 0,
    horizontalOffset: 0,
  }).current;

  const tapInfoRef = useRef<TapInfoRef>({
    lastTap: 0,
    timeout: undefined,
  }).current;

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
    setZoomInfo((state: ZoomInfo) => ({
      ...state,
      zoom: getLimitedState({
        min: 1,
        max: maxZoom,
        value: state.zoom + maxZoom / 4,
      }),
    }));
  }, [maxZoom]);

  const handleDecreaseZoom = useCallback(() => {
    setZoomInfo((state: ZoomInfo) => ({
      ...state,
      zoom: getLimitedState({
        min: 1,
        max: maxZoom,
        value: state.zoom - maxZoom / 4,
      }),
      transitionX: 0,
      transitionY: 0,
    }));
  }, [maxZoom]);

  const handleResetZoom = useCallback(() => {
    setZoomInfo({
      ...zoomInfo,
      isDragging: false,
      isZooming: false,
      doubleTapped: false,
      zoom: 1,
      transitionX: 0,
      transitionY: 0,
    });
  }, [zoomInfo]);

  const detectDoubleTap = useCallback((): boolean => {
    let doubleTapped = false;

    const curTime = new Date().getTime();
    const tapLen = curTime - tapInfoRef.lastTap;

    if (
      tapLen < doubleTapSensivity &&
      tapLen > 0 &&
      zoomInfo.allowDragAndZoom
    ) {
      doubleTapped = true;
    } else {
      tapInfoRef.timeout = setTimeout(() => {
        clearTimeout(tapInfoRef.timeout);
      }, doubleTapSensivity);
    }
    tapInfoRef.lastTap = curTime;

    return doubleTapped;
  }, [tapInfoRef, doubleTapSensivity, zoomInfo]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoomInfo.zoom === 1 || zoomInfo.isZooming || zoomInfo.isDragging)
        return;

      zoomInfoRef.target = e.currentTarget as HTMLElement;

      e.preventDefault();

      zoomInfoRef.higherThanViewport = isHigherThanViewport(
        e.currentTarget as HTMLElement,
        zoomInfo.zoom
      );
      zoomInfoRef.widderThanViewport = isWidderThanViewport(
        e.currentTarget as HTMLElement,
        zoomInfo.zoom
      );

      const { marginTop, marginLeft, marginBottom, marginRight } =
        getDragBoundries({
          target: e.currentTarget as HTMLElement,
          zoom: zoomInfo.zoom,
          higherThanViewport: zoomInfoRef.higherThanViewport,
          widderThanViewport: zoomInfoRef.widderThanViewport,
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
    ]
  );

  const onDragStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.target !== e.currentTarget) return;

      zoomInfoRef.target = e.currentTarget as HTMLElement;

      zoomInfoRef.fingersStart = e.targetTouches.length;

      zoomInfoRef.lastZoom = zoomInfo.zoom;
      zoomInfoRef.lastX = zoomInfo.transitionX;
      zoomInfoRef.lastY = zoomInfo.transitionY;

      const verticalOffset = calculateVerticalOffset(zoomInfoRef.target);
      const horizontalOffset = calculateHorizontalOffset(zoomInfoRef.target);

      zoomInfoRef.verticalOffset = verticalOffset;
      zoomInfoRef.horizontalOffset = horizontalOffset;

      if (zoomInfoRef.fingersStart === 2) {
        const fingerOne = e.touches[0];
        const fingerTwo = e.touches[1];

        const startMidPointX = (fingerOne.clientX + fingerTwo.clientX) / 2;
        const startMidPointY = (fingerOne.clientY + fingerTwo.clientY) / 2;

        const distance =
          e.targetTouches.length === 2 &&
          zoomInfoRef.fingersStart === 2 &&
          getDistanceBetweenFingers({
            fingerOne,
            fingerTwo,
          });

        zoomInfoRef.startZoomPosX =
          (window.innerWidth / 2 - startMidPointX - horizontalOffset / 2) *
          zoomInfoRef.lastZoom;

        zoomInfoRef.startZoomPosY =
          (window.innerHeight / 2 - startMidPointY - verticalOffset / 2) *
          zoomInfoRef.lastZoom;

        zoomInfoRef.startDistance = distance ? distance : 0;

        setZoomInfo({
          ...zoomInfo,
          isZooming: zoomInfo.allowDragAndZoom ? true : false,
          isDragging: false,
          originX: startMidPointX,
          originY: startMidPointY,
        });
      }
      if (zoomInfoRef.fingersStart === 1) {
        const fingerOne = e.touches[0];

        const startPointX = fingerOne.clientX;
        const startPointY = fingerOne.clientY;

        const doubleTapped = !disableDoubleTap && detectDoubleTap();

        if (doubleTapped) {
          const startZoomPosX =
            window.innerWidth / 2 - startPointX - horizontalOffset / 2;
          const startZoomPosY =
            window.innerHeight / 2 - startPointY - verticalOffset / 2;

          const dx = startZoomPosX - startZoomPosX / maxZoom;
          const dy = startZoomPosY - startZoomPosY / maxZoom;

          const higherThanViewport = isHigherThanViewport(
            e.currentTarget as HTMLElement,
            maxZoom
          );
          const widderThanViewport = isWidderThanViewport(
            e.currentTarget as HTMLElement,
            maxZoom
          );

          const { marginTop, marginLeft, marginBottom, marginRight } =
            getDragBoundries({
              target: e.currentTarget as HTMLElement,
              zoom: maxZoom,
              widderThanViewport,
              higherThanViewport,
            });

          setZoomInfo({
            ...zoomInfo,
            doubleTapped: true,
            isDragging: false,
            isZooming: false,
            zoom: zoomInfo.zoom === 1 ? maxZoom : 1,
            transitionX: getLimitedState({
              max: widderThanViewport ? marginLeft : 0,
              min: widderThanViewport ? -marginRight : 0,
              value: zoomInfo.zoom === 1 ? zoomInfo.transitionX + dx : 0,
            }),
            transitionY: getLimitedState({
              max: higherThanViewport ? marginTop : 0,
              min: higherThanViewport ? -marginBottom : 0,
              value: zoomInfo.zoom === 1 ? zoomInfo.transitionY + dy : 0,
            }),
          });
        } else if (!doubleTapped) {
          zoomInfoRef.higherThanViewport = isHigherThanViewport(
            e.currentTarget as HTMLElement,
            zoomInfo.zoom
          );
          zoomInfoRef.widderThanViewport = isWidderThanViewport(
            e.currentTarget as HTMLElement,
            zoomInfo.zoom
          );

          const { marginTop, marginLeft, marginBottom, marginRight } =
            getDragBoundries({
              target: e.currentTarget as HTMLElement,
              zoom: zoomInfo.zoom,
              widderThanViewport: zoomInfoRef.widderThanViewport,
              higherThanViewport: zoomInfoRef.higherThanViewport,
            });

          zoomInfoRef.marginTop = marginTop;
          zoomInfoRef.marginLeft = marginLeft;
          zoomInfoRef.marginBottom = marginBottom;
          zoomInfoRef.marginRight = marginRight;

          setZoomInfo({
            ...zoomInfo,
            isDragging: true,
            doubleTapped: false,
            isZooming: false,
            originX: startPointX,
            originY: startPointY,
          });
        }
      }
    },
    [zoomInfoRef, zoomInfo, detectDoubleTap, maxZoom, disableDoubleTap]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!zoomInfo.isDragging) return;

      setZoomInfo((state: ZoomInfo) => ({
        ...state,
        transitionX: zoomInfoRef.widderThanViewport
          ? getLimitedState({
              max: zoomInfoRef.marginLeft + boundaryResistance / state.zoom,
              min: -zoomInfoRef.marginRight - boundaryResistance / state.zoom,
              value: zoomInfoRef.lastX + e.clientX / state.zoom - state.originX,
            })
          : 0,

        transitionY: zoomInfoRef.higherThanViewport
          ? getLimitedState({
              max: zoomInfoRef.marginTop + boundaryResistance / state.zoom,
              min: -zoomInfoRef.marginBottom - boundaryResistance / state.zoom,
              value: zoomInfoRef.lastY + e.clientY / state.zoom - state.originY,
            })
          : 0,
      }));
    },
    [zoomInfoRef, boundaryResistance, zoomInfo]
  );

  const onDraging = useCallback(
    (e: React.TouchEvent) => {
      if (e.target !== e.currentTarget) return;

      if (zoomInfo.isZooming) {
        const fingerOne = e.touches[0];
        const fingerTwo = e.touches[1];

        const distance =
          e.targetTouches.length === 2 &&
          zoomInfoRef.fingersStart === 2 &&
          getDistanceBetweenFingers({
            fingerOne,
            fingerTwo,
          });

        const endDist = distance ? distance : 0;

        const endMidPointX = (fingerOne.clientX + fingerTwo.clientX) / 2;
        const endMidPointY = (fingerOne.clientY + fingerTwo.clientY) / 2;

        const dx =
          (zoomInfoRef.startZoomPosX / zoomInfoRef.lastZoom -
            zoomInfoRef.startZoomPosX / zoomInfo.zoom) /
          zoomInfoRef.lastZoom;

        const dy =
          (zoomInfoRef.startZoomPosY / zoomInfoRef.lastZoom -
            zoomInfoRef.startZoomPosY / zoomInfo.zoom) /
          zoomInfoRef.lastZoom;

        setZoomInfo((state: ZoomInfo) => ({
          ...state,
          transitionX:
            zoomInfoRef.startDistance > minDistBetweenFingers
              ? zoomInfoRef.lastX +
                (endMidPointX - state.originX) / state.zoom +
                dx
              : state.transitionX,
          transitionY:
            zoomInfoRef.startDistance > minDistBetweenFingers
              ? zoomInfoRef.lastY +
                (endMidPointY - state.originY) / state.zoom +
                dy
              : state.transitionY,

          zoom: getLimitedState({
            min: 1,
            max: maxZoom,
            value:
              zoomInfoRef.startDistance > minDistBetweenFingers
                ? (zoomInfoRef.lastZoom * endDist) / zoomInfoRef.startDistance
                : state.zoom,
          }),
        }));
      }
      if (zoomInfo.isDragging) {
        const fingerOne = e.touches[0];

        setZoomInfo((state: ZoomInfo) => ({
          ...state,
          transitionX: getLimitedState({
            min: zoomInfoRef.widderThanViewport
              ? -zoomInfoRef.marginLeft - boundaryResistance / state.zoom
              : 0,
            max: zoomInfoRef.widderThanViewport
              ? zoomInfoRef.marginLeft + boundaryResistance / state.zoom
              : 0,
            value:
              zoomInfoRef.lastX +
              (fingerOne.clientX - state.originX) / state.zoom,
          }),

          transitionY: getLimitedState({
            max: zoomInfoRef.higherThanViewport
              ? zoomInfoRef.marginTop + boundaryResistance / state.zoom
              : 0,

            min: zoomInfoRef.higherThanViewport
              ? -zoomInfoRef.marginBottom - boundaryResistance / state.zoom
              : 0,

            value:
              e.targetTouches.length === 1 && zoomInfoRef.fingersStart === 1
                ? zoomInfoRef.lastY +
                  (fingerOne.clientY - state.originY) / state.zoom
                : 0,
          }),
        }));
      }
    },
    [zoomInfo, boundaryResistance, maxZoom, minDistBetweenFingers, zoomInfoRef]
  );

  const onTouchEnd = useCallback(() => {
    zoomInfoRef.higherThanViewport = isHigherThanViewport(
      zoomInfoRef.target as HTMLElement,
      zoomInfo.zoom
    );
    zoomInfoRef.widderThanViewport = isWidderThanViewport(
      zoomInfoRef.target as HTMLElement,
      zoomInfo.zoom
    );

    if (zoomInfo.isZooming) {
      zoomInfoRef.startDistance = 0;
      const { marginTop, marginLeft, marginBottom, marginRight } =
        getDragBoundries({
          target: zoomInfoRef.target as HTMLElement,
          zoom: zoomInfo.zoom,
          higherThanViewport: zoomInfoRef.higherThanViewport,
          widderThanViewport: zoomInfoRef.widderThanViewport,
        });

      zoomInfoRef.marginTop = marginTop;
      zoomInfoRef.marginLeft = marginLeft;
      zoomInfoRef.marginBottom = marginBottom;
      zoomInfoRef.marginRight = marginRight;
    }

    const { overMarginX, overMarginY } = calculateOverMargin({
      transitionX: zoomInfo.transitionX,
      transitionY: zoomInfo.transitionY,
      zoom: zoomInfo.zoom,
      marginTop: zoomInfoRef.marginTop,
      marginLeft: zoomInfoRef.marginLeft,
      marginBottom: zoomInfoRef.marginBottom,
      marginRight: zoomInfoRef.marginRight,
      verticalCompensation: 0,
    });

    if (!zoomInfo.doubleTapped) {
      setZoomInfo((state: ZoomInfo) => ({
        ...state,
        isDragging: false,
        isZooming: false,
        zoom: keepZoom ? state.zoom : zoomInfoRef.lastZoom,
        transitionX:
          zoomInfoRef.widderThanViewport && keepZoom
            ? state.transitionX - overMarginX
            : 0,
        transitionY:
          zoomInfoRef.higherThanViewport && keepZoom
            ? state.transitionY - overMarginY
            : 0,
      }));
    }
  }, [zoomInfo, zoomInfoRef, keepZoom]);

  const onMouseWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.target !== e.currentTarget) return;

      const higherThanViewport = isHigherThanViewport(
        e.currentTarget as HTMLElement,
        zoomInfo.zoom
      );
      if (!higherThanViewport) return;

      const { marginTop, marginBottom } = getDragBoundries({
        target: e.currentTarget as HTMLElement,
        zoom: zoomInfo.zoom,
        higherThanViewport,
        widderThanViewport: true,
      });

      setZoomInfo((state: ZoomInfo) => ({
        ...state,
        transitionY: getLimitedState({
          max: marginTop,
          min: -marginBottom,
          value: state.transitionY - e.deltaY / state.zoom,
        }),
      }));
    },

    [zoomInfo.zoom]
  );

  useEffect(() => {
    document.addEventListener("mouseup", onTouchEnd);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mouseup", onTouchEnd);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [onTouchEnd, onMouseMove]);

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
