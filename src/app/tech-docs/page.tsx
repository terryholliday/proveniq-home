import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function TechDocsPage() {
    return (
        <div className="container py-8 max-w-4xl space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Technical Documentation</h1>
                <p className="text-muted-foreground text-lg">
                    Confidential. For internal development and investor due diligence only.
                </p>
            </div>

            <Separator />

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">1. Technology Stack</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Core Frameworks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Framework</span>
                                <Badge>Next.js 15 (App Router)</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Language</span>
                                <Badge variant="outline">TypeScript</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Styling</span>
                                <Badge variant="secondary">Tailwind CSS</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Backend & Infrastructure</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Platform</span>
                                <Badge>Google Firebase</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Database</span>
                                <Badge variant="outline">Firestore (NoSQL)</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Functions</span>
                                <Badge variant="secondary">Firebase Functions (Node.js)</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>AI Integration</span>
                                <Badge variant="destructive">Genkit</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">2. Key Libraries & Tools</h2>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <li className="p-2 border rounded-md text-center text-sm font-medium">Radix UI (Primitives)</li>
                    <li className="p-2 border rounded-md text-center text-sm font-medium">Lucide React (Icons)</li>
                    <li className="p-2 border rounded-md text-center text-sm font-medium">Recharts (Data Viz)</li>
                    <li className="p-2 border rounded-md text-center text-sm font-medium">React Hook Form</li>
                    <li className="p-2 border rounded-md text-center text-sm font-medium">Zod (Validation)</li>
                    <li className="p-2 border rounded-md text-center text-sm font-medium">Date-fns</li>
                    <li className="p-2 border rounded-md text-center text-sm font-medium">Playwright (E2E Testing)</li>
                    <li className="p-2 border rounded-md text-center text-sm font-medium">Jest (Unit Testing)</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">3. Architecture Overview</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Application Structure</CardTitle>
                        <CardDescription>High-level overview of the system architecture</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm leading-relaxed">
                        <p>
                            <strong>Frontend:</strong> The application is built using <strong>Next.js 15</strong> with the App Router architecture.
                            It utilizes Server Components for improved performance and SEO, with Client Components used for interactive elements.
                        </p>
                        <p>
                            <strong>Data Layer:</strong> Real-time data synchronization is handled by <strong>Firestore</strong>.
                            We use strict Security Rules to govern access based on user roles (Admin, User, etc.).
                        </p>
                        <p>
                            <strong>Authentication:</strong> Firebase Authentication manages identity, seamlessly integrated with the Next.js middleware for route protection.
                        </p>
                        <p>
                            <strong>Edge Capabilities:</strong> The app leverages Vercel's edge network for static asset delivery and Next.js middleware execution.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">4. AI & Automation</h2>
                <Card>
                    <CardContent className="pt-6 space-y-4 text-sm leading-relaxed">
                        <p>
                            The platform integrates <strong>Google Genkit</strong> to power intelligent features.
                        </p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li><strong>Agentic Workflows:</strong> Specialized AI agents handle complex tasks like scheduling, inventory analysis, and report generation.</li>
                            <li><strong>Evaluation:</strong> We continually evaluate AI outputs for safety, bias, and accuracy using custom evaluation pipelines.</li>
                            <li><strong>Adversarial Testing:</strong> Robust testing against adversarial inputs to ensure system resilience.</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
