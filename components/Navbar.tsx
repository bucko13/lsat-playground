import React from 'react'
import {
  // Button,
  // Divider,
  // Grid,
  // Header,
  // Icon,
  // Image,
  // List,
  // Sidebar,
  Container,
  Menu,
  Responsive,
  Segment,
  Visibility,
} from 'semantic-ui-react'

type NavItem = {
  id: string
  name: string
}

type Props = {
  navItems: NavItem[]
}

const getWidth = () => {
  const isSSR = typeof window === 'undefined'

  return isSSR
    ? Number(Responsive.onlyTablet.minWidth)
    : Number(window.innerWidth)
}

const Navbar: React.FunctionComponent<Props> = ({ navItems }) => {
  const [fixed, setFixed] = React.useState(false)

  return (
    <Responsive getWidth={getWidth} minWidth={Responsive.onlyTablet.minWidth}>
      <Visibility
        once={false}
        onBottomPassed={() => setFixed(true)}
        onBottomVisible={() => setFixed(false)}
      >
        <Segment inverted textAlign="center" vertical>
          <Menu
            fixed={fixed ? 'top' : undefined}
            inverted={!fixed}
            pointing={!fixed}
            secondary={!fixed}
            size="large"
          >
            <Container>
              <Menu.Item href="#">Home</Menu.Item>
              {navItems.map((item, index) => (
                <Menu.Item href={`#${item.id}`} key={index}>
                  {item.name}
                </Menu.Item>
              ))}
            </Container>
          </Menu>
        </Segment>
      </Visibility>
    </Responsive>
  )
}

export default Navbar
