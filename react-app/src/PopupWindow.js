import React from 'react';

function PopupWindow({ title, subtext, onClose }) {
  return (
    <>
      <div className="popup-overlay"></div>
      <div className="popup-window">
        <div className="popup-content">
          <div className="popup-header">
            <h3>{title}</h3>
            <button className="popup-button" onClick={onClose}>X</button>
          </div>
          <div className="popup-body">
            <p>{subtext}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default PopupWindow;
