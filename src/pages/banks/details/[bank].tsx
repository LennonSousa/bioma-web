import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Col, Container, Row, Tabs, Tab } from 'react-bootstrap';
import { FaPencilAlt, FaPlus } from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { can } from '../../../components/Users';
import { Bank } from '../../../components/Banks';
import ProjectListItem from '../../../components/ProjectListItem';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';

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

    return !user || loading ? <PageWaiting status="waiting" /> :
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
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col sm={6}>
                                                            <Row className="align-items-center">
                                                                <Col>
                                                                    <h3 className="form-control-plaintext text-success">{bankData.institution.name}</h3>
                                                                </Col>

                                                                <Col>
                                                                    <Link href={`/banks/edit/${bankData.id}`}>
                                                                        <a title="Editar" data-title="Editar"><FaPencilAlt /></a>
                                                                    </Link>
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

                                                    <Tabs defaultActiveKey="projects" id="relations-projects">
                                                        <Tab eventKey="projects" title="Projetos">
                                                            <Row className={styles.relationsContainer}>
                                                                <Col>
                                                                    <Row className={styles.relationsButtonsContent}>
                                                                        <Col>
                                                                            <Link href={'/projects/new'}>
                                                                                <a
                                                                                    className="btn btn-outline-success"
                                                                                    title="Criar um novo imóvel para esse cliente"
                                                                                    data-title="Criar um novo imóvel para esse cliente"
                                                                                >
                                                                                    <FaPlus /> Criar um projeto
                                                                                </a>
                                                                            </Link>
                                                                        </Col>
                                                                    </Row>

                                                                    <Row className={styles.relationsContent}>
                                                                        {
                                                                            !!bankData.projects.length ? bankData.projects.map((project, index) => {
                                                                                return <ProjectListItem
                                                                                    key={index}
                                                                                    project={project}
                                                                                    showBank={false}
                                                                                />
                                                                            }) :
                                                                                <Col>
                                                                                    <span className="text-success">Nenhum projeto registrado.</span>
                                                                                </Col>
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