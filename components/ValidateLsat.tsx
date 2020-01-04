import * as React from 'react'
import {
  Grid,
  Icon,
  Header,
  Form,
  TextArea,
  Message,
  Input,
  Segment,
  Container,
} from 'semantic-ui-react'
import { Lsat, expirationSatisfier, verifyFirstPartyMacaroon } from 'lsat-js'
import SyntaxHighlighter from 'react-syntax-highlighter'

const { useState } = React
const codeSnippet = (token?: string): string => {
  let snippet = `import {Lsat} from 'lsat-js'

const lsat = Lsat.fromToken(token)
// throws if the preimage is malformed or does not match
lsat.setPreimage(secret)
lsat.toJSON()`

  if (token) {
    snippet += JSON.stringify(Lsat.fromToken(token).toJSON(), null, 2)
  }

  return snippet
}

type Props = {
  signingKey: string
}
const ValidateLsat: React.FunctionComponent<Props> = ({ signingKey }) => {
  const [token, setToken] = useState('')
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  // validators
  const [validExpiration, setValidExpiration] = useState(false)
  const [validPreimage, setValidPreimage] = useState(false)
  const [validMacaroon, setValidMacaroon] = useState(false)
  const [validLSAT, setValidLSAT] = useState(false)
  const [expirationMessage, setExpirationMessage] = useState('')
  const [preimageMessage, setPreimageMessage] = useState('')

  function resetState() {
    setValidExpiration(false)
    setValidPreimage(false)
    setValidMacaroon(false)
    setValidLSAT(false)
    setExpirationMessage('')
    setPreimageMessage('')
    setError('')
  }

  function handleTokenChange(e: React.FormEvent<HTMLTextAreaElement>) {
    resetState()
    setToken('')
    if (!e.currentTarget.value.length) {
      return
    }

    try {
      Lsat.fromToken(e.currentTarget.value)
      setToken(e.currentTarget.value)
    } catch (e) {
      setError(`Problem reading LSAT: ${e.message}`)
    }
  }

  function handleKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    setKey(e.currentTarget.value)
  }

  // if key or token change, run validation
  React.useEffect(validateLsat, [token, key])

  // update lsat validity if other checks change
  React.useEffect(() => {
    if (validExpiration && validMacaroon && validPreimage) setValidLSAT(true)
    else setValidLSAT(false)
  }, [validExpiration, validMacaroon, validPreimage])

  function getIcon(check: boolean) {
    if (check) return <Icon name="check circle" color="green" size="large" />
    return <Icon name="exclamation circle" color="red" size="large" />
  }

  function validateLsat() {
    let expiration, lsat

    if (!token.length) {
      return
    }

    try {
      lsat = Lsat.fromToken(token)
    } catch (e) {
      resetState()
      setError(`Problem generating LSAT from token: ${e.message}`)
      return
    }

    // check expiration
    try {
      expiration = lsat.getExpirationFromMacaroon()
      if (!expiration) {
        setExpirationMessage(
          `No expiration caveat found on macaroon. LSAT assumed always valid.`
        )
        setValidExpiration(true)
      } else if (expiration > Date.now()) {
        setExpirationMessage(`Expires at: ${new Date(expiration).toString()}`)
        setValidExpiration(true)
      } else {
        setValidExpiration(false)
        setExpirationMessage(`Expired at: ${new Date(expiration).toString()}`)
      }
    } catch (e) {
      setError(`Problem extracting expiration from LSAT: ${e.message}`)
      return
    }

    // test preimage validity
    try {
      if (lsat.isPending()) {
        setPreimageMessage('No preimage found. LSAT is still pending.')
        setValidPreimage(false)
      } else if (!lsat.isSatisfied()) {
        setPreimageMessage('Preimage does not satisfy payment hash')
        setValidPreimage(false)
      } else {
        setValidPreimage(true)
      }
    } catch (e) {
      setError(`Could not validate preimage: ${e.message}`)
    }

    // test macaroon validity (using signing key)
    try {
      const isValid = verifyFirstPartyMacaroon(
        lsat.baseMacaroon,
        key || signingKey,
        expirationSatisfier
      )
      setValidMacaroon(isValid)
    } catch (e) {
      console.error('Problem validating macaroon', e.message)
    }
  }

  return (
    <Grid>
      <Grid.Row>
        <Header as="h3">
          Verify LSAT
          <Header.Subheader>
            Run various checks against a given LSAT to determine its validity.
          </Header.Subheader>
        </Header>
        <Container textAlign="left">
          This tool will use the signing key set at the top of the page unless
          another is set belo. The key used to generate the original LSAT is{' '}
          <span style={{ fontStyle: 'italic' }}>required</span> for full
          validation. For LSAT's provided by an outside source's
          WWW-Authenticate header, this will not be possible since this only
          known by the macaroon "baker". You can, however, still check the
          preimage and any expiration caveats.
        </Container>
      </Grid.Row>

      <Grid.Row columns={2}>
        <Grid.Column>
          <Header as="h4">Enter LSAT & Secret</Header>
          <Form error={!!error.length}>
            <TextArea
              placeholder="Paste token here..."
              onChange={handleTokenChange}
            />
            <Input
              placeholder={
                signingKey.length
                  ? signingKey
                  : 'Enter key here or generate one at the top of the page'
              }
              style={{ margin: '1rem 0' }}
              onChange={handleKeyChange}
              fluid
            />
            {!!error.length && (
              <Message
                style={{ overflowWrap: 'break-word' }}
                error
                header="Problem parsing LSAT"
                content={error}
              />
            )}
          </Form>
          {!!token.length && !error.length && (
            <React.Fragment>
              <Header as="h4">LSAT Validation Checks:</Header>
              <Segment.Group stacked>
                <Segment color={validExpiration ? 'green' : 'red'}>
                  Expiration: {getIcon(validExpiration)}
                  {!!expirationMessage.length && (
                    <Message
                      style={{ overflowWrap: 'break-word' }}
                      error={Boolean(
                        expirationMessage.length && !validExpiration
                      )}
                      content={expirationMessage}
                    />
                  )}
                </Segment>
                <Segment color={validPreimage ? 'green' : 'red'}>
                  Preimage: {getIcon(validPreimage)}
                  {!!preimageMessage.length && (
                    <Message
                      style={{ overflowWrap: 'break-word' }}
                      error
                      content={preimageMessage}
                    />
                  )}
                </Segment>
                <Segment color={validMacaroon ? 'green' : 'red'}>
                  Macaroon Signature: {getIcon(validMacaroon)}
                  {!validMacaroon && (
                    <Message
                      style={{ overflowWrap: 'break-word' }}
                      error
                      content="Unable to validate macaroon. Make sure correct signing key is set and all caveats are satisfied."
                    />
                  )}
                </Segment>
                <Segment color={validLSAT ? 'green' : 'red'}>
                  LSAT: {getIcon(validLSAT)}
                  {!validLSAT && (
                    <Message
                      style={{ overflowWrap: 'break-word' }}
                      error
                      content="Not all checks passed. Cannot validate LSAT."
                    />
                  )}
                </Segment>
              </Segment.Group>
            </React.Fragment>
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

export default ValidateLsat
