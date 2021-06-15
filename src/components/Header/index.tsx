import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Container, Form, Navbar } from 'react-bootstrap';

import { AuthContext } from '../../context/authContext';

export function Header() {
    const router = useRouter();
    const { signed, handleAuthenticated, handleLogout } = useContext(AuthContext);

    const [showPageHeader, setShowPageHeader] = useState(false);

    const pathsNotShow = ['/', '/users/new/auth', '/404', '500'];

    useEffect(() => {
        if (!pathsNotShow.find(item => { return item === router.route }))
            handleAuthenticated();
    }, []);

    useEffect(() => {
        let show = false;

        if (signed && !pathsNotShow.find(item => { return item === router.route })) show = true;

        setShowPageHeader(show);
    }, [signed, router.route]);

    return showPageHeader ? <Navbar bg="dark" variant="dark">
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

            <Form inline>
                <Button variant="outline-light" onClick={handleLogout}>Sair</Button>
            </Form>
        </Container>
    </Navbar> : <></>
}