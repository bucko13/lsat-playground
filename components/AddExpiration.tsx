import * as React from 'react'
import {
  Input,
  Header,
  Grid,
  TextArea,
  Form,
  Message,
  Segment,
  Button,
} from 'semantic-ui-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { Lsat, Caveat } from 'lsat-js'

const codeSnippet = (token: string, expiration: number): string => {
  let snippet = `import {Lsat, Caveat} from 'lsat-js'

const lsat = Lsat.fromToken(token)
`
  if (expiration) {
    snippet += `const caveat = new Caveat({ 
  condition: 'expiration', 
  // add amount of time to "Date.now()"
  value: ${Date.now() + expiration} 
})
lsat.addFirstPartyCaveat(caveat)
`
  }
  if (token) {
    snippet += `lsat.toJSON() \n`
    snippet += JSON.stringify(Lsat.fromToken(token).toJSON(), null, 2)
  }

  return snippet
}

const AddExpiration: React.FunctionComponent = () => {
  const [expiration, setExpiration] = React.useState(0)
  const [token, setToken] = React.useState('')
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState(false)

  function handleTokenChange(e: React.FormEvent<HTMLTextAreaElement>) {
    if (!e.currentTarget.value.length) {
      setError('')
      return
    }
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

  function handleExpirationChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    setSuccess(false)
    setError('')
    setExpiration(Number(e.currentTarget.value))
  }

  function addCaveat() {
    setError('')
    if (!token.length) {
      setError('Missing LSAT')
      return
    } else if (!expiration) {
      setError(
        'Missing expiration or expiration value of 0 would make the lsat invalid'
      )
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

    const caveat = new Caveat({
      condition: 'expiration',
      value: Date.now() + expiration * 1000,
    })

    try {
      lsat.addFirstPartyCaveat(caveat)
    } catch (e) {
      console.error('Problem adding caveat to base macaroon:', e.message)
      setError(e.message)
      return
    }
    setToken(lsat.toToken())
    setSuccess(true)
  }

  function getExpiration(expiration: number) {
    return new Date(Date.now() + expiration * 1000).toString()
  }
  return (
    <Grid>
      <Grid.Row>
        <Header as="h3">
          Add Expiration
          <Header.Subheader>
            This will demonstrate how to add new first-party caveats onto an
            LSAT's macaroon.
          </Header.Subheader>
        </Header>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <Header as="h4">Enter LSAT and Expiration to Set</Header>
          <Form error={!!error.length}>
            <TextArea
              placeholder="Paste token here..."
              onChange={handleTokenChange}
            />
            <Input
              placeholder="Enter secret/preimage here..."
              style={{
                margin: '1rem 0',
              }}
              type="number"
              min="0"
              onChange={handleExpirationChange}
              value={expiration}
            />
            {!!error.length && (
              <Message
                style={{
                  overflowWrap: 'break-word',
                }}
                error
                header="Problem adding LSAT secret"
                content={error}
              />
            )}
          </Form>
          <Button
            onClick={addCaveat}
            style={{
              margin: '1rem 0',
            }}
          >
            Set Expiration
          </Button>
          {success && (
            <React.Fragment>
              <Segment color="green">
                Success! Your LSAT will expire at:
                <p>{getExpiration(expiration)}</p>
              </Segment>

              <Grid.Row columns={2}>
                <Grid.Column>
                  <Header as="h4">
                    Updated LSAT
                    <Header.Subheader>
                      (With expiration caveat)
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
            {codeSnippet(token, expiration)}
          </SyntaxHighlighter>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default AddExpiration
