import React from 'react';
import CardDetailClient from '@/components/CardDetailClient';
import cardsRaw from '@/data/cards.json';

export function generateStaticParams() {
  return (cardsRaw as Array<{ id: number }>).map((c) => ({
    id: String(c.id),
  }));
}

export default async function StandaloneCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CardDetailClient id={id} />;
}
