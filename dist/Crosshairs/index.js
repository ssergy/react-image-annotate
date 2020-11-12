import React, { Fragment
/*, useEffect, useState*/
} from "react";
export var Crosshairs = function Crosshairs(_ref) {
  var mousePosition = _ref.mousePosition,
      x = _ref.x,
      y = _ref.y;

  //const [forceRenderState, changeForceRenderState] = useState()
  if (mousePosition) {
    x = mousePosition.current.x;
    y = mousePosition.current.y;
  }
  /*useEffect(() => {
    if (!mousePosition) return
    const interval = setInterval(() => {
      if (x !== mousePosition.current.x || y !== mousePosition.current.y) {
        changeForceRenderState([
          mousePosition.current.x,
          mousePosition.current.y,
        ])
      }
    }, 10)
    return () => clearInterval(interval)
  })*/


  return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      height: "100%",
      width: 1,
      zIndex: 10,
      backgroundColor: "#f00",
      left: x,
      pointerEvents: "none",
      top: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: "100%",
      zIndex: 10,
      height: 1,
      backgroundColor: "#f00",
      top: y,
      pointerEvents: "none",
      left: 0
    }
  }));
};
export default Crosshairs;