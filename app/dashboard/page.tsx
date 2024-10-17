// app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ServerConfigForm from '../components/config/GameServerSetup';
import { Toolbar } from './DashboardToolbar';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);

  useEffect(() => {
    const serverId = searchParams.get('server');
    if (serverId) {
      setSelectedGuildId(serverId);
    }
  }, [searchParams]);

  return (
    <div className="p-8">
      <h1 className="text-3xl text-white font-bold mb-4">Dashboard</h1>
      {selectedGuildId ? (
        <ServerConfigForm guildId={selectedGuildId} />
      ) : (
        <p>Please select a server to configure.</p>
      )}
      <Toolbar />
    </div>
  );
}
