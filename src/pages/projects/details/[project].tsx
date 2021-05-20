import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Col, Container, ListGroup, Row, Tabs, Tab } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaLongArrowAltLeft,
    FaIdCard,
    FaExclamationCircle,
    FaCheck,
    FaMapSigns,
    FaPencilAlt,
    FaPlus,
    FaPlusSquare,
    FaRegFile
} from 'react-icons/fa';

import api from '../../../services/api';
import { Project } from '../../../components/Projects';
import ProjectListItem from '../../../components/ProjectListItem';

import styles from './styles.module.css';

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

    return <Container className="content-page">
        {
            !projectData ? <h1>Aguarde...</h1> :
                <Row>
                    <Col>
                        <Row className="mb-3">
                            <Link href="/projects">
                                <a title="Voltar para a lista de projetos" data-title="Voltar para a lista de projetos">
                                    <FaLongArrowAltLeft /> voltar
                                </a>
                            </Link>
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
                                        <h6 className="text-secondary">{projectData.value}</h6>
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
                                        <span className="text-success">Acordo</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <h6 className="text-secondary">{projectData.deal}</h6>
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

                        <Row className="mb-3">
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

                        <Col className="border-top mb-3"></Col>

                        <Tabs defaultActiveKey="projects" id="relations-customer">
                            <Tab eventKey="projects" title="Projetos">
                                <Row className={styles.relationsContainer}>
                                    <Col>
                                        <Row className={styles.relationsButtonsContent}>
                                            <Col>
                                                <Link href={`/projects/new/customer/${projectData.id}`}>
                                                    <a
                                                        className="btn btn-outline-success"
                                                        title="Criar um novo projeto para esse cliente"
                                                        data-title="Criar um novo projeto para esse cliente"
                                                    >
                                                        <FaPlus /> Criar um projeto
                                                    </a>
                                                </Link>
                                            </Col>
                                        </Row>

                                        <Row className={styles.relationsContent}>
                                            <Col>
                                                <span className="text-success">Nenhum projeto registrado.</span>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Tab>

                            <Tab eventKey="projects" title="Outros projetos">
                                <Row className={styles.relationsContainer}>
                                    <Col>
                                        <Row className={styles.relationsButtonsContent}>
                                            <Col>
                                                <Link href={`/projects/new?customer=${projectData.customer.id}`}>
                                                    <a
                                                        className="btn btn-outline-success"
                                                        title="Criar um novo projeto para este cliente."
                                                        data-title="Criar um novo projeto para este cliente."
                                                    >
                                                        <FaPlus /> Criar um projeto
                                                    </a>
                                                </Link>
                                            </Col>
                                        </Row>

                                        <Row className={styles.relationsContent}>
                                            {
                                                projectData.customer.projects.length > 0 ? projectData.customer.projects.map((project, index) => {
                                                    return <ProjectListItem
                                                        key={index}
                                                        project={project}
                                                        showCustomer={false}
                                                    />
                                                }) :
                                                    <Col>
                                                        <span className="text-success">Nenhum projecto registrado.</span>
                                                    </Col>
                                            }
                                        </Row>
                                    </Col>
                                </Row>
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
        }
    </Container>
}