import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { Col, Container, Button, ButtonGroup, ListGroup, Row } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaCheck,
    FaExclamationCircle,
    FaFileAlt,
    FaHistory,
    FaIdCard,
    FaPencilAlt,
    FaPlus,
    FaRegFile,
    FaUserTie,
    FaStickyNote,
} from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { can } from '../../../components/Users';
import { Project } from '../../../components/Projects';
import Members from '../../../components/ProjectMembers';
import { DocsProject } from '../../../components/DocsProject';
import EventsProject from '../../../components/EventsProject';
import ProjectAttachments from '../../../components/ProjectAttachments';
import PageBack from '../../../components/PageBack';
import { AlertMessage } from '../../../components/Interfaces/AlertMessage';
import { PageWaiting, PageType } from '../../../components/PageWaiting';

export default function PropertyDetails() {
    const router = useRouter();
    const { project } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [projectData, setProjectData] = useState<Project>();

    const [loadingData, setLoadingData] = useState(true);
    const [hasErrors, setHasErrors] = useState(false);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    useEffect(() => {
        if (user) {
            handleItemSideBar('projects');
            handleSelectedMenu('projects-index');

            if (can(user, "projects", "read:any")) {
                if (project) {

                    api.get(`projects/${project}`).then(res => {
                        let projecRes: Project = res.data;

                        api.get('docs/project').then(res => {
                            let docsProject: DocsProject[] = res.data;

                            docsProject = docsProject.filter(docProject => { return docProject.active });

                            projecRes = {
                                ...projecRes, docs: docsProject.map(docProject => {
                                    const projectDoc = projecRes.docs.find(projectDoc => { return projectDoc.doc.id === docProject.id });

                                    if (projectDoc)
                                        return { ...projectDoc, project: projecRes };

                                    return {
                                        id: '0',
                                        path: '',
                                        received_at: new Date(),
                                        checked: false,
                                        project: projecRes,
                                        doc: docProject,
                                    };
                                })
                            }

                            setProjectData(projecRes);
                            setLoadingData(false);
                        }).catch(err => {
                            console.log('Error to get docs project to edit, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });
                    }).catch(err => {
                        console.log('Error to get project: ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });
                }
            }
        }
    }, [user, project]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <>
            <NextSeo
                title="Detalhes do projeto"
                description="Detalhes do projeto da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Detalhes do projeto',
                    description: 'Detalhes do projeto da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Detalhes do projeto | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "projects", "read:any") ? <>
                                {
                                    loadingData || hasErrors ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !projectData ? <PageWaiting status="waiting" /> :
                                                    <Container className="content-page">
                                                        <Row>
                                                            <Col>
                                                                <Row className="mb-3">
                                                                    <Col>
                                                                        <PageBack href="/projects" subTitle="Voltar para a lista de projetos" />
                                                                    </Col>

                                                                    <Col className="col-row">
                                                                        <ButtonGroup className="col-12">
                                                                            <Button
                                                                                title="Editar projeto."
                                                                                variant="success"
                                                                                onClick={() => handleRoute(`/projects/edit/${projectData.id}`)}
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
                                                                                projectData.members.map(member => {
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
                                                                                <Link href={`/customers/details/${projectData.customer.id}`}>
                                                                                    <a title="Ir para detalhes do cliente." data-title="Ir para detalhes do cliente.">
                                                                                        <h3 className="form-control-plaintext text-success">{projectData.customer.name}</h3>
                                                                                    </a>
                                                                                </Link>
                                                                            </Col>

                                                                            <Col className="col-row">
                                                                                <ButtonGroup size="sm" className="col-12">
                                                                                    <Button
                                                                                        variant="success"
                                                                                        title="Criar um novo projeto para este cliente."
                                                                                        onClick={() => handleRoute(`/projects/new?customer=${projectData.customer.id}`)}
                                                                                    >
                                                                                        <FaPlus /><FaFileAlt />
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
                                                                                <span className="text-success">Tipo de projeto</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{projectData.type.name}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Linha de crédito</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{projectData.line.name}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Fazenda/imóvel</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <Link href={`/properties/details/${projectData.property.id}`}>
                                                                                    <a title="Ir para detalhes do imóvel." data-title="Ir para detalhes do imóvel.">
                                                                                        <h6 className="text-secondary">{projectData.property.name}</h6>
                                                                                    </a>
                                                                                </Link>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={4}>
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Banco</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <Link href={`/banks/details/${projectData.bank.id}`}>
                                                                                    <a title="Ir para detalhes do banco." data-title="Ir para detalhes do banco.">
                                                                                        <h6 className="text-secondary">{`${projectData.bank.institution.name} - ${projectData.bank.sector}`}</h6>
                                                                                    </a>
                                                                                </Link>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Analista no banco</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{projectData.analyst}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Contatos do analista</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary text-wrap">{projectData.analyst_contact}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={4}>
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Valor</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6
                                                                                    className="text-secondary"
                                                                                >
                                                                                    {`R$ ${Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(projectData.value)}`}
                                                                                </h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={3} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Acordo %</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{String(projectData.deal).replace(".", ",")}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={2} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Pago?</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{projectData.paid ? "Sim" : "Não"}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    {
                                                                        projectData.paid && <Col sm={3} >
                                                                            <Row>
                                                                                <Col>
                                                                                    <span className="text-success">Data do pagemento</span>
                                                                                </Col>
                                                                            </Row>

                                                                            <Row>
                                                                                <Col>
                                                                                    <h6 className="text-secondary">{format(new Date(projectData.paid_date), 'dd/MM/yyyy')}</h6>
                                                                                </Col>
                                                                            </Row>
                                                                        </Col>
                                                                    }
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={2}>
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Contrato</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{projectData.contract}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Situação do projeto</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{projectData.status.name}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col >
                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-success">Observação {projectData.warnings && <FaStickyNote />}</h6>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-secondary text-wrap">{projectData.notes}</span>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                {
                                                                    projectData.warnings && <Row className="mb-3">
                                                                        <Col >
                                                                            <Row>
                                                                                <Col>
                                                                                    <h6 className="text-success">Pendências {projectData.warnings && <FaExclamationCircle />}</h6>
                                                                                </Col>
                                                                            </Row>

                                                                            <Row>
                                                                                <Col>
                                                                                    <span className="text-secondary text-wrap">{projectData.warnings_text}</span>
                                                                                </Col>
                                                                            </Row>
                                                                        </Col>
                                                                    </Row>
                                                                }

                                                                <Col className="border-top mt-3 mb-3"></Col>

                                                                <Row className="mb-3">
                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Criado em</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{format(new Date(projectData.created_at), 'dd/MM/yyyy')}</h6>
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
                                                                                <h6 className="text-secondary">{projectData.created_by}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Última atualização</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{format(new Date(projectData.updated_at), 'dd/MM/yyyy')}</h6>
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
                                                                                <h6 className="text-secondary">{projectData.updated_by}</h6>
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
                                                                                        projectData.docs.map((doc, index) => {
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
                                                                                !!projectData.attachments.length ? <Col>
                                                                                    <ListGroup>
                                                                                        {
                                                                                            projectData.attachments.map((attachment, index) => {
                                                                                                return <ProjectAttachments
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
                                                                                            message="Nenhum anexo enviado para esse projeto."
                                                                                        />
                                                                                    </Col>
                                                                            }
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col>
                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-success">Histórico <FaHistory /></h6>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row className="mt-2">
                                                                            {
                                                                                !!projectData.events.length ? <Col>
                                                                                    <Row className="mb-2" style={{ padding: '0 1rem' }}>
                                                                                        <Col sm={10}>
                                                                                            <h6>Descrição</h6>
                                                                                        </Col>

                                                                                        <Col className="text-center">
                                                                                            <h6>Data de registro</h6>
                                                                                        </Col>
                                                                                    </Row>

                                                                                    <Row>
                                                                                        <Col>
                                                                                            <ListGroup>
                                                                                                {
                                                                                                    projectData.events.map((event, index) => {
                                                                                                        return <EventsProject
                                                                                                            key={index}
                                                                                                            event={event}
                                                                                                            canEdit={false}
                                                                                                        />
                                                                                                    })
                                                                                                }
                                                                                            </ListGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col> :
                                                                                    <Col>
                                                                                        <AlertMessage
                                                                                            status="warning"
                                                                                            message="Nenhum evento registrado para esse projeto."
                                                                                        />
                                                                                    </Col>
                                                                            }
                                                                        </Row>
                                                                    </Col>
                                                                </Row>
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