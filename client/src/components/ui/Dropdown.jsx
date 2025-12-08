import { useState, useRef, useEffect } from 'react';

export function Dropdown({ trigger, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-brutal shadow-brutal border-brutal border-black py-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ onClick, children, icon }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-left text-sm font-ui text-black hover:bg-orange/10 flex items-center space-x-2 transition-colors"
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
