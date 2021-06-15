import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, ButtonGroup, Col, Container, Tab, Tabs, ListGroup, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaKey, FaUserEdit } from 'react-icons/fa';
import { format } from 'date-fns';

import api from '../../../api/api';
import { cellphone } from '../../../components/InputMask/masks';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../context/SideBarContext';
import { User, UserRole } from '../../../components/Users';
import PropertyListItem from '../../../components/PropertyListItem';
import PageBack from '../../../components/PageBack';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

import styles from './styles.module.css';

interface TranslateRoles {
    role: string,
    translated: string;
}

const translatedRoles: TranslateRoles[] = [
    {
        role: 'customers',
        translated: 'Clientes',
    },
    {
        role: 'institutions',
        translated: 'Instituições',
    },
    {
        role: 'licensings',
        translated: 'Licenciamentos',
    },
    {
        role: 'properties',
        translated: 'Imóveis',
    },
    {
        role: 'projects',
        translated: 'Projetos',
    },
    {
        role: 'banks',
        translated: 'Bancos',
    },
    {
        role: 'users',
        translated: 'Usuários',
    },
];

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!'),
    phone: Yup.string().required('Obrigatório!'),
});

export default function UserDetails() {
    const router = useRouter();
    const { user } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [userData, setUserData] = useState<User>();
    const [usersRoles, setUsersRoles] = useState<UserRole[]>([]);

    useEffect(() => {
        handleItemSideBar('users');
        handleSelectedMenu('users-new');

        api.get(`users/${user}`).then(res => {
            let userRes: User = res.data;

            setUsersRoles(userRes.roles.map(role => {
                const translatedRole = translatedRoles.find(item => { return item.role === role.role });

                return { ...role, role: translatedRole ? translatedRole.translated : role.role };
            }));

            setUserData(userRes);
        }).catch(err => {
            console.log('Error get user to edit, ', err);
        });
    }, []);

    function handleRoute(route: string) {
        router.push(route);
    }

    return <Container className="content-page">
        {
            !userData ? <h1>Aguarde...</h1> : <Row>
                <Col>
                    <Row className="mb-3">
                        <Col>
                            <PageBack href="/users" subTitle="Voltar para a lista de usuários" />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={6}>
                            <Row className="align-items-center">
                                <Col className="col-row">
                                    <h3 className="form-control-plaintext text-success">{userData.name}</h3>
                                </Col>
                                <Col className="col-row">
                                    <ButtonGroup size="sm" className="col-12">
                                        <Button
                                            title="Editar usuário."
                                            variant="success"
                                            onClick={() => handleRoute(`/users/edit/${userData.id}`)}
                                        >
                                            <FaUserEdit />
                                        </Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={3} >
                            <Row>
                                <Col>
                                    <span className="text-success">Celular</span>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <h6 className="text-secondary">{userData.phone}</h6>
                                </Col>
                            </Row>
                        </Col>

                        <Col sm={6} >
                            <Row>
                                <Col>
                                    <span className="text-success">E-mail</span>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <h6 className="text-secondary">{userData.email}</h6>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Col className="border-top mb-3"></Col>

                    <Row className="mb-3">
                        <Col sm={4} >
                            <Row>
                                <Col>
                                    <span className="text-success">Criado em</span>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <h6 className="text-secondary">{format(new Date(userData.created_at), 'dd/MM/yyyy')}</h6>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col>
                            <Row>
                                <Col>
                                    <h6 className="text-success">Permissões <FaKey /></h6>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <ListGroup className="mb-3">
                                        {
                                            usersRoles.map((role, index) => {
                                                return <ListGroup.Item key={index} as="div" variant="light">
                                                    <Row>
                                                        <Col>
                                                            <h6 className="text-success">{role.role} </h6>
                                                        </Col>

                                                        {
                                                            role.view && <Col className="col-row">
                                                                <span>Visualizar</span>
                                                            </Col>
                                                        }

                                                        {
                                                            role.create && <Col className="col-row">
                                                                <span>Criar</span>
                                                            </Col>
                                                        }

                                                        {
                                                            role.update && <Col className="col-row">
                                                                <span>Editar</span>
                                                            </Col>
                                                        }



                                                        {
                                                            role.id === 'users' && role.update_self && <Col className="col-row">
                                                                <span>Editar próprio</span>
                                                            </Col>
                                                        }

                                                        {
                                                            role.remove && <Col className="col-row">
                                                                <span>Excluir</span>
                                                            </Col>
                                                        }
                                                    </Row>
                                                </ListGroup.Item>
                                            })
                                        }
                                    </ListGroup>
                                </Col>
                            </Row>
                        </Col>
                    </Row>


                    <Col className="border-top mb-3"></Col>

                    <Tabs defaultActiveKey="properties" id="relations-customer">
                        <Tab eventKey="properties" title="Imóveis">
                            <Row className={styles.relationsContainer}>
                                <Col>
                                    <Row className={styles.relationsContent}>
                                        {
                                            userData.propertyMembers.length > 0 ? userData.propertyMembers.map((propertyMember, index) => {
                                                return <PropertyListItem
                                                    key={index}
                                                    property={propertyMember.property}
                                                    showCustomer={false}
                                                />
                                            }) :
                                                <Col>
                                                    <span className="text-success">Nenhum imóvel registrado.</span>
                                                </Col>
                                        }
                                    </Row>
                                </Col>
                            </Row>
                        </Tab>

                        <Tab eventKey="projects" title="Projetos">
                            <Row className={styles.relationsContainer}>
                                <Col>
                                    <Row className={styles.relationsContent}>
                                        <Col>
                                            <span className="text-success">Nenhum projeto registrado.</span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Tab>

                        <Tab eventKey="licensings" title="Licenciamentos">
                            <Row className={styles.relationsContainer}>
                                <Col>
                                    <Row className={styles.relationsContent}>
                                        <Col>
                                            <span className="text-success">Nenhum licenciamento registrado.</span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        }
    </Container >
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