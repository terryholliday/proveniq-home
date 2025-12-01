import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockInventory } from "@/lib/data";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LendingPage() {
    const lentItems = mockInventory.filter(item => item.lent);

    return (
        <>
            <PageHeader
                title="Lending Tracker"
                description="Keep track of items you've lent to friends and family."
            />
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Lent To</TableHead>
                                <TableHead className="hidden md:table-cell">Lent On</TableHead>
                                <TableHead className="hidden md:table-cell">Return Expected</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lentItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Link href={`/inventory/${item.id}`} passHref>
                                            <Avatar className="h-12 w-12 rounded-md">
                                                <AvatarImage src={item.imageUrl} alt={item.name} className="object-cover" />
                                                <AvatarFallback className="rounded-md">{item.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/inventory/${item.id}`} className="hover:underline">
                                            {item.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{item.lent?.lentTo}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {item.lent && new Date(item.lent.lentDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {item.lent && new Date(item.lent.expectedReturnDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                                <DropdownMenuItem>Mark as Returned</DropdownMenuItem>
                                                <DropdownMenuItem>View Item</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {lentItems.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            You haven't lent out any items.
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
