## usePinchZoom hook
This is a react hook that allows you to zoom and drag using touch gestures and mouse events.
	

## Demo
 https://use-pinch-zoom.vercel.app/

	
## Setup
To run this project, install it locally using npm:

```
npm i use-pinch-zoom
```

## Quick start
1) Import the “usePinchZoom” hook:
```javascript
import useModalTransition from "use-pinch-zoom";

  const { 
    pinchZoomTransitionX,
    pinchZoomTransitionY,
    onMouseDown,
    onDragStart,
    isDragging,
    zoom,
    onDraging,
    onTouchEnd,
    onMouseWheel,
  } = usePinchZoom({});
```
2) Assign event functions and pinchZoomTransitionX,
    pinchZoomTransitionY, zoom as CSS style properties to the elements you want to zoom.
```javascript
   <img
     onMouseDown={onMouseDown}
     onTouchMove={onDraging}
     onTouchEnd={onTouchEnd}
     onTouchStart={onDragStart}
     onWheel={onMouseWheel}
     style={{transform: `scale(${zoom}) translateX(${pinchZoomTransitionX}px) translateY(${pinchZoomTransitionY}px)`}}
    />
```




## Usage details

Property       | Default      | Type          | Details
------------- | ------------- | ------------- | -------------
boundaryResistance? | 50 | number  | How far you can drag the zoomed element out of scope.
maxZoom? | 3 | number  | Maximum zoom value.
doubleTapSensivity? | 300(ms) | number  | Double tap sensivity.
minDistBetweenFingers? | 80(px) | number  | The minimum distance between fingers that allows for zooming with two fingers.
keepZoom? | true | boolean  | You can set this to false if you want after touchend zoom return to the initial position.
disableDoubleTap? | false | boolean  | You can set this option to true if you want to disable double-tap zoom.



### Functions and variables that hook returns
Function      | Usage
------------- |---------------------------------------------
onMouseDown(function) | Function to handle "onMouseDown" event.
onDragStart(function) | Function to handle "onTouchStart" event.
onDragging(function) | Function to handle "onTouchMove" event.
onTouchEnd(function)| Function to handle "onTouchEnd" event.
onTouchEnd(function) | Function to handle "onTouchEnd" event.
onMouseWheel(function) | Function to handle "onWheel" event. You should add this if you want to be able to scroll the zoomed element using the mouse wheel.
handleDecreaseZoom(function) | Call this function to decrease the zoom.
handleIncreaseZoom(function) | Call this function to increase the zoom.
handleResetZoom(function) | Call this function to reset the zoom/translation to its initial values.
enableDragAndZoom(function) | Call this function to enable zooming/dragging.
disableDragAndZoom(function) | Call this function to disable zooming/dragging.
pinchZoomTransitionX | Add this as a transform css property to your zoom element.
pinchZoomTransitionY | Add this as a transform css property to your zoom element.
zoom | Add this as css property to your zoom element.
isDragging | Changes the value to true when dragging.
isZooming | Changes the value to true when zooming with two fingers.
wasDoubleTapped | Changes the value to true after double tap.




## Examples on Codesandbox

