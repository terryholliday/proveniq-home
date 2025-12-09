'use client';
import React from 'react';
import Image, { ImageProps } from 'next/image';

type MyArkLogoProps = {
  size?: number;
  className?: string;
} & Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>;

export const MyArkLogo: React.FC<MyArkLogoProps> = ({ size = 64, className = '', ...props }) => {
  return (
    <Image
      src="/MyArkLogo.png"
      alt="MyARK Logo"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
      {...props}
    />
  );
};
