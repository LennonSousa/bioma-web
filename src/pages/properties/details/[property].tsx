import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { Button, ButtonGroup, Col, Container, ListGroup, Row, Tabs, Tab } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaAngleRight,
    FaIdCard,
    FaExclamationCircle,
    FaCheck,
    FaMapSigns,
    FaPencilAlt,
    FaPlus,
    FaFileAlt,
    FaRegFile,
    FaStickyNote,
} from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { can } from '../../../components/Users';
import { Property } from '../../../components/Properties';
import { Project } from '../../../components/Projects';
import Members from '../../../components/PropertyMembers';
import PropertyListItem from '../../../components/PropertyListItem';
import ProjectListItem from '../../../components/ProjectListItem';
import { DocsProperty } from '../../../components/DocsProperty';
import PropertyAttachments from '../../../components/PropertyAttachments';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage } from '../../../components/Interface/AlertMessage';

import styles from './styles.module.css';

export default function PropertyDetails() {
    const router = useRouter();
    const { property } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [propertyData, setPropertyData] = useState<Property>();

    const [loadingData, setLoadingData] = useState(true);
    const [hasErrors, setHasErrors] = useState(false);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    // Relations tabs.
    const [tabKey, setTabKey] = useState('projects');

    const [loadingProperties, setLoadingProperties] = useState(false);
    const [propertiesData, setPropertiesData] = useState<Property[]>([]);
    const [propertiesErrorShow, setPropertiesErrorShow] = useState(false);

    const [loadingProjects, setLoadingProjects] = useState(false);
    const [projectsData, setProjectsData] = useState<Project[]>([]);
    const [projectsErrorShow, setProjectsErrorShow] = useState(false);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('properties-index');

        if (user) {
            if (can(user, "properties", "read:any")) {
                if (property) {

                    api.get(`properties/${property}`).then(res => {
                        let propertyRes: Property = res.data;

                        api.get('docs/property').then(res => {
                            let docsProperty: DocsProperty[] = res.data;

                            docsProperty = docsProperty.filter(docProperty => { return docProperty.active });

                            propertyRes = {
                                ...propertyRes, docs: docsProperty.map(docProperty => {
                                    const propertyDoc = propertyRes.docs.find(propertyDoc => { return propertyDoc.doc.id === docProperty.id });

                                    if (propertyDoc)
                                        return { ...propertyDoc, property: propertyRes };

                                    return {
                                        id: '0',
                                        path: '',
                                        received_at: new Date(),
                                        checked: false,
                                        property: propertyRes,
                                        doc: docProperty,
                                    };
                                })
                            }

                            setPropertyData(propertyRes);
                            setLoadingData(false);
                        }).catch(err => {
                            console.log('Error to get docs property to edit, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });
                    }).catch(err => {
                        console.log('Error to get property: ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });
                }
            }
        }
    }, [user, property]);

    useEffect(() => {
        if (propertyData) {
            if (tabKey === "properties") {
                setPropertiesErrorShow(false);
                setLoadingProperties(true);

                api.get(`properties?customer=${propertyData.customer.id}`).then(res => {
                    setPropertiesData(res.data);

                    setLoadingProperties(false);
                }).catch(err => {
                    console.log('Error to get properties on property, ', err);
                    setPropertiesErrorShow(true);

                    setLoadingProperties(false);
                });

                return;
            }

            if (tabKey === "projects") {
                setProjectsErrorShow(false);
                setLoadingProjects(true);

                api.get(`projects?property=${propertyData.id}`).then(res => {
                    setProjectsData(res.data);

                    setLoadingProjects(false);
                }).catch(err => {
                    console.log('Error to get projects on property, ', err);
                    setProjectsErrorShow(true);

                    setLoadingProjects(false);
                });

                return;
            }
        }
    }, [propertyData, tabKey]);

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <>
            <NextSeo
                title="Detalhes do imóvel"
                description="Detalhes do imóvel da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Detalhes do imóvel',
                    description: 'Detalhes do imóvel da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Detalhes do imóvel | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "properties", "read:any") ? <>
                                {
                                    loadingData || hasErrors ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !propertyData ? <PageWaiting status="waiting" /> :
                                                    <Container className="content-page">
                                                        <Row>
                                                            <Col>
                                                                <Row className="mb-3">
                                                                    <Col>
                                                                        <PageBack href="/properties" subTitle="Voltar para a lista de imóveis" />
                                                                    </Col>

                                                                    <Col className="col-row">
                                                                        <ButtonGroup className="col-12">
                                                                            <Button
                                                                                title="Editar imóvel."
                                                                                variant="success"
                                                                                onClick={() => handleRoute(`/properties/edit/${propertyData.id}`)}
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
                                                                                propertyData.members.map(member => {
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
                                                                                <h3 className="form-control-plaintext text-success">{propertyData.name}</h3>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={6} >
                                                                        <Row>
                                                                            <Col className="col-row">
                                                                                <Row>
                                                                                    <Col>
                                                                                        <span className="text-success">Cliente</span>
                                                                                    </Col>
                                                                                </Row>

                                                                                <Row>
                                                                                    <Col>
                                                                                        <Link href={`/customers/details/${propertyData.customer.id}`}>
                                                                                            <a title="Ir para detalhes do cliente." data-title="Ir para detalhes do cliente.">
                                                                                                <h6 className="text-secondary">{propertyData.customer.name}</h6>
                                                                                            </a>
                                                                                        </Link>
                                                                                    </Col>
                                                                                </Row>
                                                                            </Col>

                                                                            <Col className="col-row">
                                                                                <ButtonGroup size="sm" className="col-12">
                                                                                    <Button
                                                                                        variant="success"
                                                                                        title="Criar um novo imóvel para este cliente."
                                                                                        onClick={() => handleRoute(`/properties/new?customer=${propertyData.customer.id}`)}
                                                                                    >
                                                                                        <FaPlus /><FaMapSigns />
                                                                                    </Button>
                                                                                </ButtonGroup>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={4}>
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Matrícula</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{propertyData.registration}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Área</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{propertyData.area}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Coordenadas</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{propertyData.coordinates}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Cidade</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{propertyData.city}</h6>
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
                                                                                <h6 className="text-secondary">{propertyData.state}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col>
                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-success">Roteiro</h6>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-secondary text-wrap">{propertyData.route}</span>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col >
                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-success">Observação {propertyData.warnings && <FaStickyNote />}</h6>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-secondary text-wrap">{propertyData.notes}</span>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                {
                                                                    propertyData.warnings && <Row className="mb-3">
                                                                        <Col >
                                                                            <Row>
                                                                                <Col>
                                                                                    <h6 className="text-success">Pendências {propertyData.warnings && <FaExclamationCircle />}</h6>
                                                                                </Col>
                                                                            </Row>

                                                                            <Row>
                                                                                <Col>
                                                                                    <span className="text-secondary text-wrap">{propertyData.warnings_text}</span>
                                                                                </Col>
                                                                            </Row>
                                                                        </Col>
                                                                    </Row>
                                                                }

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
                                                                                <h6 className="text-secondary">{format(new Date(propertyData.created_at), 'dd/MM/yyyy')}</h6>
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
                                                                                <h6 className="text-secondary">{propertyData.created_by}</h6>
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
                                                                                        propertyData.docs.map((doc, index) => {
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
                                                                                !!propertyData.attachments.length ? <Col>
                                                                                    <ListGroup>
                                                                                        {
                                                                                            propertyData.attachments.map((attachment, index) => {
                                                                                                return <PropertyAttachments
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
                                                                                            message="Nenhum anexo enviado para esse imóvel."
                                                                                        />
                                                                                    </Col>
                                                                            }
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Col className="border-top mb-3"></Col>

                                                                <Tabs
                                                                    id="relations-tabs"
                                                                    defaultActiveKey="projects"
                                                                    onSelect={(k) => k && setTabKey(k)}
                                                                >
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
                                                                                                                                title="Ver todos os projetos para esse imóvel."
                                                                                                                                variant="success"
                                                                                                                                onClick={() => handleRoute(`/projects?property=${propertyData.id}`)}
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

                                                                    <Tab eventKey="properties" title="Outros imóveis">
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
                                                                                                                                onClick={() => handleRoute(`/properties?customer=${propertyData.customer.id}`)}
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