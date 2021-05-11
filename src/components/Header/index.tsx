import { Container, Navbar } from 'react-bootstrap';

export function Header() {
    return <Navbar bg="dark" variant="dark">
        <Container>
            <Navbar.Brand href="#home">
                <img
                    alt=""
                    src="/assets/images/logo-bioma.svg"
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                />{' '}Plataforma de gerenciamento
            </Navbar.Brand>
        </Container>
    </Navbar>
}