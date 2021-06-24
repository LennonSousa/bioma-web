import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Button, Col, Container, Image, ListGroup, Row } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import Users, { User, can } from '../../components/Users';
import { PageWaiting } from '../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../components/interfaces/AlertMessage';

export default function Institutions() {
    const router = useRouter();
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [users, setUsers] = useState<User[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<typeof statusModal>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Carregando...');

    useEffect(() => {
        handleItemSideBar('users');
        handleSelectedMenu('users-index');

        if (user && can(user, "users", "read:any")) {
            api.get('users').then(res => {
                setUsers(res.data);

                setLoadingData(false);
            }).catch(err => {
                console.log('Error to get users, ', err);

                setTypeLoadingMessage("error");
                setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
            });
        }
    }, [user]);

    async function handleListUsers() {
        const res = await api.get('users');

        setUsers(res.data);
    }

    function goNewUser() {
        router.push('/users/new');
    }

    return !user || loading ? <PageWaiting status="waiting" /> :
        <Container className="content-page">
            <>
                {
                    can(user, "users", "read:any") ? <>
                        {
                            can(user, "users", "create") && <Row>
                                <Col>
                                    <Button variant="outline-success" onClick={goNewUser}>
                                        <FaPlus /> Criar um usuário
                                    </Button>
                                </Col>
                            </Row>
                        }

                        <article className="mt-3">
                            {
                                loadingData ? <Col>
                                    <Row>
                                        <Col>
                                            <AlertMessage status={typeLoadingMessage} message={textLoadingMessage} />
                                        </Col>
                                    </Row>

                                    {
                                        typeLoadingMessage === "error" && <Row className="justify-content-center mt-3 mb-3">
                                            <Col sm={3}>
                                                <Image src="/assets/images/undraw_server_down_s4lk.svg" alt="Erro de conexão." fluid />
                                            </Col>
                                        </Row>
                                    }
                                </Col> :
                                    <Row>
                                        {
                                            !!users.length ? <Col>
                                                <ListGroup>
                                                    {
                                                        users && users.map((user, index) => {
                                                            return <Users
                                                                key={index}
                                                                user={user}
                                                                canEdit={can(user, "users", "update:any")}
                                                                handleListUsers={handleListUsers}
                                                            />
                                                        })
                                                    }
                                                </ListGroup>
                                            </Col> :
                                                <Col>
                                                    <Row>
                                                        <Col className="text-center">
                                                            <p style={{ color: 'var(--gray)' }}>Você ainda não tem nenhum usuário registrado.</p>
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
                            }
                        </article>
                    </> :
                        <PageWaiting status="warning" message="Acesso negado!" />
                }

            </>
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