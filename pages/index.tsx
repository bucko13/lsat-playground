import * as React from 'react'
import { Container, Divider, Header, Icon, Segment } from 'semantic-ui-react'
import { NextPage } from 'next'
import Head from 'next/head'
import {
  GenerateKey,
  GenerateLsat,
  FromChallenge,
  SatisfyLsat,
  Navbar,
  PlaygroundSegment,
} from '../components'

const IndexPage: NextPage = () => {
  const [signingKey, setKey] = React.useState('')

  const playgroundSegments = [
    {
      id: 'from-invoice',
      name: 'From Invoice',
      children: <GenerateLsat signingKey={signingKey} />,
    },
    {
      id: 'from-challenge',
      name: 'From Challenge',
      children: <FromChallenge signingKey={signingKey} />,
    },
    {
      id: 'satisfy',
      name: 'Satisfy',
      children: <SatisfyLsat />,
    },
  ]

  return (
    <div>
      <Head>
        <title>LSAT Playground</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link
          rel="stylesheet"
          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.11/semantic.min.css"
        />
      </Head>
      <Navbar navItems={playgroundSegments} />
      <Container>
        <Segment basic>
          <Header as="h2" icon textAlign="center">
            <Icon name="lab" />
            LSAT Playground
            <Header.Subheader>
              Learn how{' '}
              <span style={{ fontWeight: 'bold' }}>
                Lightning Service Authentication Tokens
              </span>{' '}
              (LSATs) work using the{' '}
              <a href="https://www.npmjs.com/package/lsat-js" target="_blank">
                lsat-js
              </a>{' '}
              library.
            </Header.Subheader>
          </Header>
        </Segment>
        <Divider />
        <Segment basic>
          <GenerateKey signingKey={signingKey} setKey={setKey} />
        </Segment>
        <Divider />
        {playgroundSegments.map((segment, index) => (
          <PlaygroundSegment
            key={index}
            id={segment.id}
            children={segment.children}
          />
        ))}
      </Container>
    </div>
  )
}

export default IndexPage
