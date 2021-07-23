import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { Button, ButtonGroup, Col, Container, Row, Tabs, Tab } from 'react-bootstrap';
import { FaAngleRight, FaPencilAlt, FaPlus } from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { can } from '../../../components/Users';
import { Bank } from '../../../components/Banks';
import { Project } from '../../../components/Projects';
import ProjectListItem from '../../../components/ProjectListItem';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage } from '../../../components/interfaces/AlertMessage';

import styles from './styles.module.css';

export default function BankDetails() {
    const router = useRouter();
    const { bank } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [bankData, setBankData] = useState<Bank>();

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    // Relations tabs.
    const [tabKey, setTabKey] = useState('properties');

    const [loadingProjects, setLoadingProjects] = useState(false);
    const [projectsData, setProjectsData] = useState<Project[]>([]);
    const [projectsErrorShow, setProjectsErrorShow] = useState(false);

    useEffect(() => {
        handleItemSideBar('banks');
        handleSelectedMenu('banks-index');

        if (user) {
            if (can(user, "banks", "read:any")) {
                if (bank) {
                    api.get(`banks/${bank}`).then(res => {
                        setBankData(res.data);

                        setLoadingData(false);
                    }).catch(err => {
                        console.log('Error to get bank to edit, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    });
                }
            }
        }
    }, [user, bank]);

    useEffect(() => {
        if (tabKey === "projects") {
            setProjectsErrorShow(false);
            setLoadingProjects(true);

            api.get(`projects?bank=${bank}`).then(res => {
                setProjectsData(res.data);

                setLoadingProjects(false);
            }).catch(err => {
                console.log('Error to get projects on bank, ', err);
                setProjectsErrorShow(true);

                setLoadingProjects(false);
            });

            return;
        }
    }, [bank, tabKey]);

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <>
            <NextSeo
                title="Detalhe do banco"
                description="Detalhe do banco da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Detalhe do banco',
                    description: 'Detalhe do banco da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Detalhe do banco | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "banks", "read:any") ? <>
                                {
                                    loadingData ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !bankData ? <PageWaiting status="waiting" /> :
                                                    <Container className="content-page">
                                                        <Row>
                                                            <Col>
                                                                <Row className="mb-3">
                                                                    <Col>
                                                                        <PageBack href="/banks" subTitle="Voltar para a lista de bancos" />
                                                                    </Col>

                                                                    <Col className="col-row">
                                                                        <ButtonGroup className="col-12">
                                                                            <Button
                                                                                title="Editar banco."
                                                                                variant="success"
                                                                                onClick={() => handleRoute(`/banks/edit/${bankData.id}`)}
                                                                            >
                                                                                <FaPencilAlt />
                                                                            </Button>
                                                                        </ButtonGroup>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={6}>
                                                                        <Row className="align-items-center">
                                                                            <Col>
                                                                                <h3 className="form-control-plaintext text-success">{bankData.institution.name}</h3>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={6} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Agência</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{bankData.agency}</h6>
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
                                                                                <h6 className="text-secondary">{bankData.phone}</h6>
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
                                                                                <h6 className="text-secondary">{bankData.cellphone}</h6>
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
                                                                                <h6 className="text-secondary">{bankData.address}</h6>
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
                                                                                <h6 className="text-secondary">{bankData.city}</h6>
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
                                                                                <h6 className="text-secondary">{bankData.state}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={3}>
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Setor/gerente</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{bankData.sector}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={3} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Departamento</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{bankData.department}</h6>
                                                                            </Col>
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
                                                                                                                                title="Ver todos os projetos para esse banco."
                                                                                                                                variant="success"
                                                                                                                                onClick={() => handleRoute(`/projects?bank=${bankData.id}`)}
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