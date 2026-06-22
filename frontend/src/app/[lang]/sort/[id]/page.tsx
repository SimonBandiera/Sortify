import type { Metadata } from 'next';
import LoadingScreen from '@/components/sort/LoadingScreen';
import '@/styles/loading.css';

export const metadata: Metadata = {
  title: 'Analysing',
};

export default async function SortPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LoadingScreen playlistId={id} />;
}
