import React from 'react';

const Logo = ({ height = '38', width = 'auto', style = {} }) => {
  return (
    <img 
      src="/images/Hooked-logo.svg" 
      alt="Hooked Logo"
      height={height}
      width={width}
      style={{ display: 'inline-block', ...style }}
    />
  );
};

export default Logo; 