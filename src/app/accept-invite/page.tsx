'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useAgencyMembers } from '@/hooks/useAgencyMembers';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Agency, AgencyMember, PendingInvite } from '@/types/Agency';

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuthContext();
  const { verifyInvite, markInviteAsUsed, addAgencyMember, fetchUserAgencyMembership } = useAgencyMembers();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<PendingInvite | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [currentAgencyMembership, setCurrentAgencyMembership] = useState<AgencyMember | null>(null);
  const [needsConfirmationToLeave, setNeedsConfirmationToLeave] = useState(false);

  useEffect(() => {
    async function verifyInviteToken() {
      if (!token) {
        setError('No invite token provided');
        setLoading(false);
        return;
      }

      try {
        const { invite: inviteData, agency: agencyData } = await verifyInvite(token);
        
        if (!inviteData || !agencyData) {
          setError('Invalid or expired invite token');
          setLoading(false);
          return;
        }

        setInvite(inviteData);
        setAgency(agencyData);

        // Check if user is already in this or another agency
        if (user) {
          const userMembership = await fetchUserAgencyMembership(user.id);
          if (userMembership) {
            setCurrentAgencyMembership(userMembership);
            // If user is already in a different agency, they'll need to confirm
            if (userMembership.agency_id !== agencyData.id) {
              setNeedsConfirmationToLeave(true);
            }
          }
        }

      } catch (err: any) {
        console.error('Error verifying invite:', err);
        setError(err.message || 'Failed to verify invite');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      verifyInviteToken();
    } else {
      setLoading(false);
      setError('No invite token provided');
    }
  }, [token, user, verifyInvite, fetchUserAgencyMembership]);

  const handleAcceptInvite = async () => {
    if (!user || !invite || !agency) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Add the user to the agency
      const memberData = {
        user_id: user.id,
        agency_id: agency.id,
        role: invite.role as 'admin' | 'member',
      };

      const memberResult = await addAgencyMember(memberData);
      if (!memberResult) {
        throw new Error('Failed to add you to the agency');
      }

      // Mark the invite as used
      await markInviteAsUsed(invite.id);

      // Redirect to the agency dashboard
      router.push('/agency/dashboard');
    } catch (err: any) {
      console.error('Error accepting invite:', err);
      setError(err.message || 'Failed to accept invite');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmLeaveAndJoin = async () => {
    if (!user || !invite || !agency || !currentAgencyMembership) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // First we need to delete the current membership
      await fetch('/api/agency/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: currentAgencyMembership.id,
        }),
      });

      // Then add the user to the new agency
      const memberData = {
        user_id: user.id,
        agency_id: agency.id,
        role: invite.role as 'admin' | 'member',
      };

      const memberResult = await addAgencyMember(memberData);
      if (!memberResult) {
        throw new Error('Failed to add you to the agency');
      }

      // Mark the invite as used
      await markInviteAsUsed(invite.id);

      // Redirect to the agency dashboard
      router.push('/agency/dashboard');
    } catch (err: any) {
      console.error('Error during agency transition:', err);
      setError(err.message || 'Failed to update your agency membership');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="animate-pulse">Verifying invitation...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Invitation Error</h1>
            <div className="text-red-500 mb-6">{error}</div>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Sign In Required</h1>
            <p className="text-text-secondary mb-6">
              You need to sign in before you can accept this invitation.
            </p>
            <Link href={`/login?redirect=/accept-invite?token=${token}`}>
              <Button>Sign In</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (needsConfirmationToLeave) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Already a Member of Another Agency</h1>
            <p className="text-text-secondary mb-6">
              You are already a member of another agency. You can only be in one agency at a time.
              If you accept this invitation, you will leave your current agency.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/agency/dashboard')}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmLeaveAndJoin}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Leave Current Agency & Join'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-lg mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Agency Invitation</h1>
          {agency && (
            <p className="text-text-secondary mb-6">
              You've been invited to join <span className="font-bold">{agency.name}</span> as a{' '}
              <span className="font-bold">{invite?.role === 'admin' ? 'Administrator' : 'Member'}</span>.
            </p>
          )}
          
          {currentAgencyMembership && currentAgencyMembership.agency_id === agency?.id && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
              <p className="text-amber-800">
                You are already a member of this agency.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => router.push('/')}
              disabled={processing}
            >
              Decline
            </Button>
            {!currentAgencyMembership || currentAgencyMembership.agency_id !== agency?.id ? (
              <Button
                onClick={handleAcceptInvite}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Accept Invitation'}
              </Button>
            ) : (
              <Button onClick={() => router.push('/agency/dashboard')}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
} 