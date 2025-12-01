import type { InventoryItem, Box } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id) || PlaceHolderImages[0];

// Mock Boxes Data
let mockBoxes: Box[] = [
  { id: 'box-1', name: 'Kitchen Utensils', moveId: 'move-1', destinationRoom: 'Kitchen' },
  { id: 'box-2', name: 'Living Room Books', moveId: 'move-1', destinationRoom: 'Living Room' }
];

export const getBoxes = (moveId: string) => mockBoxes.filter(b => b.moveId === moveId);

export const saveBox = (box: Partial<Box> & { moveId: string; name: string }) => {
  const newBox = {
    id: box.id || `box-${Date.now()}`,
    ...box
  } as Box;
  
  if (box.id) {
    mockBoxes = mockBoxes.map(b => b.id === box.id ? newBox : b);
  } else {
    mockBoxes.push(newBox);
  }
  return newBox;
};

export const deleteBox = (boxId: string) => {
  mockBoxes = mockBoxes.filter(b => b.id !== boxId);
  // Also update items to remove boxId
  // In a real app, this would be a DB transaction
  mockInventory.forEach(item => {
      if (item.boxId === boxId) item.boxId = undefined;
  });
};

export const updateItem = (item: InventoryItem) => {
    const index = mockInventory.findIndex(i => i.id === item.id);
    if (index !== -1) {
        mockInventory[index] = item;
    }
};

export const mockInventory: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Vintage Leather Armchair',
    category: 'Furniture',
    description: 'A comfortable and stylish vintage leather armchair, perfect for any living room. Shows some signs of wear consistent with its age, adding to its character.',
    imageUrl: getImage('armchair').imageUrl,
    imageHint: getImage('armchair').imageHint,
    quantity: 1,
    purchasePrice: 450,
    marketValue: 600,
    condition: 'Used - Good',
    location: 'Living Room',
    addedDate: '2023-05-20',
    warrantyInfo: '2-year limited warranty from purchase date.',
  },
  {
    id: 'item-2',
    name: 'MacBook Pro 16"',
    category: 'Electronics',
    description: '2021 MacBook Pro with M1 Max chip, 32GB RAM, 1TB SSD. In excellent condition with original packaging.',
    imageUrl: getImage('laptop').imageUrl,
    imageHint: getImage('laptop').imageHint,
    quantity: 1,
    purchasePrice: 3499,
    marketValue: 2800,
    condition: 'Used - Like New',
    location: 'Office',
    addedDate: '2023-08-15',
    warrantyInfo: 'AppleCare+ valid until August 2025.',
  },
  {
    id: 'item-3',
    name: 'Signed First Edition "Dune"',
    category: 'Books',
    description: 'A rare, signed first edition of Frank Herbert\'s masterpiece, "Dune". A true collector\'s item.',
    imageUrl: getImage('book').imageUrl,
    imageHint: getImage('book').imageHint,
    quantity: 1,
    purchasePrice: 1500,
    marketValue: 8500,
    condition: 'Used - Good',
    location: 'Office',
    addedDate: '2022-01-10',
    lent: {
      lentTo: 'Jane Doe',
      contact: 'jane.doe@email.com',
      lentDate: '2024-06-01',
      expectedReturnDate: '2024-09-01',
    },
  },
  {
    id: 'item-4',
    name: 'Yamaha Acoustic Guitar',
    category: 'Musical Instruments',
    description: 'Model FG800. Great for beginners and experienced players alike. Comes with a soft case and a new set of strings.',
    imageUrl: getImage('guitar').imageUrl,
    imageHint: getImage('guitar').imageHint,
    quantity: 1,
    purchasePrice: 200,
    marketValue: 150,
    condition: 'Used - Good',
    location: 'Living Room',
    addedDate: '2023-11-02',
  },
  {
    id: 'item-5',
    name: 'Le Creuset Dutch Oven',
    category: 'Kitchenware',
    description: '5.5-quart round Dutch oven in Cerise. Some minor scratches on the bottom, otherwise in perfect cooking condition.',
    imageUrl: getImage('dutch-oven').imageUrl,
    imageHint: getImage('dutch-oven').imageHint,
    quantity: 1,
    purchasePrice: 350,
    marketValue: 280,
    condition: 'Used - Good',
    location: 'Kitchen',
    addedDate: '2022-12-25',
  },
  {
    id: 'item-6',
    name: 'Trek Mountain Bike',
    category: 'Sporting Goods',
    description: 'Trek Marlin 5, size M/L. Ridden for one season. Has a few scuffs but is mechanically sound. Recently tuned up.',
    imageUrl: getImage('bike').imageUrl,
    imageHint: getImage('bike').imageHint,
    quantity: 1,
    purchasePrice: 800,
    marketValue: 550,
    condition: 'Used - Good',
    location: 'Garage',
    addedDate: '2023-04-12',
  },
    {
    id: 'item-7',
    name: 'Nikon D850 DSLR Camera',
    category: 'Electronics',
    description: 'Professional-grade DSLR camera body. Shutter count ~25,000. Includes two batteries and charger. Lens not included.',
    imageUrl: getImage('camera').imageUrl,
    imageHint: getImage('camera').imageHint,
    quantity: 1,
    purchasePrice: 2800,
    marketValue: 2000,
    condition: 'Used - Good',
    location: 'Office',
    addedDate: '2021-09-30',
    exif: {
      Make: 'NIKON CORPORATION',
      Model: 'NIKON D850',
      DateTimeOriginal: '2021-09-29T16:30:00',
      LensModel: 'AF-S NIKKOR 24-70mm f/2.8E ED VR',
      FNumber: 2.8,
      FocalLength: 50,
      ISO: 100,
      ShutterSpeedValue: 8.643856,
    },
  },
  {
    id: 'item-8',
    name: 'Eames Lounge Chair Replica',
    category: 'Furniture',
    description: 'High-quality replica of the classic Eames Lounge Chair and Ottoman. Black leather and walnut veneer. Very comfortable.',
    imageUrl: getImage('eames-chair').imageUrl,
    imageHint: getImage('eames-chair').imageHint,
    quantity: 1,
    purchasePrice: 900,
    marketValue: 750,
    condition: 'Used - Like New',
    location: 'Living Room',
    addedDate: '2023-10-01',
    lent: {
      lentTo: 'John Smith',
      contact: 'john.smith@email.com',
      lentDate: '2024-07-10',
      expectedReturnDate: '2024-08-10',
    }
  },
];
