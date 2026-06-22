import type { Metadata } from 'next';
import DashboardClient from '@/components/dashboard/DashboardClient';
import '@/styles/dashboard.css';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
