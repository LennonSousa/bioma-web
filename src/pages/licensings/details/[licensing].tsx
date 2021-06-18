import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Button, ButtonGroup, Col, Container, ListGroup, Row } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaFileAlt,
    FaIdCard,
    FaHistory,
    FaPencilAlt,
    FaPlus,
} from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import Members from '../../../components/LicensingMembers';
import { Licensing } from '../../../components/Licensings';
import EventsLicensing from '../../../components/EventsLicensing';
import LicensingAttachments from '../../../components/LicensingAttachments';
import PageBack from '../../../components/PageBack';
import { AlertMessage } from '../../../components/interfaces/AlertMessage';

export default function LicensingDetails() {
    const router = useRouter();
    const { licensing } = router.query;
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [licensingData, setLicensingData] = useState<Licensing>();

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-index');

        if (licensing) {
            api.get(`licensings/${licensing}`).then(res => {
                setLicensingData(res.data);
            }).catch(err => {
                console.log('Error to get licensing: ', err);
            });
        }
    }, [licensing]);

    function handleRoute(route: string) {
        router.push(route);
    }

    return <Container className="content-page">
        {
            !licensingData ? <h1>Aguarde...</h1> :
                <Row>
                    <Col>
                        <Row className="mb-3">
                            <Col>
                                <PageBack href="/licensings" subTitle="Voltar para a lista de licenciamentos" />
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
                                        <h3 className="form-control-plaintext text-success">{licensingData.customer.name}</h3>
                                    </Col>

                                    <Col className="col-row">
                                        <ButtonGroup size="sm" className="col-12">
                                            <Button
                                                title="Editar cliente."
                                                variant="success"
                                                onClick={() => handleRoute(`/custimers/edit/${licensingData.customer.id}`)}
                                            >
                                                <FaPencilAlt /><FaIdCard />
                                            </Button>

                                            <Button
                                                variant="success"
                                                title="Criar um novo licenciamento para este cliente."
                                                onClick={() => handleRoute(`/licensings/new?customer=${licensingData.customer.id}`)}
                                            >
                                                <FaPlus /><FaFileAlt />
                                            </Button>

                                            <Button
                                                title="Editar licensiamento."
                                                variant="success"
                                                onClick={() => handleRoute(`/licensings/edit/${licensingData.id}`)}
                                            >
                                                <FaPencilAlt />
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
                                        <span className="text-success">Documento emitido</span>
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
                                        <h6 className="text-secondary">{licensingData.property ? licensingData.property.name : ''}</h6>
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
                                        licensingData.events.length > 0 ? <Col>
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
                                licensingData.attachments.length > 0 ? <Col>
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
                    </Col>
                </Row>
        }
    </Container>
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