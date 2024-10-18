// app/dashboard/servers/page.tsx

import React from 'react';
import ServersConfig from '../../components/ServerConfigurationManager';
import VideoViewer from '../../components/Guides/DiscordChannelIdTutorial';

export default function ServersPage() {
    return (
        <div className="text-center">
            <ServersConfig />
            <VideoViewer />
        </div>
    );
}
