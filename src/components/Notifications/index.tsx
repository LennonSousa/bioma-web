import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Row, Col, ListGroup, Modal } from 'react-bootstrap';
import { FaEnvelope, FaRegEnvelopeOpen } from 'react-icons/fa';
import { format } from 'date-fns';

import api from '../../api/api';
import { NotificationsContext } from '../../contexts/NotificationsContext';
import { AuthContext } from '../../contexts/AuthContext';
import { User } from '../Users';

export interface Notification {
    id: string,
    title: string,
    sub_title: string,
    read: boolean,
    created_at: Date,
    user: User,
    item: string,
    item_id: string,
}

interface NotificationProps {
    notification: Notification;
    filtered?: boolean
}

const Notifications: React.FC<NotificationProps> = ({ notification, filtered = false }) => {
    const router = useRouter();

    const { handleNotifications } = useContext(NotificationsContext);
    const { user } = useContext(AuthContext);

    const [showModalNotification, setShowModalNotification] = useState(false);

    const handleCloseModalNotification = () => setShowModalNotification(false);
    const handleShowModalNotification = () => {
        if (!notification.read && !filtered) {
            togglePauseCategory();
        }

        setShowModalNotification(true);
    };

    const togglePauseCategory = async () => {
        try {
            await api.put(`notifications/${notification.id}`, {
                read: !notification.read,
            });

            if (user) {
                const res = await api.get(`notifications/user/${user.id}`);

                const resNotifications: Notification[] = res.data;

                handleNotifications(resNotifications);
            }
        }
        catch (err) {
            console.log("Error to update notification");
            console.log(err);
        }
    }

    function goToItem() {
        handleRoute(`/${notification.item}/details/${notification.item_id}`);
    }

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <ListGroup.Item variant="light">
            <Row className="align-items-center">
                <Col sm={1}>
                    {!notification.read && <FaEnvelope />}
                </Col>

                <Col><span>{notification.title}</span></Col>

                <Col className="col-row">
                    {format(new Date(notification.created_at), 'dd/MM/yyyy')}
                </Col>

                <Col className="col-row">
                    <Button
                        variant="success"
                        title="Ler a notificação"
                        onClick={handleShowModalNotification}
                    >
                        <FaRegEnvelopeOpen />
                    </Button>
                </Col>
            </Row>

            <Modal show={showModalNotification} onHide={handleCloseModalNotification}>
                <Modal.Header closeButton>
                    <Modal.Title>{notification.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col>
                            <p>
                                {notification.sub_title}
                            </p>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="success" onClick={goToItem} >Abrir item</Button>
                    <Button variant="success" onClick={togglePauseCategory} >{`Marcar como ${notification.read ? 'não' : ''} lida`}</Button>
                    <Button variant="secondary" onClick={handleCloseModalNotification} >Fechar</Button>
                </Modal.Footer>
            </Modal>
        </ListGroup.Item>
    )
}

export default Notifications;