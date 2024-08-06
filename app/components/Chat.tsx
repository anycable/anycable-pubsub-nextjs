'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { nanoid } from 'nanoid';

import { createMessage } from '../actions/createMessage';
import { Message } from '../types';
import createCable from '../cable';
import { Channel } from '@anycable/core';

const autoScroll = (container: HTMLElement) => {
  /*
  Marvelous thing: at some point `scrollTop` started to give me… fractional numbers!
  Let's pretend that 5 pixel difference doesn't, really matter here.
  */
  const isCurrentlyAtBottom =
    Math.abs(
      container.scrollTop - (container.scrollHeight - container.clientHeight)
    ) < 5;

  if (isCurrentlyAtBottom) {
    // Wrapping with timeout to scroll after new message is rendered
    setTimeout(() => container.scrollTo({ top: container.scrollHeight }));
  }
};

const Message = (props: {
  key: string;
  message: Message;
  mine: boolean;
  showName: boolean;
}) => {
  const { message, mine, showName } = props;

  return (
    <div
      className={`relative flex max-w-[85%] flex-col gap-1 rounded-md border p-2 pb-1 shadow md:max-w-[66%] ${
        mine
          ? 'self-end border-teal-100 bg-teal-50 dark:bg-teal-500 dark:text-white dark:border-none'
          : 'self-start bg-white dark:text-black'
      }`}
    >
      {showName && (
        <span className="select-none truncate text-xs font-semibold text-gray-400">
          {message.username}
        </span>
      )}
      <p>{message.body}</p>
    </div>
  );
};

const MessageList = (props: { messages: Message[]; user: string }) => {
  const { user, messages } = props;

  return (
    <div className="flex h-full flex-col justify-end gap-2 py-4">
      {messages.map((message, i) => {
        const mine = message.username === user;

        const showName =
          !mine && messages[i - 1]?.username !== message.username;

        return (
          <Message
            key={message.id}
            message={message}
            mine={mine}
            showName={showName}
          />
        );
      })}
      {!messages.length && (
        <p className="text-center text-sm text-gray-500 mt-10">{`No messages have bees seen here recently. Don't be shy, send something!`}</p>
      )}
    </div>
  );
};

const NewMessageForm = (props: {
  createMessage: (msg: string) => void;
  onTyping: () => void;
}) => {
  const { createMessage, onTyping } = props;
  const [body, setBody] = useState('');

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();

        if (body) {
          createMessage(body);
          setBody('');
        }
      }}
    >
      <div className="flex-grow">
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <input
          id="message"
          className="h-full w-full rounded-md border-0 px-2.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onInput={onTyping}
          autoComplete="off"
          placeholder="Message"
        />
      </div>

      <button
        className="relative cursor-pointer rounded-md disabled:cursor-not-allowed text-white bg-red-500 enabled:hover:bg-red-400 disabled:bg-red-300 px-5 py-2 rounded-md"
        type="submit"
      >
        Send
      </button>
    </form>
  );
};

class TypingSet {
  active: Record<string, number>;
  interval: number = 1000;

  _refresher: (names: string[]) => void;
  _watchId: any;

  constructor(refresh: (names: string[]) => void) {
    this.active = {};
    this._refresher = refresh;
  }

  get names() {
    return Object.keys(this.active);
  }

  add(name: string) {
    this.active[name] = Date.now();
    this._watch();
    this._refresher(this.names);
  }

  remove(name: string) {
    delete this.active[name];

    if (Object.keys(this.active).length === 0) {
      this.unwatch();
    }

    this._refresher(this.names);
  }

  unwatch() {
    if (this._watchId) {
      clearInterval(this._watchId);
      delete this._watchId;
    }
  }

  _watch() {
    if (this._watchId) return;

    this._watchId = setInterval(() => {
      let now = Date.now();
      let needsRefresh = false;

      for (let name of Object.keys(this.active)) {
        let deadline = this.active[name] + this.interval;

        console.log(this.active, this.interval, name, deadline, now);
        if (deadline < now) {
          delete this.active[name];
          needsRefresh = true;
        }
      }

      if (Object.keys(this.active).length === 0) {
        this.unwatch();
      }

      if (needsRefresh) {
        this._refresher(this.names);
      }
    }, this.interval);
  }
}

const TypingIndicator = (props: { names: Array<string> }) => {
  let names = props.names;

  if (names.length === 0) return null;

  let prefix;

  if (names.length > 1) {
    prefix = `${names.length} folks are`;
  } else {
    prefix = `${names[0]} is`;
  }

  return (
    <div className="px-2 text-xs text-gray-400">{`${prefix} typing...`}</div>
  );
};

export function Chat({ username }: { username: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typings, setTypings] = useState<string[]>([]);

  const cable = useMemo(() => createCable(), []);
  const channelRef = useRef<{ channel: Channel | null }>({ channel: null });
  const messagesRef = useRef<Message[]>([]);

  const typingSet = useMemo(
    () => new TypingSet((names: string[]) => setTypings(names)),
    []
  );

  useEffect(() => {
    messagesRef.current = messages; // Update the ref on each render
  }, [messages]);

  useEffect(() => {
    let channel = cable.streamFrom('stackblitz-demo');
    channelRef.current.channel = channel;

    channel.on('message', (payload: any) => {
      console.log('New message:', payload);
      if (payload.event === 'message') {
        let messages = messagesRef.current;

        const newMessage = payload.message as Message;
        // Clear typing info
        typingSet.remove(newMessage.username);

        if (!messages.find((message) => message.id === newMessage.id)) {
          setMessages([...messages, newMessage]);
        }
      }

      if (payload.event === 'typing') {
        typingSet.add(payload.username);
      }
    });

    return () => {
      channel.disconnect();
    };
  }, [cable]);

  return (
    <div className="relative flex min-h-screen w-full flex-col gap-3">
      <div className="flex-1">
        <MessageList messages={messages} user={username} />
      </div>
      <div className="sticky bottom-0 -mx-2 py-2 pb-10">
        <TypingIndicator names={typings} />
        <div className="px-2">
          <NewMessageForm
            createMessage={(body: string) => {
              const msg = { id: nanoid(), body: body, username };
              setMessages([...messages, msg]);
              autoScroll(document.documentElement);
              createMessage(msg);
            }}
            onTyping={async () => {
              let chan = channelRef.current.channel;
              if (chan) {
                await chan.whisper({ event: 'typing', username });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
