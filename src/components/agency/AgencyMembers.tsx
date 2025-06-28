'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useAgencyMembers } from '@/hooks/useAgencyMembers';
import { formatDate, formatDateTime } from '@/utils/helpers';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Agency, AgencyMemberWithProfile, PendingInvite } from '@/types/Agency';

interface AgencyMembersProps {
  agency: Agency;
}

export default function AgencyMembers({ agency }: AgencyMembersProps) {
  const { user } = useAuthContext();
  const { 
    fetchAgencyMembers, 
    fetchPendingInvites, 
    createInvite, 
    updateMemberRole, 
    removeMember, 
    deleteInvite,
    loading: membersLoading,
    error: membersError
  } = useAgencyMembers();

  const [members, setMembers] = useState<AgencyMemberWithProfile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [processingInvite, setProcessingInvite] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!agency || !user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch members
        const membersData = await fetchAgencyMembers(agency.id);
        setMembers(membersData);

        // Check if current user is admin
        const currentUserMember = membersData.find(
          member => member.user_id === user.id
        );
        setIsAdmin(currentUserMember?.role === 'admin');

        // Fetch pending invites
        const invitesData = await fetchPendingInvites(agency.id);
        setPendingInvites(invitesData);
      } catch (err: any) {
        console.error('Error loading agency data:', err);
        setError(err.message || 'Failed to load agency data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [agency, user, fetchAgencyMembers, fetchPendingInvites]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) return;
    
    setProcessingInvite(true);
    setInviteStatus(null);
    
    try {
      // Create the invite in the database
      const invite = await createInvite(inviteEmail.trim(), agency.id, inviteRole);
      
      if (!invite) {
        throw new Error('Failed to create invite');
      }
      
      // Send the invite email via API
      const response = await fetch('/api/agency/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId: invite.id,
          agencyName: agency.name,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invite email');
      }
      
      // Success - update UI
      setPendingInvites([...pendingInvites, invite]);
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteForm(false);
      setInviteStatus({
        success: true,
        message: `Invitation sent to ${invite.email}`,
      });
    } catch (err: any) {
      console.error('Error sending invite:', err);
      setInviteStatus({
        success: false,
        message: err.message || 'Failed to send invitation',
      });
    } finally {
      setProcessingInvite(false);
    }
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    if (!isAdmin) return;
    
    try {
      const success = await updateMemberRole(memberId, 'admin');
      
      if (success) {
        // Update the local state
        setMembers(members.map(member => 
          member.id === memberId 
            ? { ...member, role: 'admin' } 
            : member
        ));
      }
    } catch (err: any) {
      console.error('Error promoting member:', err);
      setError(err.message || 'Failed to promote member');
    }
  };

  const handleDemoteToMember = async (memberId: string) => {
    if (!isAdmin) return;
    
    try {
      // Check if this would leave the agency with no admins
      const adminCount = members.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        setError('Cannot demote the last admin. Promote another member to admin first.');
        return;
      }
      
      const success = await updateMemberRole(memberId, 'member');
      
      if (success) {
        // Update the local state
        setMembers(members.map(member => 
          member.id === memberId 
            ? { ...member, role: 'member' } 
            : member
        ));
      }
    } catch (err: any) {
      console.error('Error demoting member:', err);
      setError(err.message || 'Failed to demote member');
    }
  };

  const handleRemoveMember = async (memberId: string, role: string) => {
    if (!isAdmin) return;
    
    try {
      // Check if this would leave the agency with no admins
      if (role === 'admin') {
        const adminCount = members.filter(m => m.role === 'admin').length;
        if (adminCount <= 1) {
          setError('Cannot remove the last admin. Promote another member to admin first.');
          return;
        }
      }
      
      const success = await removeMember(memberId);
      
      if (success) {
        // Update the local state
        setMembers(members.filter(member => member.id !== memberId));
      }
    } catch (err: any) {
      console.error('Error removing member:', err);
      setError(err.message || 'Failed to remove member');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!isAdmin) return;
    
    try {
      const success = await deleteInvite(inviteId);
      
      if (success) {
        // Update the local state
        setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
      }
    } catch (err: any) {
      console.error('Error canceling invite:', err);
      setError(err.message || 'Failed to cancel invitation');
    }
  };

  const handleResendInvite = async (invite: PendingInvite) => {
    if (!isAdmin) return;
    
    try {
      // Resend the invite email via API
      const response = await fetch('/api/agency/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId: invite.id,
          agencyName: agency.name,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend invite email');
      }
      
      setInviteStatus({
        success: true,
        message: `Invitation resent to ${invite.email}`,
      });
    } catch (err: any) {
      console.error('Error resending invite:', err);
      setInviteStatus({
        success: false,
        message: err.message || 'Failed to resend invitation',
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">Loading members...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text-primary">Agency Members</h2>
        {isAdmin && (
          <Button 
            onClick={() => setShowInviteForm(!showInviteForm)}
            size="sm"
          >
            {showInviteForm ? 'Cancel' : 'Invite Member'}
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {inviteStatus && (
        <div className={`mb-4 p-3 ${
          inviteStatus.success 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        } rounded-md`}>
          {inviteStatus.message}
        </div>
      )}

      {isAdmin && showInviteForm && (
        <div className="mb-6 p-4 border border-border-light rounded-lg">
          <h3 className="font-medium text-text-primary mb-3">Invite a New Member</h3>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full p-2 border border-border-light rounded-md"
                placeholder="colleague@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="inviteRole" className="block text-sm font-medium text-text-secondary mb-1">
                Role
              </label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                className="w-full p-2 border border-border-light rounded-md"
              >
                <option value="member">Member</option>
                <option value="admin">Administrator</option>
              </select>
              <p className="mt-1 text-xs text-text-secondary">
                Administrators can manage members and agency settings.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={processingInvite || !inviteEmail.trim()}
              >
                {processingInvite ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-medium text-text-primary mb-3">Current Members ({members.length})</h3>
        {members.length === 0 ? (
          <div className="text-text-secondary text-sm">No members found.</div>
        ) : (
          <div className="border border-border-light rounded-lg divide-y divide-border-light">
            {members.map((member) => (
              <div key={member.id} className="p-3 flex flex-wrap justify-between items-center">
                <div className="mr-4 mb-2 sm:mb-0">
                  <div className="font-medium">
                    {member.profile?.first_name || ''} {member.profile?.last_name || ''}
                    {(!member.profile?.first_name && !member.profile?.last_name) && 'Unnamed User'}
                  </div>
                  <div className="text-sm text-text-secondary">{member.profile?.email || 'No email'}</div>
                  <div className="text-xs text-text-secondary mt-1">
                    Joined {formatDate(member.joined_at)} • 
                    <span className={`ml-1 ${member.role === 'admin' ? 'text-accent font-medium' : ''}`}>
                      {member.role === 'admin' ? 'Administrator' : 'Member'}
                    </span>
                  </div>
                </div>
                
                {isAdmin && member.user_id !== user?.id && (
                  <div className="flex flex-wrap gap-2">
                    {member.role === 'member' ? (
                      <Button 
                        size="xs" 
                        variant="secondary"
                        onClick={() => handlePromoteToAdmin(member.id)}
                      >
                        Promote to Admin
                      </Button>
                    ) : (
                      <Button 
                        size="xs" 
                        variant="secondary"
                        onClick={() => handleDemoteToMember(member.id)}
                      >
                        Demote to Member
                      </Button>
                    )}
                    
                    <Button 
                      size="xs" 
                      variant="danger"
                      onClick={() => handleRemoveMember(member.id, member.role)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                
                {member.user_id === user?.id && (
                  <div className="text-xs text-accent font-medium">
                    This is you
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && pendingInvites.length > 0 && (
        <div>
          <h3 className="font-medium text-text-primary mb-3">Pending Invitations ({pendingInvites.length})</h3>
          <div className="border border-border-light rounded-lg divide-y divide-border-light">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="p-3 flex flex-wrap justify-between items-center">
                <div className="mr-4 mb-2 sm:mb-0">
                  <div className="font-medium">{invite.email}</div>
                  <div className="text-xs text-text-secondary mt-1">
                    Invited {formatDateTime(invite.created_at)} • 
                    <span className={`ml-1 ${invite.role === 'admin' ? 'text-accent font-medium' : ''}`}>
                      {invite.role === 'admin' ? 'Administrator' : 'Member'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="xs" 
                    variant="secondary"
                    onClick={() => handleResendInvite(invite)}
                  >
                    Resend
                  </Button>
                  
                  <Button 
                    size="xs" 
                    variant="danger"
                    onClick={() => handleCancelInvite(invite.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
} 