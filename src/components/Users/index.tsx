import { useState } from 'react';
import { useRouter } from 'next/router';
import { Row, Col, ListGroup, Button, Spinner } from 'react-bootstrap';
import { FaUserEdit, FaPause, FaPlay, FaUserClock, FaUserTag } from 'react-icons/fa';

import api from '../../api/api';
import { Member as CustomerMember } from '../../components/CustomerMembers';
import { Member as LicensingMember } from '../../components/LicensingMembers';
import { Member as ProjectMember } from '../../components/ProjectMembers';
import { Member as PropertyMember } from '../../components/PropertyMembers';
import { Notification } from '../../components/Notifications';

export interface User {
    id: string,
    name: string;
    phone: string;
    email: string;
    password: string;
    active: boolean;
    paused: boolean;
    sudo: boolean;
    created_at: Date;
    roles: UserRole[];
    grants: Grants[];
    customerMembers: CustomerMember[];
    licensingMembers: LicensingMember[];
    projectMembers: ProjectMember[];
    propertyMembers: PropertyMember[];
    notifications: Notification[];
}

export interface UserRole {
    id: string;
    role: string;
    view: boolean;
    view_self: boolean;
    create: boolean;
    update: boolean;
    update_self: boolean;
    remove: boolean;
}

export interface Grants {
    role: string;
    resource: string;
    action: string;
}

interface UsersProps {
    user: User;
    handleListUsers(): Promise<void>;
}

const Users: React.FC<UsersProps> = ({ user, handleListUsers }) => {
    const router = useRouter();

    const [userPausing, setCategoryPausing] = useState(false);

    const togglePauseUser = async () => {
        setCategoryPausing(true);

        try {
            await api.put(`users/${user.id}`, {
                name: user.name,
                phone: user.phone,
                paused: !user.paused,
            });

            await handleListUsers();
        }
        catch (err) {
            console.log("Error to pause user");
            console.log(err);
        }

        setCategoryPausing(false);
    }

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <ListGroup.Item variant={!user.active ? "secondary" : !user.paused ? "light" : "danger"}>
            <Row className="align-items-center">
                <Col><span>{user.name}</span></Col>

                {
                    !user.active && <Col className="col-row text-end">
                        <FaUserClock /> aguardando aceitação...
                    </Col>
                }

                <Col className="col-row text-end">
                    <Button
                        variant="outline-success"
                        className="button-link"
                        onClick={togglePauseUser}
                        title="Pausar usuário"
                    >
                        {
                            userPausing ? <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            /> : user.paused ? (<><FaPlay /> Pausado</>) : (<><FaPause /> Pausar</>)
                        }
                    </Button>
                </Col>

                <Col className="col-row text-end">
                    <Button
                        variant="outline-success"
                        className="button-link"
                        onClick={() => handleRoute(`/users/details/${user.id}`)}
                        title="Ver informações sobre o usuário"
                    >
                        <FaUserTag /> Detalhes
                    </Button>
                </Col>

                <Col className="col-row text-end">
                    <Button
                        variant="outline-success"
                        className="button-link"
                        onClick={() => handleRoute(`/users/edit/${user.id}`)}
                        title="Editar usuário"
                    >
                        <FaUserEdit /> Editar
                    </Button>
                </Col>
            </Row>
        </ListGroup.Item>
    )
}

export default Users;