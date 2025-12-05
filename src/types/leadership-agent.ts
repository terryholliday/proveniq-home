export interface LeadershipAgent {
    phase: number;
    agent_name: string;
    role: string;
    goals: string[];
    tasks: string[];
    dependencies: string[];
    deliverables: string[];
    success_metrics: string[];
}

export interface LeadershipAgentWithSource extends LeadershipAgent {
    source: 'phase-0' | 'phase-3';
    fileName: string;
}

export const PHASE_0_AGENTS = [
    'ceo',
    'chief-of-staff',
    'capital-strategy-agent',
    'vision-keeper',
    'culture-guardian',
    'risk-radar-agent'
] as const;

export const PHASE_3_AGENTS = [
    'cfo',
    'chief-ai-architect',
    'ciso',
    'customer-success-lead',
    'head-of-infrastructure',
    'platform-product-manager',
    'trust-&-safety-lead',
    'vp-of-product',
    'vp-of-enterprise-sales',
    'vp-of-marketing'
] as const;

export type Phase0Agent = typeof PHASE_0_AGENTS[number];
export type Phase3Agent = typeof PHASE_3_AGENTS[number];
