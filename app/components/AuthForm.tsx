export function AuthForm({ action }: { action: (form: FormData) => unknown }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        action(new FormData(e.target as any));
      }}
    >
      <div className="flex rounded-md shadow-sm">
        <label htmlFor="username" className="sr-only">
          Your username
        </label>
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <input
            id="username"
            name="username"
            required
            placeholder="jack.sparrow"
            className="block w-full rounded-none rounded-l-md border-0  px-2.5 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300   placeholder:text-gray-400 sm:text-sm sm:leading-6"
          />
        </div>
        <button
          type="submit"
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 enabled:hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-200"
        >
          Enter
        </button>
      </div>
    </form>
  );
}
