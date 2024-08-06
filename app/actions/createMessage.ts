'use server';

import { Message } from '../types';

// Public AnyCable server instance
const BROADCAST_URL =
  process.env.BROADCAST_URL || 'http://localhost:8090/_broadcast';

export const createMessage = async (message: Message) => {
  console.log('[SERVER] New message:', message);

  const publication = {
    stream: 'stackblitz-demo',
    data: JSON.stringify({ event: 'message', message }),
  };

  try {
    const res = await fetch(BROADCAST_URL, {
      method: 'POST',
      body: JSON.stringify(publication),
    });

    if (!res.ok) {
      throw new Error(`Error broadcasting to AnyCable: ${res.statusText}`);
    }

    console.log('Response:', res.status);
  } catch (e) {
    console.log('Broadcast failed', e);
  }
};
