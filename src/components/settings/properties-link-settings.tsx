'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Building2, Link as LinkIcon, Unlink, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { PropertiesLink, UserProfile } from '@/lib/types';
import {
  validatePropertiesInvite,
  acceptPropertiesLink,
  revokePropertiesLink,
  getPropertiesLinkStatusText,
  isPropertiesLinkActive,
  createDefaultPropertiesLink,
} from '@/services/properties-integration';
import { useToast } from '@/hooks/use-toast';

interface PropertiesLinkSettingsProps {
  userProfile: UserProfile;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  getIdToken: () => Promise<string>;
}

export function PropertiesLinkSettings({
  userProfile,
  updateUserProfile,
  getIdToken,
}: PropertiesLinkSettingsProps) {
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [validatedInvite, setValidatedInvite] = useState<{
    propertyId: string;
    unitId: string;
    leaseId: string;
    landlordOrgId: string;
  } | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<PropertiesLink['scopes']>({
    moveInPhotos: true,
    moveOutPhotos: true,
    damageReports: true,
  });

  const link = userProfile.propertiesLink || createDefaultPropertiesLink();
  const isLinked = isPropertiesLinkActive(link);

  const handleValidateInvite = async () => {
    if (!inviteCode.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter an invite code' });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validatePropertiesInvite(inviteCode.trim());
      if (result.valid && result.propertyId && result.unitId && result.leaseId && result.landlordOrgId) {
        setValidatedInvite({
          propertyId: result.propertyId,
          unitId: result.unitId,
          leaseId: result.leaseId,
          landlordOrgId: result.landlordOrgId,
        });
        toast({ title: 'Invite Valid', description: 'Review the permissions below and connect when ready.' });
      } else {
        toast({ variant: 'destructive', title: 'Invalid Invite', description: result.error || 'The invite code is invalid or expired.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to validate invite code' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleAcceptLink = async () => {
    if (!validatedInvite) return;

    setIsLinking(true);
    try {
      const idToken = await getIdToken();
      const result = await acceptPropertiesLink(
        {
          tenantEmail: userProfile.email,
          propertyId: validatedInvite.propertyId,
          unitId: validatedInvite.unitId,
          leaseId: validatedInvite.leaseId,
          landlordOrgId: validatedInvite.landlordOrgId,
          inviteToken: inviteCode.trim(),
        },
        selectedScopes,
        idToken
      );

      if (result.success && result.link) {
        await updateUserProfile({ propertiesLink: result.link });
        setValidatedInvite(null);
        setInviteCode('');
        toast({ title: 'Connected', description: 'Your account is now linked to your landlord.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to connect' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to connect to landlord' });
    } finally {
      setIsLinking(false);
    }
  };

  const handleRevokeLink = async () => {
    if (!link.leaseId) return;

    setIsRevoking(true);
    try {
      const idToken = await getIdToken();
      const result = await revokePropertiesLink(link.leaseId, idToken);

      if (result.success) {
        await updateUserProfile({
          propertiesLink: {
            ...link,
            status: 'revoked',
            revokedAt: new Date() as unknown as import('firebase/firestore').Timestamp,
          },
        });
        toast({ title: 'Access Revoked', description: 'Your landlord can no longer see your shared data.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to revoke access' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to revoke access' });
    } finally {
      setIsRevoking(false);
    }
  };

  // Only show for renters
  if (userProfile.occupancyMode !== 'renter') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Landlord Connection
        </CardTitle>
        <CardDescription>
          Connect with your landlord to share move-in/out photos and report maintenance issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLinked ? (
          <>
            {/* Connected State */}
            <Alert>
              <Check className="h-4 w-4" />
              <AlertTitle>Connected to Landlord</AlertTitle>
              <AlertDescription>
                Status: {getPropertiesLinkStatusText(link.status)}
                {link.linkedAt && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Connected since {new Date(link.linkedAt.toDate()).toLocaleDateString()}
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Shared Data Permissions</Label>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Move-in photos</span>
                  <span className={link.scopes.moveInPhotos ? 'text-green-600' : 'text-muted-foreground'}>
                    {link.scopes.moveInPhotos ? 'Shared' : 'Not shared'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Move-out photos</span>
                  <span className={link.scopes.moveOutPhotos ? 'text-green-600' : 'text-muted-foreground'}>
                    {link.scopes.moveOutPhotos ? 'Shared' : 'Not shared'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Damage reports</span>
                  <span className={link.scopes.damageReports ? 'text-green-600' : 'text-muted-foreground'}>
                    {link.scopes.damageReports ? 'Shared' : 'Not shared'}
                  </span>
                </div>
              </div>
            </div>

            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Revoke Access</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <span>Your landlord will no longer be able to see your shared photos or reports.</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRevokeLink}
                  disabled={isRevoking}
                  className="w-fit"
                >
                  {isRevoking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <Unlink className="mr-2 h-4 w-4" />
                      Revoke Access
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          </>
        ) : validatedInvite ? (
          <>
            {/* Scope Selection State */}
            <Alert>
              <Check className="h-4 w-4" />
              <AlertTitle>Invite Verified</AlertTitle>
              <AlertDescription>
                Choose what data you want to share with your landlord.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Permissions</Label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="scope-movein">Move-in photos</Label>
                    <p className="text-xs text-muted-foreground">Share room condition photos when you move in</p>
                  </div>
                  <Switch
                    id="scope-movein"
                    checked={selectedScopes.moveInPhotos}
                    onCheckedChange={(checked) => setSelectedScopes(s => ({ ...s, moveInPhotos: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="scope-moveout">Move-out photos</Label>
                    <p className="text-xs text-muted-foreground">Share room condition photos when you move out</p>
                  </div>
                  <Switch
                    id="scope-moveout"
                    checked={selectedScopes.moveOutPhotos}
                    onCheckedChange={(checked) => setSelectedScopes(s => ({ ...s, moveOutPhotos: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="scope-damage">Damage reports</Label>
                    <p className="text-xs text-muted-foreground">Share pre-existing damage documentation</p>
                  </div>
                  <Switch
                    id="scope-damage"
                    checked={selectedScopes.damageReports}
                    onCheckedChange={(checked) => setSelectedScopes(s => ({ ...s, damageReports: checked }))}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Your personal inventory, valuations, and insurance claims are never shared.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleAcceptLink}
                  disabled={isLinking}
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Connect
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setValidatedInvite(null);
                    setInviteCode('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Initial State - Enter Invite Code */}
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <p className="text-xs text-muted-foreground">
                Enter the invite code from your landlord to connect your accounts.
              </p>
              <div className="flex gap-2">
                <Input
                  id="invite-code"
                  placeholder="Enter invite code..."
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <Button onClick={handleValidateInvite} disabled={isValidating}>
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Don&apos;t have an invite code? Ask your landlord to send you one through PROVENIQ Properties.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
