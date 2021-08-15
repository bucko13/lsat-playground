# LSAT Playground

This is a client-side webapp that demonstrates all the tools available in lsat-js.
LSAT Playground includes code snippets and gives you a place to interact with LSATs without having to write a single
line of code. It even provides a live demo where you can pay using a testnet node to get timed access to an API protected with Boltwall.

## Setup

Simply install the dependencies and then deploy.

```
$ yarn
$ yarn dev
```

The above command will deploy a local instance of the playground.

There are a few configuration variables that can be set at runtime if you want to use
your own custom Boltwall configurations:

```
// host where boltwall api is, e.g. 'https://safron-city.vercel.app/'
NEXT_PUBLIC_BOLTWALL_HOST
// sats per second that the endpoint charges
NEXT_PUBLIC_BOLTWALL_RATE
// minimum number of seconds you will allow for purchase
NEXT_PUBLIC_MIN_TIME
```

To set these values to use in the demo, set the next.js environment variables. Learn more about [environment variables in nextjs](https://nextjs.org/docs/basic-features/environment-variables).

## Deploy live site
