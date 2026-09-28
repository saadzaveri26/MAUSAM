import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Operator Login | MeghSetu',
  description: 'Privileged operator authentication gateway for the MeghSetu National Weather Intelligence Platform.',
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
