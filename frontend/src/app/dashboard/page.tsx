import type { Metadata } from 'next';
import Nav from '@/components/ui/Nav';
import DashboardClient from '@/components/dashboard/DashboardClient';
import '@/styles/dashboard.css';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <>
      <Nav variant="dashboard" userName="user" />
      <DashboardClient />
    </>
  );
}
