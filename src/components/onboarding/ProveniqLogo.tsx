'use client';
import React from 'react';
import Image, { ImageProps } from 'next/image';

type ProveniqLogoProps = {
  size?: number;
  className?: string;
} & Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>;

export const ProveniqLogo: React.FC<ProveniqLogoProps> = ({ size = 64, className = '', ...props }) => {
  return (
    <Image
      src="/ProveniqLogo.png"
      alt="Proveniq Home Logo"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
      {...props}
    />
  );
};
