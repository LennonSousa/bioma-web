import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Accordion, Button, ButtonGroup, Col, Container, ListGroup, Row, Table } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaFileAlt,
    FaFileContract,
    FaFingerprint,
    FaHistory,
    FaPencilAlt,
    FaPlus,
    FaStickyNote,
} from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { can, translateGrant } from '../../../components/Users';
import Members from '../../../components/LicensingMembers';
import { Licensing } from '../../../components/Licensings';
import EventsLicensing from '../../../components/EventsLicensing';
import LicensingAttachments from '../../../components/LicensingAttachments';
import PageBack from '../../../components/PageBack';
import { AlertMessage } from '../../../components/Interfaces/AlertMessage';
import { PageWaiting, PageType } from '../../../components/PageWaiting';

export default function LicensingDetails() {
    const router = useRouter();
    const { licensing } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [licensingData, setLicensingData] = useState<Licensing>();

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-index');

        if (user) {
            if (can(user, "licensings", "view")) {
                if (licensing) {
                    api.get(`licensings/${licensing}`).then(res => {
                        setLicensingData(res.data);

                        setLoadingData(false);
                    }).catch(err => {
                        console.log('Error to get licensing: ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    });
                }
            }
        }
    }, [user, licensing]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <>
            <NextSeo
                title="Detalhes do licenciamento"
                description="Detalhes do licenciamento da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Detalhes do licenciamento',
                    description: 'Detalhes do licenciamento da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Detalhes do licenciamento | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "licensings", "view") ? <>
                                {
                                    loadingData ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !licensingData ? <PageWaiting status="waiting" /> :
                                                    <Container className="content-page">

                                                        <Row>
                                                            <Col>
                                                                <Row className="mb-3">
                                                                    <Col>
                                                                        <PageBack href="/licensings" subTitle="Voltar para a lista de licenciamentos" />
                                                                    </Col>

                                                                    <Col className="col-row">
                                                                        <ButtonGroup className="col-12">
                                                                            <Button
                                                                                title="Editar licenciamento."
                                                                                variant="success"
                                                                                onClick={() => handleRoute(`/licensings/edit/${licensingData.id}`)}
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
                                                                                licensingData.members.map(member => {
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
                                                                                <Link href={`/customers/details/${licensingData.customer.id}`}>
                                                                                    <a title="Ir para detalhes do cliente." data-title="Ir para detalhes do cliente.">
                                                                                        <h3 className="form-control-plaintext text-success">{licensingData.customer.name}</h3>
                                                                                    </a>
                                                                                </Link>
                                                                            </Col>

                                                                            <Col className="col-row">
                                                                                <ButtonGroup size="sm" className="col-12">
                                                                                    <Button
                                                                                        variant="success"
                                                                                        title="Criar um novo licenciamento para este cliente."
                                                                                        onClick={() => handleRoute(`/licensings/new?customer=${licensingData.customer.id}`)}
                                                                                    >
                                                                                        <FaPlus /><FaFileContract />
                                                                                    </Button>
                                                                                </ButtonGroup>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Licença/autorização</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{licensingData.authorization.department}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={5}>
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Orgão</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{licensingData.agency.name}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={5} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Fase</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{licensingData.status.name}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={2} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Validade</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{licensingData.expire ? format(new Date(licensingData.expire), 'dd/MM/yyyy') : ''}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={4}>
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Renovação</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">
                                                                                    {licensingData.renovation ? format(new Date(licensingData.renovation), 'dd/MM/yyyy') : ''}
                                                                                </h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Entrega ao cliente</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{licensingData.deadline ? format(new Date(licensingData.deadline), 'dd/MM/yyyy') : ''}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Número de licença</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">
                                                                                    {licensingData.process_number ? licensingData.process_number : ''}
                                                                                </h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={6} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Imóvel</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                {
                                                                                    licensingData.property && <Link href={`/properties/details/${licensingData.property.id}`}>
                                                                                        <a title="Ir para detalhes do imóvel." data-title="Ir para detalhes do imóvel.">
                                                                                            <h6 className="text-secondary">{licensingData.property.name}</h6>
                                                                                        </a>
                                                                                    </Link>
                                                                                }
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={6} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Infração</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">
                                                                                    {licensingData.infringement ? licensingData.infringement.name : ''}
                                                                                </h6>
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
                                                                                <h6 className="text-secondary">{licensingData.type && licensingData.type.name}</h6>
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
                                                                                <h6 className="text-secondary">{licensingData.line && licensingData.line.name}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={4}>
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Banco</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                {
                                                                                    licensingData.bank && <Link href={`/banks/details/${licensingData.bank.id}`}>
                                                                                        <a title="Ir para detalhes do banco." data-title="Ir para detalhes do banco.">
                                                                                            <h6 className="text-secondary">{`${licensingData.bank.institution.name} - ${licensingData.bank.sector}`}</h6>
                                                                                        </a>
                                                                                    </Link>
                                                                                }
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col sm={2}>
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
                                                                                    {licensingData.value && `R$ ${Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(licensingData.value)}`}
                                                                                </h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    <Col sm={2} >
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Acordo %</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{String(licensingData.deal).replaceAll(".", ",")}</h6>
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
                                                                                <h6 className="text-secondary">{licensingData.paid ? "Sim" : "Não"}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>

                                                                    {
                                                                        licensingData.paid && <Col sm={2} >
                                                                            <Row>
                                                                                <Col>
                                                                                    <span className="text-success">Data do pagemento</span>
                                                                                </Col>
                                                                            </Row>

                                                                            <Row>
                                                                                <Col>
                                                                                    <h6 className="text-secondary">{format(new Date(licensingData.paid_date), 'dd/MM/yyyy')}</h6>
                                                                                </Col>
                                                                            </Row>
                                                                        </Col>
                                                                    }

                                                                    <Col sm={4}>
                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-success">Contrato</span>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-secondary">{licensingData.contract}</h6>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    <Col >
                                                                        <Row>
                                                                            <Col>
                                                                                <h6 className="text-success">Observação <FaStickyNote /></h6>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col>
                                                                                <span className="text-secondary text-wrap">{licensingData.notes}</span>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

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
                                                                                <h6 className="text-secondary">{format(new Date(licensingData.created_at), 'dd/MM/yyyy')}</h6>
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
                                                                                <h6 className="text-secondary">{licensingData.created_by}</h6>
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
                                                                                <h6 className="text-secondary">{format(new Date(licensingData.updated_at), 'dd/MM/yyyy')}</h6>
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
                                                                                <h6 className="text-secondary">{licensingData.updated_by}</h6>
                                                                            </Col>
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
                                                                                !!licensingData.events.length ? <Col>
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
                                                                                                    licensingData.events.map((event, index) => {
                                                                                                        return <EventsLicensing
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
                                                                                            message="Nenhum evento registrado para esse licenciamento."
                                                                                        />
                                                                                    </Col>
                                                                            }
                                                                        </Row>
                                                                    </Col>
                                                                </Row>

                                                                <Row>
                                                                    <Col>
                                                                        <h6 className="text-success">Anexos <FaFileAlt /></h6>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mb-3">
                                                                    {
                                                                        !!licensingData.attachments.length ? <Col>
                                                                            <Row>
                                                                                <Col>
                                                                                    <ListGroup>
                                                                                        {
                                                                                            licensingData.attachments.map((attachment, index) => {
                                                                                                return <LicensingAttachments
                                                                                                    key={index}
                                                                                                    attachment={attachment}
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
                                                                                    message="Nenhum anexo enviado para esse licenciamento."
                                                                                />
                                                                            </Col>
                                                                    }
                                                                </Row>

                                                                <Col className="border-top mt-5 mb-3"></Col>

                                                                <Accordion>
                                                                    <Accordion.Item eventKey="0">
                                                                        <Accordion.Header><h6 className="text-success">Acessos <FaFingerprint /></h6></Accordion.Header>
                                                                        <Accordion.Body>
                                                                            <Table striped hover size="sm" responsive>
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Data</th>
                                                                                        <th>Usuário</th>
                                                                                        <th>Acesso</th>
                                                                                        <th>Descrição</th>
                                                                                        <th>IP</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {
                                                                                        licensingData.logs.map(log => {
                                                                                            return <tr key={log.id}>
                                                                                                <td>{format(new Date(log.accessed_at), 'dd/MM/yyyy HH:mm')}</td>
                                                                                                <td>{log.user}</td>
                                                                                                <td>{translateGrant(log.action)}</td>
                                                                                                <td>{log.description}</td>
                                                                                                <td>{log.client_ip}</td>
                                                                                            </tr>
                                                                                        })
                                                                                    }
                                                                                </tbody>
                                                                            </Table>
                                                                        </Accordion.Body>
                                                                    </Accordion.Item>
                                                                </Accordion>
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