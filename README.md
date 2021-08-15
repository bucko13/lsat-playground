# LSAT Playground

This is a client-side webapp that demonstrates all the tools available in lsat-js.
LSAT Playground includes code snippets and gives you a place to interact with LSATs without having to write a single
line of code. It even provides a live demo where you can pay using a live lightning node to get timed access to an API protected with Boltwall.

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
// the network your demo node is on (mainnet or testnet)
NEXT_PUBLIC_NETWORK
```

To set these values to use in the demo, set the next.js environment variables. Learn more about [environment variables in nextjs](https://nextjs.org/docs/basic-features/environment-variables).
default values can be found in the /components/constants.ts file.

## Deploy live site

Because the playground is built with Next.js, deploying a site live is almost effortless.
If you connect your GitHub and the forked repo to your [vercel](https://vercel.com) account,
then as soon as you push to GitHub, your site will be accessible (make sure to set env vars
appropriately). You can also use the [vercel cli](https://vercel.com/cli) to deploy directly
from your computer.

Vercel also supports different deployments for different branches and setting different environment
variables for different deployments.

## Deploy your own custom boltwall

You can easily run your own boltwall instances also using vercel via the `now-boltwall`
command line utility. Learn more about it [here](https://github.com/Tierion/now-boltwall)
or install it by running `npm i -g now-boltwall`.
