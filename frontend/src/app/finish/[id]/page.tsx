import type { Metadata } from 'next';
import DoneScreen from '@/components/finish/DoneScreen';
import '@/styles/done.css';

export const metadata: Metadata = {
  title: 'Done',
};

export default async function FinishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DoneScreen playlistId={id} />;
}
