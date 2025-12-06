import type { InventoryItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoreHorizontal, HeartHandshake, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ItemCardProps = {
  item: InventoryItem;
};

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/inventory/${item.id}`} passHref>
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={item.imageUrl || '/placeholder.png'}
              alt={`Image of ${item.name}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              data-ai-hint={item.imageHint}
            />
            {item.lent && (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/80 p-1.5 text-xs backdrop-blur-sm">
                <HeartHandshake className="h-3 w-3 text-primary" />
                <span>On Loan</span>
              </div>
            )}
            {item.visualTruthVerified && (
              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-green-500/90 p-1.5 text-xs text-white backdrop-blur-sm">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified</span>
              </div>
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/inventory/${item.id}`} className="flex-grow">
            <CardTitle className="text-base font-semibold leading-tight hover:underline">{item.name}</CardTitle>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Generate Sales Ad</DropdownMenuItem>
              <DropdownMenuItem>Lend Item</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="mt-1 text-sm">{item.category}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm">
        <div className="font-semibold text-lg">${item.marketValue?.toLocaleString() ?? '0'}</div>
        <Badge variant={item.condition === 'New' ? 'default' : 'secondary'}>{item.condition}</Badge>
      </CardFooter>
    </Card>
  );
}
