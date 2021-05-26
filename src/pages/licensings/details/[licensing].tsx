import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Col, Container, ListGroup, Row } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaHistory,
    FaMapSigns,
    FaPencilAlt,
    FaPlusSquare,
} from 'react-icons/fa';

import api from '../../../services/api';
import { SideBarContext } from '../../../context/SideBarContext';
import { Licensing } from '../../../components/Licensings';
import EventsLicensing from '../../../components/EventsLicensing';
import PageBack from '../../../components/PageBack';
import { AlertMessage } from '../../../components/interfaces/AlertMessage';

export default function PropertyDetails() {
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

    async function handleListEvents() { }

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
                            <Col sm={6}>
                                <Row className="align-items-center">
                                    <Col>
                                        <h3 className="form-control-plaintext text-success">{licensingData.customer.name}</h3>
                                    </Col>

                                    <Col>
                                        <Link href={`/licensings/edit/${licensingData.id}`}>
                                            <a title="Editar" data-title="Editar"><FaPencilAlt /></a>
                                        </Link>
                                    </Col>

                                    <Col>
                                        <Link href={`/licensing/new?customer=${licensingData.customer.id}`}>
                                            <a
                                                title="Criar um novo licenciamento para este cliente"
                                                data-title="Criar um novo licenciamento para este cliente"
                                            >
                                                <FaPlusSquare /><FaMapSigns />
                                            </a>
                                        </Link>
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
                                        <h6 className="text-secondary">{licensingData.expire ? licensingData.expire : ''}</h6>
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
                                            {licensingData.renovation ? licensingData.renovation : ''}
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
                                        <h6 className="text-secondary">{licensingData.deadline ? licensingData.deadline : ''}</h6>
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
                                        <span className="text-success">Última atualização</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <h6 className="text-secondary">{format(new Date(licensingData.updated_at), 'dd/MM/yyyy')}</h6>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

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
                                        licensingData.events.length > 0 ? <Col>
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
                                                            licensingData.events.map((event, index) => {
                                                                return <EventsLicensing
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
                    </Col>
                </Row>
        }
    </Container>
}