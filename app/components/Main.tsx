import { Chat } from './Chat';
import { AuthForm } from './AuthForm';

import { useState } from 'react';

export function Main() {
  const [username, setUsername] = useState('');

  if (!username) {
    return (
      <main className="mx-auto flex flex-col items-center w-screen">
        <div className="grid h-screen items-center">
          <div className="-mt-12 flex max-w-xs flex-col">
            <div className="my-4">
              <h1 className="mb-4 text-center text-2xl font-semibold text-balance">
                Please, name yourself!
              </h1>
            </div>
            <AuthForm
              action={(form: FormData) => {
                const username = form.get('username');
                if (
                  typeof username === 'string' &&
                  username.trim().length > 0
                ) {
                  setUsername(username.trim());
                }
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-24">
      <Chat username={username} />
    </main>
  );
}
