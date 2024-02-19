import { Routes, Route, Link } from "react-router-dom";
import { CSSProperties } from "react";
import RelativeToViewport from "./examples/RelativeToViewport";
import RelativeToParent from "./examples/RelativeToParent";
import RelativeToBoth from "./examples/RelativeToBoth";
import KeepZoomOff from "./examples/KeepZoomOff";

function App() {
  const containerStyle: CSSProperties = {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    zIndex: "15",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderBottom: "1px solid gray",
  };
  const liStyle: CSSProperties = {
    fontSize: "18px",
    textAlign: "center",
    listStyleType: "none",
    padding: "0 3%",
  };

  const LinkStyle: CSSProperties = {
    textDecoration: "none",
  };

  const navStyle: CSSProperties = {
    padding: "10px",
  };

  const ulStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  };
  return (
    <>
      <div>
        <div style={containerStyle}>
          <nav style={navStyle}>
            <ul style={ulStyle}>
              <li style={liStyle}>
                <Link style={LinkStyle} to="/relativetoviewport">
                  relativeToViewport
                </Link>
              </li>
              <li style={liStyle}>
                <Link style={LinkStyle} to="/relativetoparent">
                  relativeToParent
                </Link>
              </li>
              <li style={liStyle}>
                <Link style={LinkStyle} to="/relativetoboth">
                  relativeToBoth
                </Link>
              </li>
              <li style={liStyle}>
                <Link style={LinkStyle} to="/keepzoomoff">
                  !keepZoom(insta Zoom style)
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <Routes>
        <Route
          path="/relativetoviewport"
          element={<RelativeToViewport />}
        ></Route>
        <Route path="/relativetoparent" element={<RelativeToParent />}></Route>
        <Route path="/relativetoboth" element={<RelativeToBoth />}></Route>
        <Route path="/keepzoomoff" element={<KeepZoomOff />}></Route>
      </Routes>
    </>
  );
}

export default App;
