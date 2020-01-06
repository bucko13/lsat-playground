import * as React from 'react'
import { Grid, Header, Form, TextArea, Message } from 'semantic-ui-react'
import { Lsat } from 'lsat-js'
import SyntaxHighlighter from 'react-syntax-highlighter'

type Props = {
  signingKey: string
}

const codeSnippet = (token?: string): string => {
  return `import {Lsat} from 'lsat-js'

// challenge must be a base64 encodedstring
const lsat = Lsat.fromToken(token)

lsat.toJSON()
${token &&
  !!token.length &&
  JSON.stringify(Lsat.fromToken(token).toJSON(), null, 2)}
`
}

const ParseToken: React.FunctionComponent<Props> = () => {
  const [token, setToken] = React.useState('')
  const [error, setError] = React.useState('')

  function handleChange(e: React.FormEvent<HTMLTextAreaElement>) {
    e.preventDefault()
    setError('')
    if (!e.currentTarget.value.length) {
      return setToken('')
    }
    try {
      Lsat.fromToken(e.currentTarget.value)
      setToken(e.currentTarget.value)
    } catch (e) {
      console.error('Problem parsing lsat:', e.message)
      setToken('')
      setError(e.message)
      return
    }
  }

  return (
    <Grid>
      <Grid.Row>
        <Header as="h3">
          Parse LSAT Token
          <Header.Subheader>
            Simple utility to get a human readable version of an LSAT parsed
            from an encoded token
          </Header.Subheader>
        </Header>
      </Grid.Row>

      <Grid.Row columns={2}>
        <Grid.Column>
          <Header as="h4">Enter Token</Header>
          <Form error={!!error.length}>
            <TextArea
              placeholder="Paste token here. LSAT..."
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
            {!!(!error.length && token.length) && (
              <Message
                positive
                header="Success!"
                content="Decoded LSAT can be seen in code snippet."
              />
            )}
          </Form>
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

export default ParseToken
