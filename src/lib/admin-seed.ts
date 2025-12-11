import { LeadershipRole } from './types';
import PHASE_4_ROLES_JSON from './proveniq_claimsiq_roles.json';

interface RoleTaskData {
    title: string;
    description: string;
    security_level: string;
    data_source: string;
}

interface RoleData {
    id: string;
    title: string;
    description: string;
    tasks: RoleTaskData[];
}

const PHASE_4_ROLES: LeadershipRole[] = (PHASE_4_ROLES_JSON as RoleData[]).map((role: RoleData) => ({
    id: role.id,
    title: role.title,
    category: role.id.includes('compliance') ? 'compliance' :
        role.id.includes('security') ? 'security' :
            role.title.includes('Manager') ? 'executive' : 'operational',
    assigneeName: 'Vacant', // Default for new Phase 4 roles
    responsibilities: [
        role.description,
        ...role.tasks.map((t: RoleTaskData) => t.title)
    ],
    keyDeliverables: role.tasks.map((t: RoleTaskData) => t.data_source), // Using data_source as a proxy for deliverables
    status: 'vacant'
}));

export const SEED_ROLES: LeadershipRole[] = [
    {
        id: 'compliance-officer-phase3',
        title: 'Chief Compliance Officer (Phase 3)',
        category: 'compliance',
        assigneeName: 'System Admin',
        responsibilities: [
            'Oversee regulatory compliance (GDPR, CCPA)',
            'Manage legal document lifecycle',
            'Conduct quarterly risk assessments'
        ],
        keyDeliverables: [
            'Regulatory Risk Assessment',
            'Annual Compliance Report',
            'Privacy Policy Updates'
        ],
        status: 'active'
    },
    {
        id: 'security-lead',
        title: 'Head of Information Security',
        category: 'security',
        assigneeName: 'Vacant',
        responsibilities: [
            'Maintain SOC2 readiness',
            'Respond to security incidents',
            'Manage access controls and PIIA'
        ],
        keyDeliverables: [
            'Security Roadmap',
            'Penetration Test Reports',
            'Incident Response Plan'
        ],
        status: 'vacant'
    },
    {
        id: 'program-manager',
        title: 'Head Program Manager',
        category: 'executive',
        assigneeName: 'AI Agent',
        responsibilities: [
            'Coordinate Phase 4 Roadmap',
            'Daily Status Reporting',
            'Cross-functional alignment'
        ],
        keyDeliverables: [
            'Daily Status Reports',
            'Feature Roadmap',
            'Sprint Planning'
        ],
        status: 'active'
    },
    ...PHASE_4_ROLES
];
