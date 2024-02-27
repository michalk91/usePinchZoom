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

1. Import the “usePinchZoom” hook:

```javascript
import usePinchZoom from "use-pinch-zoom";

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

2. Assign event functions and pinchZoomTransitionX,
   pinchZoomTransitionY, zoom as CSS style properties to the elements you want to zoom.

```javascript
<img
  onMouseDown={onMouseDown}
  onTouchMove={onDraging}
  onTouchEnd={onTouchEnd}
  onTouchStart={onDragStart}
  onWheel={onMouseWheel}
  style={{
    transform: `scale(${zoom}) translateX(${pinchZoomTransitionX}px) translateY(${pinchZoomTransitionY}px)`,
  }}
/>
```

3. By default, this function blocks native zooming and scrolling in the browser for the enlarged element (not the entire document). However, this can be disabled using the "preventDefaultTouchBehavior" and "preventDefaultWheelBehavior" properties.
   
4. If you want to disable native zooming and scrolling for the entire document or content, such as a modal, you can add the CSS style "touch-action: none" to the "body" tag or modal container. If you want to disable native pinch zoom but still be able to scroll vertically and horizontally, you can set "touch-action: pan-y pan-x".
 
5. In order for the function to calculate everything correctly (margins, etc.), the enlarged **element must always be centered relative to its parent or fill it completely.** If you do not want the element that you are zooming in on to be centered in relation to the viewport, you can still achieve this. Simply wrap your element in a container that will either center it or completely fill it. Set the property **"relativeTo"** to "parent" or "both". You can place the container anywhere on the screen (left-aligned, right-aligned) and everything should work as intended.
   
   

&nbsp;

## Usage details

| Property               | Default | Type    | Details                                                                                   |
| ---------------------- | ------- | ------- | ----------------------------------------------------------------------------------------- |
| boundaryResistance?    | 50      | number  | How far you can drag the zoomed element out of scope.                                     |
| maxZoom?               | 3       | number  | Maximum zoom value.                                                                       |
| doubleTapSensivity?    | 300(ms) | number  | Double tap sensivity.                                                                     |
| minDistBetweenFingers? | 80(px)  | number  | The minimum distance between fingers that allows for zooming with two fingers.            |
| keepZoom?              | true    | boolean | You can set this to false if you want after touchend zoom return to the initial position. |
| disableDoubleTap?      | false   | boolean | You can set this option to true if you want to disable double-tap zoom.                   |
| zoomFactor?      | 4  | number | Defines how many times the increaseZoom function will need to be called to obtain the maximum zoom. For example, if you set 5, each function call will increase the element by 20 percent of its size. |
| relativeTo?      | "viewport"| "viewport", "parent", "both" | Specifies the element against which the boundaries will be set and the zoom calculations will be performed. It is important to keep in mind that the enlarged element should always be centered in relation to its parent. The default value is "viewport". You have the option to pass different values here, such as: "viewport", "parent", "both". If you choose "both", it means that the element will be positioned relative to the parent when it exceeds the parent's size, and relative to the viewport when it exceeds the viewport's size. This option combines the "parent" and "viewport" values and keeps track of both parent and viewport boundaries.     |
| allowDragWhenZooming?     | true  | boolean | It defines whether you can move an element during pinch zoom.      | 
| preventDefaultTouchBehavior?    | true  | boolean | Prevents the default pinch zoom and scroll functionality of the web browser when an element is enlarged with two fingers or when the zoom level is greater than 1.   |
|  preventDefaultWheelBehavior?    | true  | boolean | Prevents the default scroll functionality of the web browser when the zoom level of an element is greater than 1.  |

&nbsp;
### Functions and variables that return a hook.

| Function                        | Type           | Usage                                                                                                                              |
| -----------------------------   | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| onMouseDown          | function       | Function to handle "onMouseDown" event.                                                                                            |
| onDragStart           |  function      | Function to handle "onTouchStart" event.                                                                                           |
| onDragging            |   function     | Function to handle "onTouchMove" event.                                                                                            |
| onTouchEnd            |   function     | Function to handle "onTouchEnd" event.                                                                                             |
| onTouchEnd           | function       | Function to handle "onTouchEnd" event.                                                                                             |
| onMouseWheel         | function       | Function to handle "onWheel" event. You should add this if you want to be able to scroll the zoomed element using the mouse wheel. |
| handleDecreaseZoom    | function       | Call this function to decrease the zoom.                                                                                           |
| handleIncreaseZoom    |  function      | Call this function to increase the zoom.                                                                                           |
| handleResetZoom       | function       | Call this function to reset the zoom/translation to its initial values.                                                            |
| enableDragAndZoom     | function       | Call this function to enable zooming/dragging.                                                                                     |
| disableDragAndZoom    | function       | Call this function to disable zooming/dragging.                                                                                    |
| pinchZoomTransitionX            | number         | Add this as a transform css property to your zoom element.                                                                         |
| pinchZoomTransitionY            | number         | Add this as a transform css property to your zoom element.                                                                         |
| zoom                            |  number        | Add this as css property to your zoom element.                                                                                     |
| isDragging                      | boolean        | Changes the value to true when dragging.                                                                                           |
| isZooming                       |  boolean       | Changes the value to true when zooming with two fingers.                                                                           |
| wasDoubleTapped                 |  boolean       | Changes the value to true after double tap.                                                                                        |

&nbsp;

&nbsp;
## Example on Codesandbox

https://codesandbox.io/p/sandbox/usepinchzoom-mj589m
