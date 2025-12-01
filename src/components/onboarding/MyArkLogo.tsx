'use client';
import React from 'react';

interface MyArkLogoProps {
  size?: number;
  className?: string;
  [key: string]: any;
}

export const MyArkLogo: React.FC<MyArkLogoProps> = ({ size = 64, className = '', ...props }) => {
  return (
    <img
      src="/MyArkLogo.png"
      alt="MyARK Logo"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
};
