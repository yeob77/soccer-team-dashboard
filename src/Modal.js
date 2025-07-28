import React from 'react';
import './Modal.css'; // 모달 스타일을 위한 CSS 파일

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
        <button className="modal-close-btn" onClick={onClose}>X</button>
      </div>
    </div>
  );
};

export default Modal;