import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Badge, Button, Col, Container, Form, Navbar, Row, Toast } from 'react-bootstrap';
import { FaBell, FaSignOutAlt, FaRegBell, FaRegUserCircle, FaUserTie, FaUserCog } from 'react-icons/fa';

import { AuthContext } from '../../contexts/AuthContext';
import { NotificationsContext } from '../../contexts/NotificationsContext';
import { SideNavBar } from '../Sidebar';

import styles from './styles.module.css';

export function Header() {
    const router = useRouter();
    const { signed, user, handleAuthenticated, handleLogout } = useContext(AuthContext);
    const { notifications } = useContext(NotificationsContext);

    const [showPageHeader, setShowPageHeader] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const pathsNotShow = [
        '/',
        '/users/new/auth',
        '/users/reset',
        '/users/reset/auth',
        '/404',
        '500',
        '/shares/auth',
    ];

    const [showUserDetails, setShowUserDetails] = useState(false);

    const toggleShowUserDetails = () => setShowUserDetails(!showUserDetails);

    useEffect(() => {
        if (!pathsNotShow.find(item => { return item === router.route }))
            handleAuthenticated();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        let show = false;

        if (signed && !pathsNotShow.find(item => { return item === router.route })) show = true;

        setShowPageHeader(show);
    }, [signed, router.route]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (notifications) {
            const unreads = notifications.filter(item => { return !item.read });

            setUnreadNotifications(unreads.length);
        }
    }, [notifications]);

    function handleRoute(route: string) {
        router.push(route);
    }

    return showPageHeader ? <Navbar className="d-print-none" collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container>
            <Row className="align-items-center">
                <Col>
                    <Image
                        alt=""
                        src="/assets/images/logo-bioma.svg"
                        width="40"
                        height="40"
                        className="d-inline-block align-top"
                    />
                </Col>
                <Col>
                    <span className="text-light">App</span>
                </Col>
            </Row>

            <div className={styles.sideNavBarContainer}>
                <Navbar.Toggle aria-controls="side-navbar-nav" />

                <Navbar.Collapse id="side-navbar-nav">
                    <SideNavBar />
                </Navbar.Collapse>
            </div>

            <Form>
                <Row>
                    <Col>
                        <Button
                            variant="outline-light"
                            onClick={() => handleRoute('/notifications')}
                            title={
                                unreadNotifications > 0 ?
                                    `Você tem ${unreadNotifications} ${unreadNotifications === 1 ? 'notificação' :
                                        'notificações'} não ${unreadNotifications === 1 ? 'lida.' :
                                            'lidas.'}` :
                                    'Você não tem nenhuma notificação nova.'
                            }
                        >
                            {
                                unreadNotifications > 0 ? <div className={styles.buttonNotificationsContainer}>
                                    <FaBell /> <Badge className={styles.buttonNotificationsContainerBadge} bg="warning">{unreadNotifications}</Badge>
                                </div> : <FaRegBell />
                            }
                        </Button>
                    </Col>

                    {
                        user && <Col>
                            <Button
                                variant="outline-light"
                                onClick={toggleShowUserDetails}
                                title={user ? user.name : ''}
                            >
                                <FaRegUserCircle />
                            </Button>

                            <Toast
                                show={showUserDetails}
                                onClose={toggleShowUserDetails}
                                autohide
                                delay={5000}
                                style={{
                                    position: 'absolute',
                                    minWidth: '250px',
                                    top: 0,
                                    right: 0,
                                    zIndex: 999,
                                    width: 'auto',
                                    maxWidth: 'fit-content',
                                }}
                            >
                                <Toast.Header className="justify-content-center">
                                    <FaUserTie style={{ marginRight: '.5rem' }} /><strong className="me-auto">{user.name}</strong>
                                </Toast.Header>
                                <Toast.Body>
                                    <Row className="mb-3">
                                        <Col>
                                            <Button
                                                variant="light"
                                                type="button"
                                                onClick={() => handleRoute(`/users/details/${user.id}`)}
                                                style={{ width: '100%' }}
                                                title="Ver detalhes do usuário."
                                            >
                                                <FaUserCog style={{ marginRight: '.5rem' }} /> Detalhes
                                            </Button>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <Button
                                                variant="light"
                                                type="button"
                                                onClick={handleLogout}
                                                style={{ width: '100%' }}
                                                title="Sair do sistema."
                                            >
                                                <FaSignOutAlt style={{ marginRight: '.5rem' }} /> Sair
                                            </Button>
                                        </Col>
                                    </Row>
                                </Toast.Body>
                            </Toast>
                        </Col>
                    }
                </Row>
            </Form>
        </Container>
    </Navbar > : <></>
}