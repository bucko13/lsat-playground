import * as React from 'react'

import { Divider, Segment } from 'semantic-ui-react'

type Props = {
  id: string
  children?: React.ReactNode
}

const PlaygroundSegment: React.FunctionComponent<Props> = ({
  children,
  id,
}) => {
  return (
    <React.Fragment>
      <Segment basic id={id}>
        {children}
      </Segment>
      <Divider />
    </React.Fragment>
  )
}

export default PlaygroundSegment
