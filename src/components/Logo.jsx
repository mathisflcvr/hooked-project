import React from 'react';

const Logo = ({ height = '38', width = 'auto' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Logo bleu de l'application de pêche */}
      <path 
        d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" 
        fill="#4285F4" 
      />
      <path 
        d="M16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24Z" 
        fill="white" 
      />
      <path 
        d="M19 12.5C19 13.8807 17.8807 15 16.5 15C15.1193 15 14 13.8807 14 12.5C14 11.1193 15.1193 10 16.5 10C17.8807 10 19 11.1193 19 12.5Z" 
        fill="#4285F4" 
      />
      {/* Représentation stylisée d'un hameçon */}
      <path 
        d="M22 14C22 14 24 18 22 22" 
        stroke="#4285F4" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M10 16C10 16 14 20 18 16" 
        stroke="#4285F4" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

export default Logo; 