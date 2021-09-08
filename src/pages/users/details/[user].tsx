import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Accordion, Button, ButtonGroup, Col, Container, Tab, Tabs, Table, ListGroup, Row } from 'react-bootstrap';
import { FaAngleRight, FaFingerprint, FaKey, FaUserEdit } from 'react-icons/fa';
import { format } from 'date-fns';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { User, UserRole, can, translateRole, translateGrant } from '../../../components/Users';

import { Customer } from '../../../components/Customers';
import CustomerListItem from '../../../components/CustomerListItem';

import { Licensing } from '../../../components/Licensings';
import LicensingListItem from '../../../components/LicensingListItem';

import { Project } from '../../../components/Projects';
import ProjectListItem from '../../../components/ProjectListItem';

import { Property } from '../../../components/Properties';
import PropertyListItem from '../../../components/PropertyListItem';

import { Member as CustomerMember } from '../../../components/CustomerMembers';
import { Member as LicensingMember } from '../../../components/LicensingMembers';
import { Member as ProjectMember } from '../../../components/ProjectMembers';
import { Member as PropertyMember } from '../../../components/PropertyMembers';

import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage } from '../../../components/Interfaces/AlertMessage';

import styles from './styles.module.css';

export default function UserDetails() {
    const router = useRouter();
    const userId = router.query['user'];

    const { loading, user } = useContext(AuthContext);

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    const [userData, setUserData] = useState<User>();
    const [usersRoles, setUsersRoles] = useState<UserRole[]>([]);

    // Relations tabs.
    const [tabKey, setTabKey] = useState('customers');

    const [loadingCustomerMembers, setLoadingCustomerMembers] = useState(false);
    const [customerMembersData, setCustomerMembersData] = useState<Customer[]>([]);
    const [customersErrorShow, setCustomersErrorShow] = useState(false);

    const [loadingPropertyMembers, setLoadingPropertyMembers] = useState(false);
    const [propertyMembersData, setPropertyMembersData] = useState<Property[]>([]);
    const [propertiesErrorShow, setPropertiesErrorShow] = useState(false);

    const [loadingProjectMembers, setLoadingProjectMembers] = useState(false);
    const [projectMembersData, setProjectMembersData] = useState<Project[]>([]);
    const [projectsErrorShow, setProjectsErrorShow] = useState(false);

    const [loadingLicensingMembers, setLoadingLicensingMembers] = useState(false);
    const [licensingMembersData, setLicensingMembersData] = useState<Licensing[]>([]);
    const [licensingsErrorShow, setLicensingsErrorShow] = useState(false);

    useEffect(() => {
        handleItemSideBar('users');
        handleSelectedMenu('users-index');

        if (user) {
            if (can(user, "users", "view") || userId === user.id) {
                api.get(`users/${userId}`).then(res => {
                    let userRes: User = res.data;

                    setUsersRoles(userRes.roles);

                    setUserData(userRes);

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error get user to edit, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });
            }
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (userId) {
            if (tabKey === "customers") {
                setCustomersErrorShow(false);
                setLoadingCustomerMembers(true);

                api.get(`members/customers/user/${userId}`).then(res => {
                    const customersMember: CustomerMember[] = res.data;
                    let customers: Customer[] = [];

                    customersMember.forEach(member => {
                        if (member.customer) {
                            customers.push(member.customer);
                        }
                    });

                    setCustomerMembersData(customers);

                    setLoadingCustomerMembers(false);
                }).catch(err => {
                    console.log('Error to get customers user, ', err);
                    setCustomersErrorShow(true);

                    setLoadingCustomerMembers(false);
                });

                return;
            }

            if (tabKey === "properties") {
                setPropertiesErrorShow(false);
                setLoadingPropertyMembers(true);

                api.get(`members/properties/user/${userId}`).then(res => {
                    const propertiesMember: PropertyMember[] = res.data;
                    let properties: Property[] = [];

                    propertiesMember.forEach(member => {
                        if (member.property) {
                            properties.push(member.property);
                        }
                    });

                    setPropertyMembersData(properties);

                    setLoadingPropertyMembers(false);
                }).catch(err => {
                    console.log('Error to get properties user, ', err);
                    setPropertiesErrorShow(true);

                    setLoadingPropertyMembers(false);
                });

                return;
            }

            if (tabKey === "projects") {
                setProjectsErrorShow(false);
                setLoadingProjectMembers(true);

                api.get(`members/projects/user/${userId}`).then(res => {
                    const projectsMember: ProjectMember[] = res.data;
                    let projects: Project[] = [];

                    projectsMember.forEach(member => {
                        if (member.project) {
                            projects.push(member.project);
                        }
                    });

                    setProjectMembersData(projects);

                    setLoadingProjectMembers(false);
                }).catch(err => {
                    console.log('Error to get projects user, ', err);
                    setProjectsErrorShow(true);

                    setLoadingProjectMembers(false);
                });

                return;
            }

            if (tabKey === "licensings") {
                setLicensingsErrorShow(false);
                setLoadingLicensingMembers(true);

                api.get(`members/licensings/user/${userId}`).then(res => {
                    const licensingsMember: LicensingMember[] = res.data;
                    let licensings: Licensing[] = [];

                    licensingsMember.forEach(member => {
                        if (member.licensing) {
                            licensings.push(member.licensing);
                        }
                    });

                    setLicensingMembersData(licensings);

                    setLoadingLicensingMembers(false);
                }).catch(err => {
                    console.log('Error to get licensings user, ', err);
                    setLicensingsErrorShow(true);

                    setLoadingLicensingMembers(false);
                });

                return;
            }
        }
    }, [userId, tabKey]);

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <>
            <NextSeo
                title="Detalhes do usuário"
                description="Detalhes do usuário da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Detalhes do usuário',
                    description: 'Detalhes do usuário da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Detalhes do usuário | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "users", "view") || userId === user.id ? <>
                                {
                                    loadingData ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !userData ? <PageWaiting status="waiting" /> :
                                                    <Container className="content-page">
                                                        <Row>
                                                            <Col>
                                                                {
                                                                    can(user, "users", "view") && <Row className="mb-3">
                                                                        <Col>
                                                                            <PageBack href="/users" subTitle="Voltar para a lista de usuários" />
                                                                        </Col>
                                                                    </Row>
                                                                }

                                                                <Row className="mb-3">
                                                                    <Col sm={6}>
                                                                        <Row className="align-items-center">
                                                                            <Col className="col-row">
                                                                                <h3 className="form-control-plaintext text-success">{userData.name}</h3>
                                                                            </Col>

                                                                            {
                                                                                can(user, "users", "update") ||
                                                                                    can(user, "users", "update_self") &&
                                                                                    userId === user.id ?
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
                                                                                    </Col> : <Col></Col>
                                                                            }
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
                                                                                                        <h6 className="text-success" >
                                                                                                            {
                                                                                                                translateRole(role.role)
                                                                                                            }
                                                                                                        </h6>
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
                                                                                                        role.role === 'users' && role.update_self && <Col className="col-row">
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

                                                                <Tabs
                                                                    id="relations-tabs"
                                                                    activeKey={tabKey}
                                                                    onSelect={(k) => k && setTabKey(k)}
                                                                >
                                                                    {
                                                                        can(user, "customers", "view") && <Tab eventKey="customers" title="Clientes">
                                                                            <Row className={styles.relationsContainer}>
                                                                                <Col>
                                                                                    <Row className={`justify-content-center ${styles.relationsContent}`}>
                                                                                        {
                                                                                            loadingCustomerMembers ? <Col sm={4}>
                                                                                                <AlertMessage status="waiting" />
                                                                                            </Col> :
                                                                                                <>
                                                                                                    {
                                                                                                        !customersErrorShow ? <>
                                                                                                            {
                                                                                                                !!customerMembersData.length ? <>
                                                                                                                    {
                                                                                                                        customerMembersData.map((customerMember, index) => {
                                                                                                                            return <CustomerListItem
                                                                                                                                key={index}
                                                                                                                                customer={customerMember}
                                                                                                                            />
                                                                                                                        })
                                                                                                                    }

                                                                                                                    <Col>
                                                                                                                        <Row className="justify-content-end">
                                                                                                                            <Col className="col-row">
                                                                                                                                <Button
                                                                                                                                    title="Ver todos os clientes para esse usuário."
                                                                                                                                    variant="success"
                                                                                                                                    onClick={() => handleRoute(`/customers?user=${userData.id}`)}
                                                                                                                                >
                                                                                                                                    Ver mais <FaAngleRight />
                                                                                                                                </Button>
                                                                                                                            </Col>
                                                                                                                        </Row>
                                                                                                                    </Col>
                                                                                                                </> :
                                                                                                                    <Col>
                                                                                                                        <Row className="justify-content-center">
                                                                                                                            <Col className="col-row">
                                                                                                                                <span className="text-success">Nenhum cliente encontrado.</span>
                                                                                                                            </Col>
                                                                                                                        </Row>
                                                                                                                    </Col>
                                                                                                            }
                                                                                                        </> : <Col sm={4}>
                                                                                                            <AlertMessage status="error" />
                                                                                                        </Col>
                                                                                                    }
                                                                                                </>
                                                                                        }
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                        </Tab>
                                                                    }

                                                                    {
                                                                        can(user, "properties", "view") && <Tab eventKey="properties" title="Imóveis">
                                                                            <Row className={styles.relationsContainer}>
                                                                                <Col>
                                                                                    <Row className={`justify-content-center ${styles.relationsContent}`}>
                                                                                        {
                                                                                            loadingPropertyMembers ? <Col sm={4}>
                                                                                                <AlertMessage status="waiting" />
                                                                                            </Col> :
                                                                                                <>
                                                                                                    {
                                                                                                        !propertiesErrorShow ? <>
                                                                                                            {
                                                                                                                !!propertyMembersData.length ? <>
                                                                                                                    {
                                                                                                                        propertyMembersData.map((property, index) => {
                                                                                                                            return <PropertyListItem
                                                                                                                                key={index}
                                                                                                                                property={property}
                                                                                                                            />
                                                                                                                        })
                                                                                                                    }

                                                                                                                    <Col>
                                                                                                                        <Row className="justify-content-end">
                                                                                                                            <Col className="col-row">
                                                                                                                                <Button
                                                                                                                                    title="Ver todos os imóveis para esse usuário."
                                                                                                                                    variant="success"
                                                                                                                                    onClick={() => handleRoute(`/properties?user=${userData.id}`)}
                                                                                                                                >
                                                                                                                                    Ver mais <FaAngleRight />
                                                                                                                                </Button>
                                                                                                                            </Col>
                                                                                                                        </Row>
                                                                                                                    </Col>
                                                                                                                </> :
                                                                                                                    <Col>
                                                                                                                        <Row className="justify-content-center">
                                                                                                                            <Col className="col-row">
                                                                                                                                <span className="text-success">Nenhum imóvel encontrado.</span>
                                                                                                                            </Col>
                                                                                                                        </Row>                                                                                                        </Col>
                                                                                                            }
                                                                                                        </> : <Col sm={4}>
                                                                                                            <AlertMessage status="error" />
                                                                                                        </Col>
                                                                                                    }
                                                                                                </>
                                                                                        }
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                        </Tab>
                                                                    }

                                                                    {
                                                                        can(user, "projects", "view") && <Tab eventKey="projects" title="Projetos">
                                                                            <Row className={styles.relationsContainer}>
                                                                                <Col>
                                                                                    <Row className={`justify-content-center ${styles.relationsContent}`}>
                                                                                        {
                                                                                            loadingProjectMembers ? <Col sm={4}>
                                                                                                <AlertMessage status="waiting" />
                                                                                            </Col> :
                                                                                                <>
                                                                                                    {
                                                                                                        !projectsErrorShow ? <>
                                                                                                            {
                                                                                                                !!projectMembersData.length ? <>
                                                                                                                    {
                                                                                                                        projectMembersData.map((project, index) => {
                                                                                                                            return <ProjectListItem
                                                                                                                                key={index}
                                                                                                                                project={project}
                                                                                                                            />
                                                                                                                        })
                                                                                                                    }

                                                                                                                    <Col>
                                                                                                                        <Row className="justify-content-end">
                                                                                                                            <Col className="col-row">
                                                                                                                                <Button
                                                                                                                                    title="Ver todos os projetos para esse usuário."
                                                                                                                                    variant="success"
                                                                                                                                    onClick={() => handleRoute(`/projects?user=${userData.id}`)}
                                                                                                                                >
                                                                                                                                    Ver mais <FaAngleRight />
                                                                                                                                </Button>
                                                                                                                            </Col>
                                                                                                                        </Row>
                                                                                                                    </Col>
                                                                                                                </> :
                                                                                                                    <Col>
                                                                                                                        <Row className="justify-content-center">
                                                                                                                            <Col className="col-row">
                                                                                                                                <span className="text-success">Nenhum projeto encontrado.</span>
                                                                                                                            </Col>
                                                                                                                        </Row>
                                                                                                                    </Col>
                                                                                                            }
                                                                                                        </> : <Col sm={4}>
                                                                                                            <AlertMessage status="error" />
                                                                                                        </Col>
                                                                                                    }
                                                                                                </>
                                                                                        }
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                        </Tab>
                                                                    }

                                                                    {
                                                                        can(user, "licensings", "view") && <Tab eventKey="licensings" title="Licenciamentos">
                                                                            <Row className={styles.relationsContainer}>
                                                                                <Col>
                                                                                    <Row className={`justify-content-center ${styles.relationsContent}`}>
                                                                                        {
                                                                                            loadingLicensingMembers ? <Col sm={4}>
                                                                                                <AlertMessage status="waiting" />
                                                                                            </Col> :
                                                                                                <>
                                                                                                    {
                                                                                                        !licensingsErrorShow ? <>
                                                                                                            {
                                                                                                                !!licensingMembersData.length ? <>
                                                                                                                    {
                                                                                                                        licensingMembersData.map((licensing, index) => {
                                                                                                                            return <LicensingListItem
                                                                                                                                key={index}
                                                                                                                                licensing={licensing}
                                                                                                                            />
                                                                                                                        })
                                                                                                                    }

                                                                                                                    <Col>
                                                                                                                        <Row className="justify-content-end">
                                                                                                                            <Col className="col-row">
                                                                                                                                <Button
                                                                                                                                    title="Ver todos os licenciamentos para esse usuário."
                                                                                                                                    variant="success"
                                                                                                                                    onClick={() => handleRoute(`/licensings?user=${userData.id}`)}
                                                                                                                                >
                                                                                                                                    Ver mais <FaAngleRight />
                                                                                                                                </Button>
                                                                                                                            </Col>
                                                                                                                        </Row>
                                                                                                                    </Col>
                                                                                                                </> :
                                                                                                                    <Col>
                                                                                                                        <Row className="justify-content-center">
                                                                                                                            <Col className="col-row">
                                                                                                                                <span className="text-success">Nenhum licenciamento encontrado.</span>
                                                                                                                            </Col>
                                                                                                                        </Row>
                                                                                                                    </Col>
                                                                                                            }
                                                                                                        </> : <Col sm={4}>
                                                                                                            <AlertMessage status="error" />
                                                                                                        </Col>
                                                                                                    }
                                                                                                </>
                                                                                        }
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                        </Tab>
                                                                    }
                                                                </Tabs>

                                                                {
                                                                    can(user, "users", "view") && <>
                                                                        <Col className="border-top mt-5 mb-3"></Col>

                                                                        <Accordion>
                                                                            <Accordion.Item eventKey="0">
                                                                                <Accordion.Header><h6 className="text-success">Acessos <FaFingerprint /></h6></Accordion.Header>
                                                                                <Accordion.Body>
                                                                                    <Table striped hover size="sm" responsive>
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th>Data</th>
                                                                                                <th>Item</th>
                                                                                                <th>Descrição</th>
                                                                                                <th>Acesso</th>
                                                                                                <th>IP</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {
                                                                                                userData.logs.map(log => {
                                                                                                    return <tr key={log.id}>
                                                                                                        <td>{format(new Date(log.accessed_at), 'dd/MM/yyyy HH:mm')}</td>
                                                                                                        <td>{translateRole(log.item)}</td>
                                                                                                        <td>{log.description}</td>
                                                                                                        <td>{translateGrant(log.action)}</td>
                                                                                                        <td>{log.client_ip}</td>
                                                                                                    </tr>
                                                                                                })
                                                                                            }
                                                                                        </tbody>
                                                                                    </Table>
                                                                                </Accordion.Body>
                                                                            </Accordion.Item>
                                                                        </Accordion>
                                                                    </>
                                                                }

                                                            </Col>
                                                        </Row>
                                                    </Container>
                                            }
                                        </>
                                }
                            </> :
                                <PageWaiting status="warning" message="Acesso negado!" />
                        }
                    </>
            }
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { token } = context.req.cookies;

    const tokenVerified = await TokenVerify(token);

    if (tokenVerified === "not-authorized") { // Not authenticated, token invalid!
        return {
            redirect: {
                destination: `/?returnto=${context.req.url}`,
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