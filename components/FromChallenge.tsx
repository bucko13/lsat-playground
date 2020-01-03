import * as React from 'react'
import {
  Grid,
  Button,
  Header,
  Form,
  TextArea,
  Segment,
  Message,
} from 'semantic-ui-react'
import { Lsat } from 'lsat-js'
import SyntaxHighlighter from 'react-syntax-highlighter'

type Props = {
  signingKey: string
}

const codeSnippet = (challenge?: string): string => {
  return `
import {Lsat} from 'lsat-js'

// challenge must be a base64 encodedstring
const lsat = Lsat.fromChallenge(challenge)

// Lsat.fromHeader(header) accomplishes the same thing
// for a challenge with the "LSAT" prefix, which describes
// the _type_ of challenge WWW-Authenticate challenge
lsat.toJSON()
${challenge &&
  !!challenge.length &&
  JSON.stringify(Lsat.fromChallenge(challenge).toJSON(), null, 2)}
`
}

const FromChallenge: React.FunctionComponent<Props> = ({ signingKey }) => {
  const [token, setToken] = React.useState('')
  const [challenge, setChallenge] = React.useState('')
  const [error, setError] = React.useState('')

  function handleChange(e: React.FormEvent<HTMLTextAreaElement>) {
    e.preventDefault()
    try {
      Lsat.fromChallenge(e.currentTarget.value)
      setChallenge(e.currentTarget.value)
    } catch (e) {}
  }

  function createLsatFromChallenge(challenge: string): void {
    let lsat
    if (!signingKey.length) {
      setError(
        'Missing signing key. Please set at top of page before continuing'
      )
      return
    } else if (!challenge.length) {
      setError(
        'Missing payment request. Please provide BOLT11 invoice string before continuing'
      )
      return
    }

    try {
      if (challenge.indexOf('LSAT ') > -1) lsat = Lsat.fromHeader(challenge)
      else lsat = Lsat.fromChallenge(challenge)
    } catch (e) {
      console.error('Problem generating lsat from challenge:', e.message)
      setError(e.message)
      return
    }

    setError('')

    setToken(lsat.toToken())
  }

  return (
    <Grid>
      <Grid.Row>
        <Header as="h3">
          Generate LSAT from Challenge
          <Header.Subheader>
            A challenge is returned in a 402 Response's WWWW-Authenticate
            header. It includes the macaroon and invoice to be paid, encoded
            with base64
          </Header.Subheader>
        </Header>
      </Grid.Row>

      <Grid.Row columns={2}>
        <Grid.Column>
          <Header as="h4">Enter WWW-Authenticate LSAT Challenge</Header>
          <Form error={!!error.length}>
            <TextArea
              placeholder="Paste challenge here..."
              onChange={handleChange}
            />
            {!!error.length && (
              <Message
                style={{ overflowWrap: 'break-word' }}
                error
                header="Could not generate LSAT"
                content={error}
              />
            )}
          </Form>
          <Button
            onClick={() => createLsatFromChallenge(challenge)}
            style={{ margin: '1rem 0' }}
          >
            Get LSAT
          </Button>
          {!!token.length && (
            <React.Fragment>
              <Grid.Row columns={2}>
                <Grid.Column>
                  <Header as="h4">
                    LSAT Token
                    <Header.Subheader>
                      The value that gets sent in the "Authorize" http request
                      header to prove authentication
                    </Header.Subheader>
                  </Header>
                  <Segment style={{ overflowWrap: 'break-word' }}>
                    {token}
                  </Segment>
                </Grid.Column>
              </Grid.Row>
            </React.Fragment>
          )}
        </Grid.Column>
        <Grid.Column>
          <Header as="h4">Code Snippet</Header>
          <SyntaxHighlighter language="javascript">
            {codeSnippet(challenge)}
          </SyntaxHighlighter>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default FromChallenge
