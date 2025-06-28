import { useState, useCallback } from 'react';
import supabase from '@/utils/supabase';
import { AgencyMember, AgencyMemberWithProfile, NewAgencyMember, PendingInvite, NewPendingInvite } from '@/types/Agency';
import { generateSecureToken } from '@/utils/helpers';

export function useAgencyMembers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all members of an agency
  const fetchAgencyMembers = useCallback(async (agencyId: string): Promise<AgencyMemberWithProfile[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('agency_members')
        .select(`
          *,
          profile:profiles(first_name, last_name, email)
        `)
        .eq('agency_id', agencyId);

      if (error) throw error;
      
      return data as AgencyMemberWithProfile[];
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching agency members:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current user's agency membership
  const fetchUserAgencyMembership = useCallback(async (userId: string): Promise<AgencyMember | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('agency_members')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No membership found
          return null;
        }
        throw error;
      }
      
      return data as AgencyMember;
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching user agency membership:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a user as a member of an agency
  const addAgencyMember = useCallback(async (memberData: NewAgencyMember): Promise<AgencyMember | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('agency_members')
        .insert([memberData])
        .select()
        .single();

      if (error) throw error;
      
      return data as AgencyMember;
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding agency member:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a member's role
  const updateMemberRole = useCallback(async (memberId: string, role: 'admin' | 'member'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('agency_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating member role:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove a member from an agency
  const removeMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('agency_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error removing member:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new invite
  const createInvite = useCallback(async (email: string, agencyId: string, role: 'admin' | 'member' = 'member'): Promise<PendingInvite | null> => {
    try {
      setLoading(true);
      setError(null);

      // Generate a secure token
      const token = generateSecureToken();
      
      const invite: NewPendingInvite = {
        email: email.toLowerCase().trim(),
        agency_id: agencyId,
        token,
        role
      };

      const { data, error } = await supabase
        .from('pending_invites')
        .insert([invite])
        .select()
        .single();

      if (error) throw error;
      
      return data as PendingInvite;
    } catch (error: any) {
      setError(error.message);
      console.error('Error creating invite:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending invites for an agency
  const fetchPendingInvites = useCallback(async (agencyId: string): Promise<PendingInvite[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('pending_invites')
        .select('*')
        .eq('agency_id', agencyId)
        .is('used_at', null);

      if (error) throw error;
      
      return data as PendingInvite[];
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching pending invites:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify and use an invite token
  const verifyInvite = useCallback(async (token: string): Promise<{ invite: PendingInvite | null; agency: any | null }> => {
    try {
      setLoading(true);
      setError(null);

      const { data: invite, error: inviteError } = await supabase
        .from('pending_invites')
        .select('*')
        .eq('token', token)
        .is('used_at', null)
        .single();

      if (inviteError) {
        if (inviteError.code === 'PGRST116') {
          setError('Invalid or expired invite token');
        } else {
          setError(inviteError.message);
        }
        return { invite: null, agency: null };
      }

      // Get agency details
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', invite.agency_id)
        .single();

      if (agencyError) {
        setError(agencyError.message);
        return { invite, agency: null };
      }

      return { invite, agency };
    } catch (error: any) {
      setError(error.message);
      console.error('Error verifying invite:', error);
      return { invite: null, agency: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark an invite as used
  const markInviteAsUsed = useCallback(async (inviteId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('pending_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (error) throw error;
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error marking invite as used:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a pending invite
  const deleteInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('pending_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
      
      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting invite:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAgencyMembers,
    fetchUserAgencyMembership,
    addAgencyMember,
    updateMemberRole,
    removeMember,
    createInvite,
    fetchPendingInvites,
    verifyInvite,
    markInviteAsUsed,
    deleteInvite
  };
} 