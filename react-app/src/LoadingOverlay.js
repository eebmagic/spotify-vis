import React, { useState, useEffect } from "react";

function LoadingOverlay({ isLoading, children }) {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  useEffect(() => {
    toggleOverlay(isLoading);
  }, [isLoading]);

  const toggleOverlay = (value) => {
    setIsOverlayVisible(value);
  };

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            // backgroundColor: "rgba(255, 255, 255, 0.8)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 9999,
            display: isOverlayVisible ? "block" : "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              // width: "50px",
              // height: "50px",
              // width: "10%",
              // height: "10%",
              // backgroundImage: "url('loading-icon.svg')",
              // backgroundRepeat: "no-repeat",
              // backgroundPosition: "center",
            }}
          >
            {/* <img
              src="loading-icon.gif"
              alt="Loading..."
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            /> */}
            <object
              data="loading-icon.svg"
              type="image/svg+xml"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                // width: "100px",
                // height: "100px",
                // width: "10%",
                // height: "10%",
              }}
            />
          </div>
        </div>
      )}
      <div>{children}</div>
    </>
  );
}

export default LoadingOverlay;
