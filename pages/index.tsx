import * as React from 'react'
import {
  Container,
  Divider,
  Header,
  Icon,
  // Grid,
  Segment,
} from 'semantic-ui-react'
import { NextPage } from 'next'
import Head from 'next/head'
import { GenerateKey, GenerateLsat, FromChallenge } from '../components'

const IndexPage: NextPage = () => {
  const [signingKey, setKey] = React.useState('')

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
        <Segment basic>
          <GenerateLsat signingKey={signingKey} />
        </Segment>
        <Divider />
        <Segment basic>
          <FromChallenge signingKey={signingKey} />
        </Segment>
        <Divider />
      </Container>
    </div>
  )
}

export default IndexPage
