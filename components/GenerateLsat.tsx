import * as React from 'react'
import {
  Grid,
  Button,
  Header,
  Form,
  TextArea,
  Container,
  Segment,
  Message,
} from 'semantic-ui-react'
import { MacaroonsBuilder } from 'macaroons.js'
import { Lsat, Identifier } from 'lsat-js'
import { decode } from 'bolt11'
import SyntaxHighlighter from 'react-syntax-highlighter'

type Props = {
  signingKey: string
}

const codeSnippet = (lsat?: string, payreq?: string): string => {
  return `import {Identifier, Lsat} from 'lsat-js'
// can use any macaroon utility as long it follows lib-macaroon standard
import { MacaroonsBuilder } from 'macaroons.js'

const identifier = new Identifier({
  paymentHash: Buffer.from(paymentHash, 'hex'),
})
const builder = new MacaroonsBuilder(
  window.location.origin,
  signingKey,
  identifier.toString()
)
const lsat = Lsat.fromMacaroon(macaroon.serialize(), payreq)
lsat.toJSON()
${lsat && JSON.stringify(Lsat.fromToken(lsat, payreq).toJSON(), null, 2)}
`
}
const GenerateLsat: React.FunctionComponent<Props> = ({ signingKey }) => {
  const [token, setToken] = React.useState('')
  const [challenge, setChallenge] = React.useState('')
  const [payreq, setPayreq] = React.useState('')
  const [error, setError] = React.useState('')

  function handleChange(e: React.FormEvent<HTMLTextAreaElement>) {
    e.preventDefault()
    setPayreq(e.currentTarget.value)
  }

  function createLsatFromInvoice(payreq: string): void {
    let invoice
    if (!signingKey.length) {
      setError(
        'Missing signing key. Please set at top of page before continuing'
      )
      return
    } else if (!payreq.length) {
      setError(
        'Missing payment request. Please provide BOLT11 invoice string before continuing'
      )
      return
    }

    try {
      invoice = decode(payreq)
    } catch (e) {
      console.error(e.message)
      setError(e.message)
      return
    }

    setError('')

    const tag = invoice.tags.find(tag => tag.tagName === 'payment_hash')

    if (!tag) {
      console.error(
        'Invalid BOLT11 payment request. Unable to retrieve payment hash.'
      )
      return
    }
    let paymentHash: string = tag.data.toString()

    const identifier = new Identifier({
      paymentHash: Buffer.from(paymentHash, 'hex'),
    })

    const builder = new MacaroonsBuilder(
      window.location.origin,
      signingKey,
      identifier.toString()
    )

    const macaroon = builder.getMacaroon()
    const lsat = Lsat.fromMacaroon(macaroon.serialize(), payreq)
    setToken(lsat.toToken())
    setChallenge(lsat.toChallenge())
  }

  return (
    <Grid>
      <Grid.Row>
        <Header as="h3">
          Generate LSAT from Invoice
          <Header.Subheader>
            Enter a valid lightning invoice in the textbox below to generate a
            new LSAT.
          </Header.Subheader>
        </Header>
        <Container textAlign="left">
          Since macaroon generation depends on the actual application, we will
          generate our own base-macaroon to use to generate the LSAT. This
          requires a signing key, so make sure one has been set above first.
        </Container>
      </Grid.Row>

      <Grid.Row columns={2}>
        <Grid.Column>
          <Header as="h4">Enter BOLT11 Invoice</Header>
          <Form error={!!error.length}>
            <TextArea placeholder="lntb10u1..." onChange={handleChange} />
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
            onClick={() => createLsatFromInvoice(payreq)}
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
                  <Header as="h4">
                    WWW-Authenticate Header (LSAT Challenge)
                    <Header.Subheader>
                      The value that is sent in a 402 Response requiring payment
                    </Header.Subheader>
                  </Header>
                  <Segment style={{ overflowWrap: 'break-word' }}>
                    {challenge}
                  </Segment>
                </Grid.Column>
                <Grid.Column></Grid.Column>
              </Grid.Row>
            </React.Fragment>
          )}
        </Grid.Column>
        <Grid.Column>
          <Header as="h4">Code Snippet</Header>
          <SyntaxHighlighter language="javascript">
            {codeSnippet(token, payreq)}
          </SyntaxHighlighter>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default GenerateLsat
