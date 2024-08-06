## Next.js vs. AnyCable pub/sub

A minimal messaging Next.js app demonstrating [AnyCable](https://anycable.io) v1.5 pub/sub features.

Learn more in the [documentation](https://docs.anycable.io/edge/anycable-go/signed_streams).

> See this project on [StackBlitz](https://stackblitz.com/edit/anycable-pubsub).

### Running locally

To run the project locally, you must install and run AnyCable server:

```sh
npm install @anycable/anycable-go
npx anycable-go --public --presets=broker
```

**NOTE**: Using `--public` flag is important for this example (we don't have any authentication/authorization logic here).
