'use client';

import { useEffect, useState } from 'react';
import { Channel } from '@anycable/core';

const formatOnlineNames = (names: string[]) => {
  if (names.length === 0) return '';

  if (names.length === 1) return names[0] + ' is online';

  if (names.length === 2) return names.join(' and ') + ' are online';

  if (names.length === 3)
    return `${names[0]}, ${names[1]}, and ${names[2]} are online`;

  return `${names[0]}, ${names[1]}, and ${names.length - 2} are online`;
};

export const PresenceIndicator = (props: {
  username: string;
  channel: Channel | null;
}) => {
  const [names, setNames] = useState<string[]>([]);

  const channel = props.channel;
  const username = props.username;

  useEffect(() => {
    if (!channel) return;

    channel.presence.join(username, { name: username });

    let unbind = channel.on('presence', async (_msg) => {
      let state = await channel.presence.info();
      if (state) {
        let allNames = Object.values(state).map((info: any) => info.name);

        setNames(allNames.filter((name) => name !== username));
      }
    });

    return unbind;
  }, [channel]);

  if (names.length === 0) return null;

  return (
    <div className="absolute top-4 right-2 rounded-full bg-gray-200 px-3 py-1 text-gray-600 shadow-sm">
      {formatOnlineNames(names)}
    </div>
  );
};
