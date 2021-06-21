import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Col, Container, Form, Image, ListGroup, Row } from 'react-bootstrap';

import { NotificationsContext } from '../../contexts/NotificationsContext';
import { TokenVerify } from '../../utils/tokenVerify';
import NotificationItem, { Notification } from '../../components/Notifications';

export default function Notifications() {
    const { notifications } = useContext(NotificationsContext);

    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        if (notifications) {
            if (typeFilter === 'all') {
                setFilteredNotifications(notifications);

                return;
            }

            if (typeFilter === 'unread') {
                setFilteredNotifications(notifications.filter(notification => { return !notification.read }));

                return;
            }

            if (typeFilter === 'read') {
                setFilteredNotifications(notifications.filter(notification => { return notification.read }));

                return;
            }
        }
    }, [notifications, typeFilter]);

    function handleTypeFilter(event: ChangeEvent<HTMLSelectElement>) {
        setTypeFilter(event.target.value);
    }

    return <Container className="content-page">
        <Row>
            <Col>
                <Form>
                    <Row className="mb-3 align-items-end">
                        <Form.Group as={Col} sm={4} controlId="formGridFilter">
                            <Form.Label>Filtro</Form.Label>
                            <Form.Control
                                as="select"
                                onChange={handleTypeFilter}
                                name="filter"
                            >
                                <option value='all'>Todas</option>
                                <option value='unread'>Não lidos</option>
                                <option value='read'>Lidos</option>
                            </Form.Control>
                        </Form.Group>
                    </Row>
                </Form>
            </Col>
        </Row>
        <article className="mt-3">
            <Row>
                {
                    !!filteredNotifications.length ? <Col>
                        <ListGroup>
                            {
                                filteredNotifications && filteredNotifications.map(notification => {
                                    return <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        filtered={typeFilter === 'all' ? false : true}
                                    />
                                })
                            }
                        </ListGroup>
                    </Col> :
                        <Col>
                            <Row>
                                <Col className="text-center">
                                    <p style={{ color: 'var(--gray)' }}>Nenhuma notificação encontrada.</p>
                                </Col>
                            </Row>

                            <Row className="justify-content-center mt-3 mb-3">
                                <Col sm={3}>
                                    <Image src="/assets/images/undraw_not_found.svg" alt="Sem dados para mostrar." fluid />
                                </Col>
                            </Row>
                        </Col>
                }
            </Row>
        </article>
    </Container>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { token } = context.req.cookies;

    const tokenVerified = await TokenVerify(token);

    if (tokenVerified === "not-authorized") { // Not authenticated, token invalid!
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    if (tokenVerified === "error") { // Server error!
        return {
            redirect: {
                destination: '/500',
                permanent: false,
            },
        }
    }

    return {
        props: {},
    }
}