import type { Metadata } from 'next';
import GenrePickerClient from '@/components/create/GenrePickerClient';
import '@/styles/create.css';

export const metadata: Metadata = {
  title: 'Pick Genres',
};

export default async function CreatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GenrePickerClient playlistId={id} />;
}
