import * as React from 'react'
import {
  Grid,
  Header,
  Form,
  TextArea,
  Message,
  List,
  Label,
  Input,
  Button,
} from 'semantic-ui-react'
import { Caveat, Lsat } from 'lsat-js'
import SyntaxHighlighter from 'react-syntax-highlighter'

type LabelProps = {
  rawCaveat: string
  key: string
}
const CaveatLabels: React.FunctionComponent<LabelProps> = ({ rawCaveat }) => {
  const caveat = Caveat.decode(rawCaveat)
  return (
    <List.Item>
      <Label color="blue">
        <i>{caveat.condition}</i>
      </Label>
      <Label color="grey">{caveat.comp}</Label>
      <Label color="green">
        <i>{caveat.value}</i>
      </Label>
    </List.Item>
  )
}

const CaveatList: React.FunctionComponent<{ rawCaveats: string[] }> = ({
  rawCaveats,
}) => {
  return (
    <List selection>
      {rawCaveats.map(caveat => (
        <CaveatLabels key={caveat} rawCaveat={caveat} />
      ))}
    </List>
  )
}

const codeSnippet = (macaroon?: string): string => {
  return `import {Lsat} from 'lsat-js'

const lsat = Lsat.fromMacaroon(macaroon)
const caveat = Caveat.decode('test=success')
lsat.addFirstPartyCaveat(caveat)
lsat.toToken()
${macaroon &&
  !!macaroon.length &&
  JSON.stringify(Lsat.fromMacaroon(macaroon).toToken(), null, 2)}
`
}

const Caveats: React.FunctionComponent = () => {
  const [macaroon, setMacaroon] = React.useState('')
  const [error, setError] = React.useState('')
  const [caveats, setCaveats] = React.useState<string[]>([])
  const [newCondition, setNewCondition] = React.useState('')
  const [newComp, setNewComp] = React.useState('')
  const [newValue, setNewValue] = React.useState('')
  const [caveatError, setNewCaveatError] = React.useState('')
  const [copying, setCopying] = React.useState(false)

  function updateCaveatsFromLsat(lsat: Lsat): void {
    const caveatsArray = lsat.getCaveats().map(caveat => caveat.encode())
    setCaveats(caveatsArray)
  }

  const updateCaveatError = (message: string) => {
    setNewCaveatError(message)
    setTimeout(() => setNewCaveatError(''), 2500)
  }

  function handleChange(e: React.FormEvent<HTMLTextAreaElement>) {
    e.preventDefault()
    const raw = e.currentTarget.value
    setError('')
    if (!e.currentTarget.value.length) {
      return setMacaroon('')
    }

    let lsat
    // try not to be opinionated on what is entered
    try {
      // first try and convert from a macaroon
      lsat = Lsat.fromMacaroon(raw)
      setMacaroon(raw)
    } catch (e) {
      // next try from LSAT Challenge
      try {
        lsat = Lsat.fromChallenge(raw)
        setMacaroon(lsat.baseMacaroon)
      } catch (e) {
        // finally try from token
        try {
          lsat = Lsat.fromToken(raw)
          setMacaroon(lsat.baseMacaroon)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Problem parsing lsat:', e.message)
          setMacaroon('')
          setError(e.message)
          return
        }
      }
    }

    updateCaveatsFromLsat(lsat)
  }

  const clearFields = () => {
    setNewComp('')
    setNewValue('')
    setNewCondition('')
  }

  const copyMacaroon = () => {
    setCopying(true)
    navigator.clipboard.writeText(macaroon)
    setTimeout(() => setCopying(false), 1000)
  }

  function handleAddCaveat(e: React.FormEvent) {
    e.preventDefault()
    setNewCaveatError('')
    if (!newCondition.length) {
      updateCaveatError('Missing caveat condition')
      return
    } else if (!newComp) {
      updateCaveatError('Missing caveat comparator')
      return
    }

    if (!macaroon) {
      updateCaveatError(
        'Must have an LSAT or macaroon before you can add a caveat to it'
      )
      return
    }
    try {
      const lsat = Lsat.fromMacaroon(macaroon)
      const caveat = new Caveat({
        condition: newCondition,
        comp: newComp,
        value: newValue,
      })
      lsat.addFirstPartyCaveat(caveat)
      setMacaroon(lsat.baseMacaroon)
      updateCaveatsFromLsat(lsat)
      clearFields()
    } catch (e) {
      updateCaveatError(e.message)
    }
  }

  return (
    <Grid>
      <Grid.Row>
        <Header as="h3">
          Parse and Add Caveats
          <Header.Subheader>
            Caveats allow you to attenuate your LSAT by adding unforegable and
            impossible to remove "rules" to your LSAT (also allowing you to
            delegate permissions). Enter a starting value in the textbox, and
            then you can add new caveats via the inputs below and the updated
            LSAT will be available in the code snippet section. NOTE: once a
            caveat is added, it CANNOT be removed from the macaroon anymore.
          </Header.Subheader>
        </Header>
      </Grid.Row>

      <Grid.Row columns={2}>
        <Grid.Column>
          <Header as="h4">Enter LSAT, Challenge, or Macaroon</Header>
          <Form error={!!error.length}>
            <TextArea
              placeholder="Paste macaroon here. LSAT..."
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
            {!!(!error.length && macaroon.length) && (
              <Message
                positive
                header="Success!"
                content="Decoded LSAT can be seen in code snippet."
              />
            )}
          </Form>
          <Header as="h4">Add Caveat</Header>
          <Form error={!!caveatError.length} onSubmit={handleAddCaveat}>
            <Grid columns={3}>
              <Grid.Column>
                <Input
                  value={newCondition}
                  placeholder="caveat condition"
                  onChange={e => setNewCondition(e.currentTarget.value)}
                />
              </Grid.Column>
              <Grid.Column>
                <Input
                  value={newComp}
                  placeholder="comparator (=, <, >)"
                  onChange={e => setNewComp(e.currentTarget.value)}
                />
              </Grid.Column>
              <Grid.Column>
                <Input
                  value={newValue}
                  placeholder="caveat value"
                  onChange={e => setNewValue(e.currentTarget.value)}
                />
              </Grid.Column>
              <Grid.Column>
                <Form.Button content="Add" />
              </Grid.Column>
            </Grid>
            {!!caveatError.length && (
              <Message
                style={{ overflowWrap: 'break-word' }}
                error
                header="Problem with caveat"
                content={caveatError}
              />
            )}
          </Form>
          <Header as="h4">Caveats</Header>
          {Boolean(caveats.length) && <CaveatList rawCaveats={caveats} />}
        </Grid.Column>
        <Grid.Column>
          <Header as="h4">Code Snippet</Header>
          <SyntaxHighlighter language="javascript">
            {codeSnippet(macaroon)}
          </SyntaxHighlighter>
          <Button
            secondary
            onClick={copyMacaroon}
            disabled={copying}
            loading={copying}
          >
            Copy Macaroon
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default Caveats
