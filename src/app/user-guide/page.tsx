'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { guideTopics, GuideTopic, GuideCategory } from '@/lib/guide-data';
import { PageHeader } from '@/components/page-header';

const ProBadge = () => (
  <Badge className="ml-2 bg-primary text-primary-foreground text-xs">Pro</Badge>
);

const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-primary/20 font-bold rounded-sm">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const ScanningBestPractices = () => (
  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card className="border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center text-green-600">
          <CheckCircle className="mr-2" />
          Good Photo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Use bright, even lighting.</li>
          <li>Center the item in the frame.</li>
          <li>Use a simple, uncluttered background.</li>
          <li>Take multiple photos from different angles.</li>
        </ul>
      </CardContent>
    </Card>
    <Card className="border-red-500">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <XCircle className="mr-2" />
          Bad Photo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Photo is too dark or has harsh glare.</li>
          <li>Item is too far away or cropped out.</li>
          <li>Busy, distracting background.</li>
          <li>Blurry or out-of-focus image.</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

const specialComponents: Record<string, React.ComponentType> = {
  'scanning-best-practices': ScanningBestPractices,
};

export default function UserGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<GuideTopic | null>(guideTopics[0]);

  const categories = useMemo(() => [...new Set(guideTopics.map((topic) => topic.category))], []);

  const filteredTopics = useMemo(() => {
    return guideTopics.filter((topic) => {
      const matchesCategory = !selectedCategory || topic.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof topic.content === 'string' && topic.content.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isMobileTopicView = selectedTopic && isMobile;

  if (isMobileTopicView) {
    const SpecialComponent = selectedTopic.id ? specialComponents[selectedTopic.id] : null;
    return (
      <div className="p-4 md:p-6">
        <Button variant="outline" size="sm" onClick={() => setSelectedTopic(null)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Topics
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {selectedTopic.title}
              {selectedTopic.isPro && <ProBadge />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeof selectedTopic.content === 'string' ? (
              <div className="prose prose-sm max-w-none text-muted-foreground">{selectedTopic.content}</div>
            ) : (
              selectedTopic.content
            )}
            {SpecialComponent && <SpecialComponent />}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <PageHeader title="User Guide" description="Find answers and learn how to use Proveniq Home." />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-[calc(100vh-10rem)]">
      {/* Sidebar */}
      <aside className="md:col-span-1 flex flex-col gap-6">
        <Input
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={!selectedCategory ? 'default' : 'secondary'}
              onClick={() => setSelectedCategory(null)}
              className="cursor-pointer"
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                onClick={() => setSelectedCategory(category)}
                className="cursor-pointer"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto pr-2 -mr-2">
          <ul className="space-y-1">
            {filteredTopics.map((topic) => (
              <li key={topic.id}>
                <button
                  onClick={() => setSelectedTopic(topic)}
                  className={cn(
                    'w-full text-left p-2 rounded-md text-sm transition-colors',
                    selectedTopic?.id === topic.id
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Highlight text={topic.title} highlight={searchQuery} />
                  {topic.isPro && <ProBadge />}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Content */}
      <main className="md:col-span-3 overflow-y-auto">
        {selectedTopic ? (
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {selectedTopic.title}
                {selectedTopic.isPro && <ProBadge />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const SpecialComponent = specialComponents[selectedTopic.id];
                if (SpecialComponent) return <SpecialComponent />;
                if (typeof selectedTopic.content === 'string') {
                    return <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: selectedTopic.content.replace(/\n/g, '<br />') }} />;
                }
                return selectedTopic.content;
              })()}
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a topic to view its content.</p>
          </div>
        )}
      </main>
    </div>
    </>
  );
}
