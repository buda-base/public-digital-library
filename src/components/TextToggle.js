import React, { useState, useEffect, useRef } from 'react';
import I18n from 'i18next';

const TextToggle = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEllipsisActive, setIsEllipsisActive] = useState(false);
  const textContainerRef = useRef(null);

  useEffect(() => {
    const checkEllipsis = () => {
      if (textContainerRef.current) {
        setIsEllipsisActive(textContainerRef.current.offsetWidth < textContainerRef.current.scrollWidth);
      }
    };

    checkEllipsis();
    window.addEventListener('resize', checkEllipsis);

    return () => {
      window.removeEventListener('resize', checkEllipsis);
    };
  }, [text]);

  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{display:"flex"}}>
      <div
        id="textContainer"
        ref={textContainerRef}
        className={`text-container ${isExpanded ? 'expanded' : 'ellipsis'}`}
      >
        {text}
        {isEllipsisActive && (
          <a onClick={toggleText}>
            {I18n.t(isExpanded ? 'misc.hide' : 'Rsidebar.priority.more')}
          </a>
        )}
      </div>
    </div>
  );
};

export default TextToggle;
