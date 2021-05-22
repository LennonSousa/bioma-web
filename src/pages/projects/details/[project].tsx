import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Col, Container, ListGroup, Row } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaExclamationCircle,
    FaHistory,
    FaMapSigns,
    FaPencilAlt,
    FaPlusSquare,
} from 'react-icons/fa';

import api from '../../../services/api';
import { Project } from '../../../components/Projects';
import EventsProject from '../../../components/EventsProject';
import PageBack from '../../../components/PageBack';
import { AlertMessage } from '../../../components/interfaces/AlertMessage';

export default function PropertyDetails() {
    const router = useRouter();
    const { project } = router.query;

    const [projectData, setProjectData] = useState<Project>();

    useEffect(() => {
        if (project) {
            api.get(`projects/${project}`).then(res => {
                setProjectData(res.data);
            }).catch(err => {
                console.log('Error to get project: ', err);
            });
        }
    }, [project]);

    async function handleListEvents() { }

    return <Container className="content-page">
        {
            !projectData ? <h1>Aguarde...</h1> :
                <Row>
                    <Col>
                        <Row className="mb-3">
                            <Col>
                                <PageBack href="/projects" subTitle="Voltar para a lista de projetos" />
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col sm={6}>
                                <Row className="align-items-center">
                                    <Col>
                                        <h3 className="form-control-plaintext text-success">{projectData.customer.name}</h3>
                                    </Col>

                                    <Col>
                                        <Link href={`/projects/edit/${projectData.id}`}>
                                            <a title="Editar" data-title="Editar"><FaPencilAlt /></a>
                                        </Link>
                                    </Col>

                                    <Col>
                                        <Link href={`/projects/new?customer=${projectData.customer.id}`}>
                                            <a
                                                title="Criar um novo imóvel para este cliente"
                                                data-title="Criar um novo imóvel para este cliente"
                                            >
                                                <FaPlusSquare /><FaMapSigns />
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
                                        <span className="text-success">Tipo de projeto/processo</span>
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
                                        <h6 className="text-secondary">{projectData.property.name}</h6>
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

                            <Col sm={4} >
                                <Row>
                                    <Col>
                                        <span className="text-success">Situação do projeto/processo</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <h6 className="text-secondary">{projectData.status.name}</h6>
                                    </Col>
                                </Row>
                            </Col>

                            <Col sm={4} >
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
                        </Row>

                        <Row className="mb-3">
                            <Col sm={4}>
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
                                        <span className="text-success">Data de criação</span>
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
                                        <span className="text-success">Última atualização</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <h6 className="text-secondary">{format(new Date(projectData.updated_at), 'dd/MM/yyyy')}</h6>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        {
                            projectData.warnings && <Row className="mb-3">
                                <Col >
                                    <Row>
                                        <Col>
                                            <h6 className="text-success">Observação {projectData.warnings && <FaExclamationCircle />}</h6>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <span className="text-secondary text-wrap">{projectData.notes}</span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        }

                        <Col className="border-top mt-3 mb-3"></Col>

                        <Row className="mb-3">
                            <Col>
                                <Row>
                                    <Col>
                                        <h6 className="text-success">Histórico <FaHistory /></h6>
                                    </Col>
                                </Row>

                                <Row className="mt-2">
                                    {
                                        projectData.events.length > 0 ? <Col>
                                            <Row className="mb-2" style={{ padding: '0 1rem' }}>
                                                <Col sm={5}>
                                                    <h6>Descrição</h6>
                                                </Col>

                                                <Col className="text-center">
                                                    <h6>Data de registro</h6>
                                                </Col>

                                                <Col className="text-center">
                                                    <h6>Conluído</h6>
                                                </Col>

                                                <Col className="text-center">
                                                    <h6>Data de conclusão</h6>
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
                                                                    handleListEvents={handleListEvents}
                                                                    canEdit={false}
                                                                />
                                                            })
                                                        }
                                                    </ListGroup>
                                                </Col>
                                            </Row>
                                        </Col> :
                                            <AlertMessage
                                                status="warning"
                                                message="Nenhum evento registrado para esse projeto."
                                            />
                                    }
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
        }
    </Container>
}