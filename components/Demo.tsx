import * as React from 'react'
import {
  Grid,
  Header,
  Button,
  Image,
  Segment,
  Input,
  Icon,
  Message,
} from 'semantic-ui-react'
import { Lsat } from 'lsat-js'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { requestProvider, WebLNProvider } from 'webln'
import { BOLTWALL_CONFIGS } from './constants'

const { useState, useEffect } = React

const endpoint = BOLTWALL_CONFIGS.BOLTWALL_HOST

const Demo = () => {
  const initialPokemon = { name: '', image: '', type: '' }
  const [count, setCount] = useState(0)
  const [pokemon, setPokemon] = useState(initialPokemon)
  const [node, setNode] = useState({ uris: [] })
  const [hasWebLn, setHasWebLn] = useState(false)
  const [pokemonLoading, setPokeLoading] = useState(false)
  const [nodeLoading, setNodeLoading] = useState(false)
  const [challenge, setChallenge] = useState('')
  const [invoice, setInvoice] = useState('')
  const [preimage, setPreimage] = useState('')
  const [token, setToken] = useState('')
  const [expiration, setExpiration] = useState(0)
  const [timer, setTimer] = useState(0)
  const [nodeError, setNodeError] = useState('')
  const [timeToPurchase, setTimeToPurchase] = useState(
    BOLTWALL_CONFIGS.BOLTWALL_MIN_TIME
  )

  let webLn: WebLNProvider

  function reset() {
    setInvoice('')
    setChallenge('')
    setPreimage('')
    setPokemon(initialPokemon)
  }

  function resetNode() {
    setNode({ uris: [] })
  }

  function getTimeLeft() {
    const difference = +expiration - +new Date()
    return Math.floor(difference / 1000) - 2 // with buffer
  }

  function getWebLn() {
    if (!webLn) {
      setHasWebLn(false)
      return requestProvider()
        .then(provider => {
          webLn = provider
          setHasWebLn(true)
          return webLn.getInfo()
        })
        .then(info => console.log('Connected with node:', info.node.pubkey))
        .catch(e => console.error(e))
    }
  }

  useEffect(() => {
    getWebLn()
  }, [invoice])

  async function payInvoice() {
    // sometimes webLn resets and we need to set it again
    if (!webLn && hasWebLn) await getWebLn()
    if (hasWebLn && webLn) {
      webLn
        .sendPayment(invoice)
        .then(response => setPreimage(response.preimage))
        .catch(e => console.error('Problem paying invoice:', e))
    }
  }

  async function getPokemon() {
    let id = 25 // pikachu
    if (pokemon.name.length) id = Math.floor(Math.random() * (806 - 1)) + 1
    setPokeLoading(true)
    if (node?.uris?.length) resetNode()
    try {
      let options = {}
      const headers = new Headers({
        'Content-Type': 'application/json',
      })
      if (token.length) headers.append('Authorization', token)
      options = {
        headers,
        cache: 'no-cache',
      }

      const response = await fetch(
        `${endpoint}api/protected/${id}?amount=${(timeToPurchase + 2) * // setting a buffer since it takes some time to load
          BOLTWALL_CONFIGS.BOLTWALL_RATE}`,
        options
      )
      const data = await response.json()

      if (response.status === 402) {
        const lsatChallenge = response.headers.get('www-authenticate')
        if (lsatChallenge) setChallenge(lsatChallenge)
        else throw new Error('No LSAT Challenge in response from server')
      } else if (response.status === 401) {
        // this likely means that the lsat has expired and we need a new one
        reset()
      } else if (data.sprites) {
        setPokemon({
          image: data.sprites.front_default,
          name: data.name,
          type: data.types[0].type.name,
        })
        setCount(count + 1)
      } else {
        console.error('There was a problem getting sprite from request')
      }
    } catch (e) {
      console.log('Error communicating with boltwall: ', e)
    }

    setPokeLoading(false)
  }

  async function getNode() {
    setNodeLoading(true)
    setNodeError('')
    try {
      const response = await fetch(`${endpoint}api/node`)
      const nodeData = await response.json()
      setNode(nodeData)
    } catch (e) {
      setNodeError(
        'Could not connect to the connect node. Please try again later.'
      )
      console.error('Problem connecting to node', e.message)
    } finally {
      setNodeLoading(false)
    }
  }

  // set invoice if the challenge gets set
  useEffect(() => {
    if (challenge.length) {
      const lsat = Lsat.fromChallenge(challenge)
      setInvoice(lsat.invoice)
      setExpiration(lsat.validUntil)
    }
  }, [challenge])

  // set initial timer when expiration is updated
  useEffect(() => {
    if (expiration > 0 && expiration > Date.now()) setTimer(getTimeLeft())
  }, [expiration])

  // tick timer down every 1000 milliseconds
  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => setTimer(getTimeLeft()), 1000)
    } else {
      reset()
    }
  }, [timer])

  // try and set the token when preimage gets set
  useEffect(() => {
    if (!preimage.length) return
    try {
      const lsat = Lsat.fromChallenge(challenge)
      lsat.setPreimage(preimage)
      setToken(lsat.toToken())
    } catch (e) {}
  }, [preimage])

  // reset Preimage if the invoice changes
  useEffect(() => {
    setPreimage('')
    setToken('')
  }, [invoice])

  function handlePreimageChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    setPreimage(e.target.value)
  }

  return (
    <Grid centered columns={1}>
      <Grid.Row>
        <Grid.Column>
          <Header as="h3">
            Live Demo
            <Header.Subheader>
              <div>
                Try out LSATs in a live demo by hitting an endpoint protected by{' '}
                <a href="https://github.com/Tierion/boltwall" target="__blank">
                  Boltwall
                </a>
                .
              </div>
              <div>
                Use the{' '}
                <a href="https://lightningjoule.com/" target="__blank">
                  Lightning Joule
                </a>{' '}
                extension (or any other{' '}
                <a href="https://webln.dev/#/" target="__blank">
                  WebLN
                </a>{' '}
                enabled browser wallet) for the best LSAT payment experience.
              </div>
            </Header.Subheader>
          </Header>
          <p>
            The LSATs generated here have an expiration caveat attached, giving
            you timed access (with some buffer){' '}
            <span style={{ fontStyle: 'italic' }}>
              from the time of LSAT generation
            </span>{' '}
            (not payment). Use the data derived from the response and displayed
            in the right column in the playground to check validity.
          </p>
          <Grid.Row>
            <Message info style={{ textAlign: 'center' }}>
              ⚡️⚡️ This demo is built using a{' '}
              {BOLTWALL_CONFIGS.NETWORK.toUpperCase()} node. Please interact
              with it accordingly. ⚡️⚡️
            </Message>
          </Grid.Row>
          {!!node?.uris?.length && (
            <Segment style={{ overflowWrap: 'break-word' }}>
              <Header as="h4">Connect to our node:</Header>
              {node?.uris[0]}
            </Segment>
          )}
          {!!nodeError.length && (
            <Message negative hidden={!nodeError?.length}>
              {nodeError}
            </Message>
          )}
          {!!invoice.length && (
            <React.Fragment>
              <Grid.Column>
                <Input
                  action={
                    <React.Fragment>
                      <CopyToClipboard text={invoice}>
                        <Button icon labelPosition="right" color="green">
                          Copy
                          <Icon name="copy" />
                        </Button>
                      </CopyToClipboard>
                      {hasWebLn && (
                        <Button
                          icon
                          labelPosition="right"
                          color="yellow"
                          onClick={payInvoice}
                          title="Use webln enabled browser extension like Lightning Joule to pay directly from your browser"
                        >
                          {' '}
                          Pay
                          <Icon name="lightning" />
                        </Button>
                      )}
                    </React.Fragment>
                  }
                  value={invoice}
                  fluid
                  style={{ textOverflow: 'ellipsis', marginBottom: '1rem' }}
                />
              </Grid.Column>
              <Grid.Column>
                <Input
                  placeholder="Preimage..."
                  value={preimage}
                  fluid
                  onChange={handlePreimageChange}
                />
              </Grid.Column>
            </React.Fragment>
          )}
        </Grid.Column>
      </Grid.Row>
      {!invoice?.length && (
        <Grid.Row>
          <Grid.Column floated="left">
            <Input
              type="number"
              label={{ content: 'seconds' }}
              labelPosition="right"
              value={timeToPurchase}
              min={BOLTWALL_CONFIGS.BOLTWALL_MIN_TIME}
              onChange={e => setTimeToPurchase(+e.currentTarget.value)}
            />
          </Grid.Column>
        </Grid.Row>
      )}
      <Grid.Row columns={2}>
        <Grid.Column>
          {!!invoice.length && (
            <Segment raised>Expires in: {timer} seconds</Segment>
          )}
          <Button
            onClick={getPokemon}
            loading={pokemonLoading}
            primary
            disabled={timer > 0 && !!invoice?.length && preimage?.length < 64}
          >
            {!!invoice.length ? 'Get Pokemon' : 'Get Invoice'}
          </Button>
          <Button onClick={getNode} loading={nodeLoading}>
            Get Node Info
          </Button>
          {!!pokemon.name.length && (
            <React.Fragment>
              <Segment stacked>
                <div style={{ textTransform: 'capitalize' }}>
                  Pokemon: {pokemon.name.toUpperCase()}
                </div>
                <div style={{ textTransform: 'capitalize' }}>
                  Type: {pokemon.type}
                </div>
                {!!pokemon.image.length && <Image src={pokemon.image}></Image>}
              </Segment>
            </React.Fragment>
          )}
        </Grid.Column>
        <Grid.Column>
          <React.Fragment>
            <Header as="h4">
              LSAT Challenge
              <Header.Subheader>
                This is in the www-authenticate header that was returned by the
                server with a 402 response
              </Header.Subheader>
            </Header>
            <Segment style={{ overflowWrap: 'break-word' }}>
              {challenge}
            </Segment>
            <Header as="h4">
              LSAT Token
              <Header.Subheader>
                The token to be sent back in the Authorization request header.
                This will be sent automatically when making the request but is
                shown here for reference.
              </Header.Subheader>
            </Header>
            <Segment style={{ overflowWrap: 'break-word' }}>
              {challenge.length
                ? token.length
                  ? token
                  : 'Enter valid preimage to generate full LSAT'
                : ''}
            </Segment>
          </React.Fragment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default Demo
