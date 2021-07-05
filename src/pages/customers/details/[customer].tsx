import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Button, ButtonGroup, Col, Container, ListGroup, Row, Tabs, Tab } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaAngleRight,
    FaFileAlt,
    FaIdCard,
    FaExclamationCircle,
    FaStickyNote,
    FaCheck,
    FaPencilAlt,
    FaRegFile,
} from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { can } from '../../../components/Users';
import { Customer } from '../../../components/Customers';
import Members from '../../../components/CustomerMembers';
import { DocsCustomer } from '../../../components/DocsCustomer';
import { Property } from '../../../components/Properties';
import { Project } from '../../../components/Projects';
import { Licensing } from '../../../components/Licensings';
import PropertyListItem from '../../../components/PropertyListItem';
import ProjectListItem from '../../../components/ProjectListItem';
import LicensingListItem from '../../../components/LicensingListItem';
import CustomerAttachments from '../../../components/CustomerAttachments';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage } from '../../../components/interfaces/AlertMessage';

import styles from './styles.module.css';

export default function CustomerDetails() {
    const router = useRouter();
    const { customer } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [customerData, setCustomerData] = useState<Customer>();
    const [documentType, setDocumentType] = useState("CPF");

    const [loadingData, setLoadingData] = useState(true);
    const [hasErrors, setHasErrors] = useState(false);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    // Relations tabs.
    const [tabKey, setTabKey] = useState('properties');

    const [loadingProperties, setLoadingProperties] = useState(false);
    const [propertiesData, setPropertiesData] = useState<Property[]>([]);
    const [propertiesErrorShow, setPropertiesErrorShow] = useState(false);

    const [loadingProjects, setLoadingProjects] = useState(false);
    const [projectsData, setProjectsData] = useState<Project[]>([]);
    const [projectsErrorShow, setProjectsErrorShow] = useState(false);

    const [loadingLicensings, setLoadingLicensings] = useState(false);
    const [licensingsData, setLicensingsData] = useState<Licensing[]>([]);
    const [licensingsErrorShow, setLicensingsErrorShow] = useState(false);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('customers-index');

        if (user) {
            if (can(user, "customers", "read:any")) {
                if (customer) {
                    api.get(`customers/${customer}`).then(res => {
                        let customerRes: Customer = res.data;

                        if (customerRes.document.length > 14)
                            setDocumentType("CNPJ");

                        api.get('docs/customer').then(res => {
                            let docsCustomer: DocsCustomer[] = res.data;

                            docsCustomer = docsCustomer.filter(docCustomer => { return docCustomer.active });

                            customerRes = {
                                ...customerRes, docs: docsCustomer.map(docCustomer => {
                                    const customerDoc = customerRes.docs.find(customerDoc => { return customerDoc.doc.id === docCustomer.id });

                                    if (customerDoc)
                                        return { ...customerDoc, customer: customerRes };

                                    return {
                                        id: '0',
                                        path: '',
                                        received_at: new Date(),
                                        checked: false,
                                        customer: customerRes,
                                        doc: docCustomer,
                                    };
                                })
                            }

                            setCustomerData(customerRes);
                            setLoadingData(false);
                        }).catch(err => {
                            console.log('Error to get docs customer to edit, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });
                    }).catch(err => {
                        console.log('Error to get customer: ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });
                }
            }
        }
    }, [user, customer]);

    useEffect(() => {
        if (customer) {
            if (tabKey === "properties") {
                setPropertiesErrorShow(false);
                setLoadingProperties(true);

                api.get(`properties?customer=${customer}`).then(res => {
                    setPropertiesData(res.data);

                    setLoadingProperties(false);
                }).catch(err => {
                    console.log('Error to get properties on customer, ', err);
                    setPropertiesErrorShow(true);

                    setLoadingProperties(false);
                });

                return;
            }

            if (tabKey === "projects") {
                setProjectsErrorShow(false);
                setLoadingProjects(true);

                api.get(`projects?customer=${customer}`).then(res => {
                    setProjectsData(res.data);

                    setLoadingProjects(false);
                }).catch(err => {
                    console.log('Error to get projects on customer, ', err);
                    setProjectsErrorShow(true);

                    setLoadingProjects(false);
                });

                return;
            }

            if (tabKey === "licensings") {
                setLicensingsErrorShow(false);
                setLoadingLicensings(true);

                api.get(`licensings?customer=${customer}`).then(res => {
                    setLicensingsData(res.data);

                    setLoadingLicensings(false);
                }).catch(err => {
                    console.log('Error to get licensings on customer, ', err);
                    setLicensingsErrorShow(true);

                    setLoadingLicensings(false);
                });

                return;
            }
        }
    }, [customer, tabKey]);

    function handleRoute(route: string) {
        router.push(route);
    }

    return !user || loading ? <PageWaiting status="waiting" /> :
        <>
            {
                can(user, "customers", "read:any") ? <>
                    {
                        loadingData || hasErrors ? <PageWaiting
                            status={typeLoadingMessage}
                            message={textLoadingMessage}
                        /> :
                            <>
                                {
                                    !customerData ? <PageWaiting status="waiting" /> :
                                        <Container className="content-page">
                                            <Row>
                                                <Col>
                                                    <Row className="mb-3">
                                                        <Col>
                                                            <PageBack href="/customers" subTitle="Voltar para a lista de clientes" />
                                                        </Col>

                                                        <Col className="col-row">
                                                            <ButtonGroup className="col-12">
                                                                <Button
                                                                    title="Editar cliente."
                                                                    variant="success"
                                                                    onClick={() => handleRoute(`/customers/edit/${customerData.id}`)}
                                                                >
                                                                    <FaPencilAlt />
                                                                </Button>
                                                            </ButtonGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col>
                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-success">Membros</h6>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                {
                                                                    customerData.members.map(member => {
                                                                        return <Members
                                                                            key={member.id}
                                                                            member={member}
                                                                            canRemove={false}
                                                                        />
                                                                    })
                                                                }
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col sm={6}>
                                                            <Row className="align-items-center">
                                                                <Col className="col-row">
                                                                    <h3 className="form-control-plaintext text-success">{customerData.name}</h3>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={4} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">{documentType}</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.document}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={2} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Nascimento</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{format(new Date(customerData.birth), 'dd/MM/yyyy')}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col sm={3}>
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Telefone comercial</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.phone}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={3} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Celular</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.cellphone}</h6>
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
                                                                    <h6 className="text-secondary">{customerData.email}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col sm={8}>
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Outros contatos</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.contacts}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={4} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Responsável</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.owner}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col sm={6}>
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Endereço</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.address}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={4} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Cidade</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.city}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={2} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Estado</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.state}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col >
                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-success">Observação {customerData.warnings && <FaStickyNote />}</h6>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <span className="text-secondary text-wrap">{customerData.notes}</span>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    {
                                                        customerData.warnings && <Row className="mb-3">
                                                            <Col >
                                                                <Row>
                                                                    <Col>
                                                                        <h6 className="text-success">Pendências {customerData.warnings && <FaExclamationCircle />}</h6>
                                                                    </Col>
                                                                </Row>

                                                                <Row>
                                                                    <Col>
                                                                        <span className="text-secondary text-wrap">{customerData.warnings_text}</span>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                    }

                                                    <Row className="mb-3">
                                                        <Col>
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Tipo</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.type.name}</h6>
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
                                                                    <h6 className="text-secondary">{format(new Date(customerData.created_at), 'dd/MM/yyyy')}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={4} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Usuário</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.created_by}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col>
                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-success">Documentação <FaIdCard /></h6>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <ListGroup className="mb-3">
                                                                        {
                                                                            customerData.docs.map((doc, index) => {
                                                                                return <ListGroup.Item key={index} action as="div" variant="light">
                                                                                    <Row>
                                                                                        <Col className={`${doc.checked ? 'text-success' : ''}`} sm={8}>
                                                                                            {
                                                                                                doc.checked ? <FaCheck /> :
                                                                                                    <FaRegFile />} <label>{doc.doc.name} </label>
                                                                                        </Col>

                                                                                        {
                                                                                            doc.checked && <>
                                                                                                <Col sm={2}>Data do recebimento</Col>

                                                                                                <Col sm={2}>
                                                                                                    {format(new Date(doc.received_at), 'dd/MM/yyyy')}
                                                                                                </Col>
                                                                                            </>
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

                                                    <Row className="mb-3">
                                                        <Col>
                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-success">Anexos <FaFileAlt /></h6>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                {
                                                                    !!customerData.attachments.length ? <Col>
                                                                        <ListGroup>
                                                                            {
                                                                                customerData.attachments.map((attachment, index) => {
                                                                                    return <CustomerAttachments
                                                                                        key={index}
                                                                                        attachment={attachment}
                                                                                        canEdit={false}
                                                                                    />
                                                                                })
                                                                            }
                                                                        </ListGroup>
                                                                    </Col> :
                                                                        <Col>
                                                                            <AlertMessage
                                                                                status="warning"
                                                                                message="Nenhum anexo enviado para esse cliente."
                                                                            />
                                                                        </Col>
                                                                }
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Col className="border-top mb-3"></Col>

                                                    <Tabs
                                                        id="relations-tabs"
                                                        defaultActiveKey="properties"
                                                        onSelect={(k) => setTabKey(k)}
                                                    >
                                                        <Tab eventKey="properties" title="Imóveis">
                                                            <Row className={styles.relationsContainer}>
                                                                <Col>
                                                                    <Row className={`justify-content-center ${styles.relationsContent}`}>
                                                                        {
                                                                            loadingProperties ? <Col sm={4}>
                                                                                <AlertMessage status="waiting" />
                                                                            </Col> :
                                                                                <>
                                                                                    {
                                                                                        !propertiesErrorShow ? <>
                                                                                            {
                                                                                                !!propertiesData.length ? <>
                                                                                                    {
                                                                                                        propertiesData.map((property, index) => {
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
                                                                                                                    title="Ver todos os imóveis para esse cliente."
                                                                                                                    variant="success"
                                                                                                                    onClick={() => handleRoute(`/properties?customer=${customerData.id}`)}
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

                                                        <Tab eventKey="projects" title="Projetos">
                                                            <Row className={styles.relationsContainer}>
                                                                <Col>
                                                                    <Row className={`justify-content-center ${styles.relationsContent}`}>
                                                                        {
                                                                            loadingProjects ? <Col sm={4}>
                                                                                <AlertMessage status="waiting" />
                                                                            </Col> :
                                                                                <>
                                                                                    {
                                                                                        !projectsErrorShow ? <>
                                                                                            {
                                                                                                !!projectsData.length ? <>
                                                                                                    {
                                                                                                        projectsData.map((project, index) => {
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
                                                                                                                    title="Ver todos os projetos para esse cliente."
                                                                                                                    variant="success"
                                                                                                                    onClick={() => handleRoute(`/projects?customer=${customerData.id}`)}
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

                                                        <Tab eventKey="licensings" title="Licenciamentos">
                                                            <Row className={styles.relationsContainer}>
                                                                <Col>
                                                                    <Row className={`justify-content-center ${styles.relationsContent}`}>
                                                                        {
                                                                            loadingLicensings ? <Col sm={4}>
                                                                                <AlertMessage status="waiting" />
                                                                            </Col> :
                                                                                <>
                                                                                    {
                                                                                        !licensingsErrorShow ? <>
                                                                                            {
                                                                                                !!licensingsData.length ? <>
                                                                                                    {
                                                                                                        licensingsData.map((licensing, index) => {
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
                                                                                                                    title="Ver todos os licenciamentos para esse cliente."
                                                                                                                    variant="success"
                                                                                                                    onClick={() => handleRoute(`/licensings?customer=${customerData.id}`)}
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
                                                                                                                <span className="text-success">Nenhum licenciamentol encontrado.</span>
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
                                                    </Tabs>
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