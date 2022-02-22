import * as React from 'react'
import { Input, Button, Icon, Grid, Header } from 'semantic-ui-react'
import { randomBytes } from 'crypto'
import { CopyToClipboard } from 'react-copy-to-clipboard'

type Props = {
  signingKey: string
  setKey: (key: string) => void
}

const GenerateKey: React.FunctionComponent<Props> = ({
  signingKey,
  setKey,
}) => {
  const [disabled, setDisabled] = React.useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    if (!disabled) setKey(e.target.value)
  }

  function generateKey() {
    const bytes = randomBytes(32).toString('hex')
    setKey(bytes)
    setDisabled(true)
  }

  function handleSave() {
    setKey(signingKey)
    setDisabled(true)
  }

  return (
    <Grid centered columns={1}>
      <Grid.Row>
        <Grid.Column>
          <Header as="h3" textAlign="center">
            Signing Key
            <Header.Subheader>
              Signing key for generating and verifying LSATs. This will be used
              where required for the rest of the playground.
            </Header.Subheader>
          </Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Column>
        <Input
          placeholder="Enter custom macaroon signing key or generate one below"
          id="signing-key"
          fluid
          value={signingKey}
          onChange={handleChange}
          style={{ textOverflow: 'ellipsis' }}
          action={
            disabled && (
              <CopyToClipboard text={signingKey}>
                <Button icon labelPosition="right" color="green">
                  Copy
                  <Icon name="copy" />
                </Button>
              </CopyToClipboard>
            )
          }
        />
      </Grid.Column>
      <Grid.Column>
        {!disabled && (
          <React.Fragment>
            <Button onClick={handleSave} disabled={signingKey.length < 5}>
              Save Key
            </Button>
            <Button onClick={generateKey}>Generate Key</Button>
          </React.Fragment>
        )}
      </Grid.Column>
    </Grid>
  )
}

export default GenerateKey
