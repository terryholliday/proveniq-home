/**
 * Properties Integration Service
 * 
 * Handles the consent-based data sharing between PROVENIQ Home (renter) and PROVENIQ Properties (landlord).
 * 
 * Privacy Model:
 * - Tenant controls what landlord sees
 * - Sharing is lease-scoped (auto-revokes on lease end)
 * - Landlord cannot request/demand access to full inventory
 * 
 * Shared Data Scopes:
 * - moveInPhotos: Move-in condition photos (room-level)
 * - moveOutPhotos: Move-out condition photos
 * - damageReports: Pre-existing damage documentation
 * 
 * NOT Shared:
 * - Personal valuations
 * - Insurance claims
 * - Full inventory
 */

import { PropertiesLink, PropertiesLinkStatus } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

const PROPERTIES_API_BASE = process.env.NEXT_PUBLIC_PROPERTIES_API_URL || 'http://localhost:8001';

export interface PropertiesLinkRequest {
  tenantEmail: string;
  propertyId: string;
  unitId: string;
  leaseId: string;
  landlordOrgId: string;
  inviteToken: string;
}

export interface PropertiesLinkResponse {
  success: boolean;
  error?: string;
  link?: PropertiesLink;
}

export interface LandlordFixture {
  id: string;
  name: string;
  category: string;
  location: string;
  condition?: string;
  notes?: string;
}

export interface LandlordFixturesResponse {
  success: boolean;
  fixtures: LandlordFixture[];
  error?: string;
}

export interface SharedEvidencePayload {
  type: 'move_in' | 'move_out' | 'damage_report';
  roomName: string;
  photos: {
    url: string;
    hash: string;
    timestamp: string;
  }[];
  notes?: string;
}

/**
 * Validate a Properties invite link token
 */
export async function validatePropertiesInvite(
  inviteToken: string
): Promise<{ valid: boolean; propertyId?: string; unitId?: string; leaseId?: string; landlordOrgId?: string; error?: string }> {
  try {
    const response = await fetch(`${PROPERTIES_API_BASE}/api/v1/tenant-invites/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: inviteToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { valid: false, error: error.detail || 'Invalid invite' };
    }

    const data = await response.json();
    return {
      valid: true,
      propertyId: data.property_id,
      unitId: data.unit_id,
      leaseId: data.lease_id,
      landlordOrgId: data.org_id,
    };
  } catch (error) {
    console.error('[PropertiesIntegration] Validate invite error:', error);
    return { valid: false, error: 'Failed to validate invite' };
  }
}

/**
 * Accept a Properties link invitation with selected scopes
 */
export async function acceptPropertiesLink(
  request: PropertiesLinkRequest,
  scopes: PropertiesLink['scopes'],
  userIdToken: string
): Promise<PropertiesLinkResponse> {
  try {
    const response = await fetch(`${PROPERTIES_API_BASE}/api/v1/tenant-access/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userIdToken}`,
      },
      body: JSON.stringify({
        invite_token: request.inviteToken,
        scopes: {
          move_in_photos: scopes.moveInPhotos,
          move_out_photos: scopes.moveOutPhotos,
          damage_reports: scopes.damageReports,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail || 'Failed to accept invite' };
    }

    const link: PropertiesLink = {
      status: 'linked',
      linkedAt: Timestamp.now(),
      propertyId: request.propertyId,
      unitId: request.unitId,
      leaseId: request.leaseId,
      landlordOrgId: request.landlordOrgId,
      scopes,
    };

    return { success: true, link };
  } catch (error) {
    console.error('[PropertiesIntegration] Accept link error:', error);
    return { success: false, error: 'Failed to connect to Properties' };
  }
}

/**
 * Revoke Properties link access
 */
export async function revokePropertiesLink(
  leaseId: string,
  userIdToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${PROPERTIES_API_BASE}/api/v1/tenant-access/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userIdToken}`,
      },
      body: JSON.stringify({ lease_id: leaseId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail || 'Failed to revoke access' };
    }

    return { success: true };
  } catch (error) {
    console.error('[PropertiesIntegration] Revoke link error:', error);
    return { success: false, error: 'Failed to revoke access' };
  }
}

/**
 * Fetch landlord fixtures for the linked unit
 * Used to pre-populate landlord fixtures in renter mode
 */
export async function fetchLandlordFixtures(
  unitId: string,
  userIdToken: string
): Promise<LandlordFixturesResponse> {
  try {
    const response = await fetch(`${PROPERTIES_API_BASE}/api/v1/units/${unitId}/fixtures`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userIdToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, fixtures: [], error: error.detail || 'Failed to fetch fixtures' };
    }

    const data = await response.json();
    const fixtures: LandlordFixture[] = data.fixtures.map((f: Record<string, unknown>) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      location: f.location,
      condition: f.condition,
      notes: f.notes,
    }));

    return { success: true, fixtures };
  } catch (error) {
    console.error('[PropertiesIntegration] Fetch fixtures error:', error);
    return { success: false, fixtures: [], error: 'Failed to fetch fixtures' };
  }
}

/**
 * Share evidence with landlord (move-in/out photos, damage reports)
 * Only shares data within the scopes the tenant has approved
 */
export async function shareEvidenceWithLandlord(
  leaseId: string,
  evidence: SharedEvidencePayload,
  userIdToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${PROPERTIES_API_BASE}/api/v1/tenant-evidence/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userIdToken}`,
      },
      body: JSON.stringify({
        lease_id: leaseId,
        evidence_type: evidence.type,
        room_name: evidence.roomName,
        photos: evidence.photos,
        notes: evidence.notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail || 'Failed to share evidence' };
    }

    return { success: true };
  } catch (error) {
    console.error('[PropertiesIntegration] Share evidence error:', error);
    return { success: false, error: 'Failed to share evidence' };
  }
}

/**
 * Create a new PropertiesLink object with default values
 */
export function createDefaultPropertiesLink(): PropertiesLink {
  return {
    status: 'none',
    scopes: {
      moveInPhotos: false,
      moveOutPhotos: false,
      damageReports: false,
    },
  };
}

/**
 * Check if a link is active
 */
export function isPropertiesLinkActive(link?: PropertiesLink): boolean {
  return link?.status === 'linked';
}

/**
 * Get human-readable status for Properties link
 */
export function getPropertiesLinkStatusText(status: PropertiesLinkStatus): string {
  switch (status) {
    case 'none':
      return 'Not connected';
    case 'pending':
      return 'Invite pending';
    case 'linked':
      return 'Connected';
    case 'revoked':
      return 'Access revoked';
    default:
      return 'Unknown';
  }
}
