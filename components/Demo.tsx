import * as React from 'react'
import {
  Grid,
  Header,
  Button,
  Image,
  Segment,
  Input,
  Icon,
} from 'semantic-ui-react'
import { Lsat } from 'lsat-js'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { requestProvider, WebLNProvider } from 'webln'

const { useState, useEffect } = React

const endpoint = 'https://playground.bucko.now.sh/api/protected'

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

  let webLn: WebLNProvider

  function reset() {
    setInvoice('')
    setChallenge('')
    setPreimage('')
    setPokemon(initialPokemon)
  }

  useEffect(() => {
    if (!webLn) {
      requestProvider()
        .then(provider => {
          webLn = provider
          setHasWebLn(true)
          return webLn.getInfo()
        })
        .then(info => console.log('Connected with node:', info.node.pubkey))
        .catch(e => console.error(e))
    }
  }, [invoice])

  async function payInvoice() {
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

      const response = await fetch(`${endpoint}/pokemon/${id}`, options)
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
      console.log('got error:', e)
    }

    setPokeLoading(false)
  }

  async function getNode() {
    setNodeLoading(true)
    try {
      const response = await fetch(`${endpoint}/api/node`)
      const nodeData = await response.json()
      setNode(nodeData)
    } catch (e) {}
    setNodeLoading(false)
  }

  // set invoice if the challenge gets set
  useEffect(() => {
    if (challenge.length) {
      const lsat = Lsat.fromChallenge(challenge)
      setInvoice(lsat.invoice)
    }
  }, [challenge])

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
            you 30 seconds of access{' '}
            <span style={{ fontStyle: 'italic' }}>
              from the time of LSAT generation
            </span>{' '}
            (not payment). Use the data derived from the response and displayed
            in the right column in the playground to check validity.
          </p>
          {!!invoice.length && (
            <React.Fragment>
              <Grid.Column>
                {!!node.uris.length && (
                  <Segment style={{ overflowWrap: 'break-word' }}>
                    <Header as="h4">Connect to our node:</Header>
                    {node?.uris[0]}
                  </Segment>
                )}
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
      <Grid.Row columns={2}>
        <Grid.Column>
          <Button onClick={getPokemon} loading={pokemonLoading} primary>
            Get Pokemon
          </Button>
          <Button onClick={getNode} loading={nodeLoading}>
            Get Node
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
