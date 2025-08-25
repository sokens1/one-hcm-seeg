// Ambient declarations to satisfy TypeScript in IDE for Deno URL imports
// These do not affect the Deno runtime used by Supabase Edge Functions.

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}
declare module 'https://esm.sh/*' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyModule: any;
  export = anyModule;
}

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

// Minimal global Deno declaration for IDE type checking
declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};
