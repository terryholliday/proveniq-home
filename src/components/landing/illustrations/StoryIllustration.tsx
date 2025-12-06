import { Heart, PlayCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function StoryIllustration(): JSX.Element | null {
    const beneficiaryAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');
    if (!beneficiaryAvatar) {
        return null;
    }
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs">
            <div className="flex flex-col items-center">
                <div className="bg-pink-100 rounded-full p-4 mb-4">
                    <Heart className="h-8 w-8 text-pink-500" />
                </div>
                <h2 className="font-bold text-lg">Grandma&apos;s Bracelet</h2>
                <p className="text-sm text-muted-foreground mb-4">Acquired: 1978</p>
                <div className="bg-gray-50 rounded-lg p-3 w-full flex items-center gap-3 mb-3 border">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={beneficiaryAvatar.imageUrl} alt="Sarah" />
                        <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xs text-muted-foreground text-left">BENEFICIARY</p>
                        <p className="font-semibold text-sm text-left">Sarah (Granddaughter)</p>
                    </div>
                </div>
                <Button variant="secondary" className="w-full bg-blue-50 hover:bg-blue-100 text-primary">
                    <PlayCircle className="mr-2 text-blue-500" /> LEGACY STORY
                </Button>
            </div>
        </div>
    );
}
