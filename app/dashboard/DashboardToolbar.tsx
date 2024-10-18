'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HomeIcon, SettingsIcon, ServerIcon, Rss } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';

const toolbarItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Servers', path: '/dashboard/servers', icon: ServerIcon },
  { name: 'Status', path: '/status', icon: Rss },
  { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
];

interface Server {
  id: string;
  name: string;
  icon: string | null;
}

export const ServerSelector = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchServers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/discord?action=getGuilds');
        if (response.ok) {
          const guilds = await response.json();
          setServers(guilds);
          if (guilds.length > 0 && !selectedServer) {
            setSelectedServer(guilds[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch servers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();
  }, [selectedServer]);

  const handleServerChange = (serverId: string) => {
    setSelectedServer(serverId);
    router.push(`/dashboard?server=${serverId}`);
  };

  return (
    <Select value={selectedServer || undefined} onValueChange={handleServerChange} disabled={isLoading}>
      <SelectTrigger className="w-[180px] bg-white bg-opacity-20 text-white">
        <SelectValue placeholder={isLoading ? "Loading..." : "Select a server"} />
      </SelectTrigger>
      <SelectContent>
        {servers.map((server) => (
          <SelectItem key={server.id} value={server.id}>
            <div className="flex items-center">
              <Avatar className="w-6 h-6 mr-2">
                {server.icon ? (
                  <AvatarImage src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`} />
                ) : (
                  <AvatarFallback>{server.name.substring(0, 2)}</AvatarFallback>
                )}
              </Avatar>
              {server.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const Toolbar = () => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-full px-4 py-2 flex items-center space-x-4 shadow-lg">
        <TooltipProvider>
          {toolbarItems.map((item) => (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link 
                  href={item.path}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <item.icon size={24} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
        <ServerSelector />
      </div>
    </div>
  );
};
