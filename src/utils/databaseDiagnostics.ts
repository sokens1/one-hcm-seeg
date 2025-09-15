import { supabase } from "@/integrations/supabase/client";

// Fonction de diagnostic pour tester l'accès à la base de données
export const diagnoseDatabaseAccess = async () => {
  const results = {
    tableAccess: false,
    rpcAccess: false,
    authStatus: false,
    errors: [] as string[]
  };

  try {
    // 1. Tester l'accès à la table job_offers
    // console.log('[DIAGNOSTIC] Testing job_offers table access...');
    const { data: tableTest, error: tableError } = await supabase
      .from('job_offers')
      .select('id')
      .limit(1);
    
    if (tableError) {
      results.errors.push(`Table access failed: ${tableError.message}`);
      console.error('[DIAGNOSTIC] Table access failed:', tableError);
    } else {
      results.tableAccess = true;
      // console.log('[DIAGNOSTIC] Table access successful:', tableTest);
    }

    // 2. Tester l'accès à la fonction RPC
    // console.log('[DIAGNOSTIC] Testing RPC function access...');
    const { data: rpcTest, error: rpcError } = await supabase.rpc('get_all_recruiter_applications');
    
    if (rpcError) {
      results.errors.push(`RPC access failed: ${rpcError.message}`);
      console.error('[DIAGNOSTIC] RPC access failed:', rpcError);
    } else {
      results.rpcAccess = true;
      // console.log('[DIAGNOSTIC] RPC access successful:', rpcTest);
    }

    // 3. Tester le statut d'authentification
    // console.log('[DIAGNOSTIC] Testing authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      results.errors.push(`Auth check failed: ${authError.message}`);
      console.error('[DIAGNOSTIC] Auth check failed:', authError);
    } else {
      results.authStatus = !!user;
      // console.log('[DIAGNOSTIC] Auth status:', { user: !!user, userId: user?.id });
    }

  } catch (error) {
    results.errors.push(`Unexpected error: ${error}`);
    console.error('[DIAGNOSTIC] Unexpected error:', error);
  }

  // console.log('[DIAGNOSTIC] Results:', results);
  return results;
};
