'use client';

import { useState, useEffect } from 'react';
import { InventoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, ImageIcon } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ItemImageGalleryProps {
  item: InventoryItem;
  onBack: () => void;
  onUpdate: (updates: Partial<InventoryItem>) => void;
}

export function ItemImageGallery({ item, onBack, onUpdate }: ItemImageGalleryProps) {
  const [isFavorite, setIsFavorite] = useState(item.favorite || false);
  const allImages = [item.imageUrl, ...(item.additionalImages || [])].filter(Boolean) as string[];

  useEffect(() => {
    setIsFavorite(item.favorite || false);
  }, [item.favorite]);

  const handleToggleFavorite = () => {
    const newFavStatus = !isFavorite;
    setIsFavorite(newFavStatus);
    onUpdate({ favorite: newFavStatus });
  };

  return (
    <div className="relative h-72 lg:h-full bg-muted/30 flex items-center justify-center">
      {allImages.length > 0 ? (
        <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
                {allImages.map((img, idx) => (
                    <CarouselItem key={idx} className="h-full">
                        <div className="w-full h-full flex items-center justify-center p-4">
                           <img src={img} alt={`${item.name} image ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {allImages.length > 1 && <>
                <CarouselPrevious className="absolute left-4" />
                <CarouselNext className="absolute right-4" />
            </>}
        </Carousel>
      ) : (
        <div className="flex flex-col items-center text-muted-foreground">
          <ImageIcon size={48} className="mb-2" />
          <span>No Image</span>
        </div>
      )}

      <Button variant="ghost" size="icon" onClick={onBack} className="absolute top-4 left-4 bg-background/60 backdrop-blur-sm rounded-full hidden lg:inline-flex">
        <ArrowLeft size={20} />
      </Button>

      <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className={`absolute top-4 right-4 rounded-full bg-background/60 backdrop-blur-sm ${isFavorite ? 'text-red-500' : 'text-muted-foreground'}`}>
        <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
      </Button>
    </div>
  );
}