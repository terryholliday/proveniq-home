import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ItemList } from "@/components/inventory/item-list";

export default function InventoryPage() {
    return (
        <>
            <PageHeader
                title="My Inventory"
                description="Browse and manage all items in your inventory."
                action={
                    <Link href="/inventory/add" passHref>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Item
                        </Button>
                    </Link>
                }
            />
            <ItemList />
        </>
    );
}
