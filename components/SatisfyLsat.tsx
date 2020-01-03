import * as React from 'react'
import {
  Grid,
  Button,
  Header,
  Form,
  TextArea,
  Message,
  Input,
  Segment,
} from 'semantic-ui-react'
import { Lsat } from 'lsat-js'
import SyntaxHighlighter from 'react-syntax-highlighter'

const codeSnippet = (token?: string): string => {
  let snippet = `
import {Lsat} from 'lsat-js'

const lsat = Lsat.fromToken(token)
// throws if the preimage is malformed or does not match
lsat.setPreimage(secret)
lsat.toJSON()`

  if (token) {
    snippet += JSON.stringify(Lsat.fromToken(token).toJSON(), null, 2)
  }

  return snippet
}

const SatisfyLsat: React.FunctionComponent = () => {
  const [token, setToken] = React.useState('')
  const [secret, setSecret] = React.useState('')
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState(false)

  function handleTokenChange(e: React.FormEvent<HTMLTextAreaElement>) {
    e.preventDefault()
    setSuccess(false)
    try {
      const token = e.currentTarget.value
      Lsat.fromToken(token)
      setToken(token)
      setError('')
    } catch (e) {
      console.error('Problem generating lsat from challenge:', e.message)
      setError(e.message)
    }
  }

  function handleSecretChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    setSuccess(false)
    setSecret(e.currentTarget.value)
  }

  function addSecret(): void {
    setError('')
    if (!token.length) {
      setError('Missing LSAT')
      return
    } else if (!secret.length) {
      setError('Missing secret')
      return
    }

    let lsat
    try {
      lsat = Lsat.fromToken(token)
    } catch (e) {
      console.error('Problem generating lsat from token:', e.message)
      setError(e.message)
      return
    }

    try {
      lsat.setPreimage(secret)
    } catch (e) {
      console.error('Problem setting preimage/secret on lsat', e.message)
      setError(e.message)
      return
    }

    setToken(lsat.toToken())
    setSuccess(true)
  }

  return (
    <Grid>
      <Grid.Row>
        <Header as="h3">
          Satisfy LSAT
          <Header.Subheader>
            In order for an LSAT to be satisfied, it must have a preimage that
            corresponds its paymentHash, serving as its proof of payment.
          </Header.Subheader>
        </Header>
      </Grid.Row>

      <Grid.Row columns={2}>
        <Grid.Column>
          <Header as="h4">Enter LSAT Token & Preimage</Header>
          <Form error={!!error.length}>
            <TextArea
              placeholder="Paste token here..."
              onChange={handleTokenChange}
            />
            <Input
              placeholder="Enter secret/preimage here..."
              onChange={handleSecretChange}
              fluid
            />
            {!!error.length && (
              <Message
                style={{ overflowWrap: 'break-word' }}
                error
                header="Problem adding LSAT secret"
                content={error}
              />
            )}
          </Form>

          {success ? (
            <Segment color="green">
              Success! That preimage matches LSAT's payment hash.
            </Segment>
          ) : (
            <Button onClick={() => addSecret()} style={{ margin: '1rem 0' }}>
              Set Preimage
            </Button>
          )}
        </Grid.Column>
        <Grid.Column>
          <Header as="h4">Code Snippet</Header>
          <SyntaxHighlighter language="javascript">
            {codeSnippet(token)}
          </SyntaxHighlighter>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default SatisfyLsat
