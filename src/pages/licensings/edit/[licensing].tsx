import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaCheck, FaClock, FaHistory, FaPlus, FaSearchPlus } from 'react-icons/fa';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

import api from '../../../api/api';
import { Licensing } from '../../../components/Licensings';
import { Customer } from '../../../components/Customers';
import { LicensingAgency } from '../../../components/LicensingAgencies';
import { LicensingAuthorization } from '../../../components/LicensingAuthorizations';
import { LicensingInfringement } from '../../../components/LicensingInfringements';
import { LicensingStatus } from '../../../components/LicensingStatus';
import { Property } from '../../../components/Properties';
import EventsLicensing from '../../../components/EventsLicensing';
import { SideBarContext } from '../../../context/SideBarContext';
import PageBack from '../../../components/PageBack';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    licensing_number: Yup.string().notRequired().nullable(),
    expire: Yup.string().notRequired().nullable(),
    renovation: Yup.string().notRequired().nullable(),
    deadline: Yup.string().notRequired().nullable(),
    process_number: Yup.string().notRequired().nullable(),
    customer: Yup.string().required('Obrigatório!'),
    property: Yup.string().notRequired().nullable(),
    infringement: Yup.string().notRequired().nullable(),
    authorization: Yup.string().required('Obrigatório!'),
    agency: Yup.string().required('Obrigatório!'),
    status: Yup.string().required('Obrigatório!'),
});

const validationSchemaEvents = Yup.object().shape({
    description: Yup.string().required('Obrigatório!'),
    done: Yup.boolean().required('Obrigatório!'),
    finished_at: Yup.date().notRequired(),
    licensing: Yup.string().required('Obrigatório!'),
});

export default function NewCustomer() {
    const router = useRouter();
    const { licensing } = router.query;
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [licensingData, setLicensingData] = useState<Licensing>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [licensingAgencies, setLicensingAgencies] = useState<LicensingAgency[]>([]);
    const [licensingAuthorizations, setLicensingAuthorizations] = useState<LicensingAuthorization[]>([]);
    const [licensingInfringements, setLicensingInfringements] = useState<LicensingInfringement[]>([]);
    const [licensingStatus, setLicensingStatus] = useState<LicensingStatus[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    const [messageShow, setMessageShow] = useState(false);
    const [eventMessageShow, setEventMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [showModalChooseCustomer, setShowModalChooseCustomer] = useState(false);

    const handleCloseModalChooseCustomer = () => setShowModalChooseCustomer(false);
    const handleShowModalChooseCustomer = () => setShowModalChooseCustomer(true);

    const [showModalNewEvent, setShowModalNewEvent] = useState(false);

    const handleCloseModalNewEvent = () => setShowModalNewEvent(false);
    const handleShowModalNewEvent = () => setShowModalNewEvent(true);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-index');

        if (licensing) {
            api.get('customers').then(res => {
                setCustomers(res.data);
            }).catch(err => {
                console.log('Error to get licensings customers, ', err);
            });

            api.get('licensings/agencies').then(res => {
                setLicensingAgencies(res.data);
            }).catch(err => {
                console.log('Error to get licensings agencies, ', err);
            });

            api.get('licensings/authorizations').then(res => {
                setLicensingAuthorizations(res.data);
            }).catch(err => {
                console.log('Error to get licensings authorizations, ', err);
            });

            api.get('licensings/infringements').then(res => {
                setLicensingInfringements(res.data);
            }).catch(err => {
                console.log('Error to get licensings infringements, ', err);
            });

            api.get('licensings/status').then(res => {
                setLicensingStatus(res.data);
            }).catch(err => {
                console.log('Error to get licensings status, ', err);
            });

            api.get(`licensings/${licensing}`).then(res => {
                const licensingRes: Licensing = res.data;

                api.get(`customers/${licensingRes.customer.id}/properties`).then(res => {
                    setProperties(res.data);

                    setLicensingData(licensingRes);
                }).catch(err => {
                    console.log('Error to get customer properties ', err);
                });
            }).catch(err => {
                console.log('Error to get licensing, ', err);
            });
        }
    }, [licensing]);

    async function handleListEvents() {
        const res = await api.get(`licensings/${licensing}`);

        setLicensingData(res.data);
    }

    function handleSearch(event: ChangeEvent<HTMLInputElement>) {
        if (customers) {
            const term = event.target.value;

            if (term === "") {
                setCustomerResults([]);
                return;
            }

            let resultsUpdated: Customer[] = [];

            const customersFound = customers.filter(product => {
                return product.name.toLocaleLowerCase().includes(term.toLocaleLowerCase());
            });

            if (customersFound.length > 0) resultsUpdated = customersFound;

            setCustomerResults(resultsUpdated);
        }
    }

    return <Container className="content-page">
        {
            licensingData && <Formik
                initialValues={{
                    licensing_number: licensingData.licensing_number,
                    expire: licensingData.expire,
                    renovation: licensingData.renovation,
                    deadline: licensingData.deadline,
                    process_number: licensingData.process_number,
                    customer: licensingData.customer.id,
                    customerName: licensingData.customer.name,
                    property: licensingData.property ? licensingData.property.id : '0',
                    infringement: licensingData.infringement ? licensingData.infringement.id : '0',
                    authorization: licensingData.authorization.id,
                    agency: licensingData.agency.id,
                    status: licensingData.status.id,
                }}
                onSubmit={async values => {
                    setTypeMessage("waiting");
                    setMessageShow(true);

                    try {
                        await api.put(`licensings/${licensingData.id}`, {
                            licensing_number: values.licensing_number,
                            expire: values.expire,
                            renovation: values.renovation,
                            deadline: values.deadline,
                            process_number: values.process_number,
                            customer: values.customer,
                            property: values.property,
                            infringement: values.infringement,
                            authorization: values.authorization,
                            agency: values.agency,
                            status: values.status,
                        });

                        setTypeMessage("success");

                        setTimeout(() => {
                            router.push(`/licensings/details/${licensingData.id}`);
                        }, 1000);
                    }
                    catch {
                        setTypeMessage("error");

                        setTimeout(() => {
                            setMessageShow(false);
                        }, 4000);
                    }
                }}
                validationSchema={validationSchema}
            >
                {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col>
                                <PageBack href={`/licensings/details/${licensingData.id}`} subTitle="Voltar para detalhes do projeto" />
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col sm={6}>
                                <Form.Label>Cliente</Form.Label>
                                <InputGroup className="mb-2">
                                    <FormControl
                                        placeholder="Escolha um cliente"
                                        type="name"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.customerName}
                                        name="customerName"
                                        aria-label="Nome do cliente"
                                        aria-describedby="btnGroupAddon"
                                        isInvalid={!!errors.customerName}
                                        readOnly
                                    />
                                    <InputGroup.Prepend>
                                        <Button
                                            id="btnGroupAddon"
                                            variant="success"
                                            onClick={handleShowModalChooseCustomer}
                                        >
                                            <FaSearchPlus />
                                        </Button>
                                    </InputGroup.Prepend>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">{errors.customerName}</Form.Control.Feedback>
                            </Col>

                            <Form.Group as={Col} sm={6} controlId="formGridAuthorizatioin">
                                <Form.Label>Licença/autorização</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.authorization}
                                    name="authorization"
                                    isInvalid={!!errors.authorization && touched.authorization}
                                >
                                    <option hidden>...</option>
                                    {
                                        licensingAuthorizations.map((authorization, index) => {
                                            return <option key={index} value={authorization.id}>{authorization.department}</option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.authorization && errors.authorization}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} sm={5} controlId="formGridAgency">
                                <Form.Label>Orgão</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.agency}
                                    name="agency"
                                    isInvalid={!!errors.agency && touched.agency}
                                >
                                    <option hidden>...</option>
                                    {
                                        licensingAgencies.map((agency, index) => {
                                            return <option key={index} value={agency.id}>{agency.name}</option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.agency && errors.agency}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} sm={5} controlId="formGridStatus">
                                <Form.Label>Documento emitido</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.status}
                                    name="status"
                                    isInvalid={!!errors.status && touched.status}
                                >
                                    <option hidden>...</option>
                                    {
                                        licensingStatus.map((status, index) => {
                                            return <option key={index} value={status.id}>{status.name}</option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.status && errors.status}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} sm={2} controlId="formGridExpire">
                                <Form.Label>Renovação</Form.Label>
                                <Form.Control
                                    type="date"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.expire}
                                    name="expire"
                                    isInvalid={!!errors.expire && touched.expire}
                                />
                                <Form.Control.Feedback type="invalid">{touched.expire && errors.expire}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} sm={4} controlId="formGridRenovation">
                                <Form.Label>Renovação</Form.Label>
                                <Form.Control
                                    type="date"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.renovation}
                                    name="renovation"
                                    isInvalid={!!errors.renovation && touched.renovation}
                                />
                                <Form.Control.Feedback type="invalid">{touched.renovation && errors.renovation}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} sm={4} controlId="formGridDeadline">
                                <Form.Label>Entrega ao cliente</Form.Label>
                                <Form.Control
                                    type="date"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.deadline}
                                    name="deadline"
                                    isInvalid={!!errors.deadline && touched.deadline}
                                />
                                <Form.Control.Feedback type="invalid">{touched.deadline && errors.deadline}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} sm={4} controlId="formGridProcessNumber">
                                <Form.Label>Número de licença</Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.process_number}
                                    name="process_number"
                                    isInvalid={!!errors.process_number && touched.process_number}
                                />
                                <Form.Control.Feedback type="invalid">{touched.process_number && errors.process_number}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-2">
                            <Form.Group as={Col} sm={6} controlId="formGridProperty">
                                <Form.Label>Fazenda/imóvel</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.property}
                                    name="property"
                                    disabled={!!!values.customer}
                                    isInvalid={!!errors.property && touched.property}
                                >
                                    <option value="0">Nenhuma</option>
                                    {
                                        properties.map((property, index) => {
                                            return <option key={index} value={property.id}>{property.name}</option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.property && errors.property}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} sm={5} controlId="formGridInfringement">
                                <Form.Label>Infração</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.infringement}
                                    name="infringement"
                                    isInvalid={!!errors.infringement && touched.infringement}
                                >
                                    <option value="0">Nenhuma</option>
                                    {
                                        licensingInfringements.map((infringement, index) => {
                                            return <option key={index} value={infringement.id}>{infringement.name}</option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.infringement && errors.infringement}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="justify-content-end">
                            {
                                messageShow ? <Col sm={3}><AlertMessage status={typeMessage} /></Col> :
                                    <Col sm={1}>
                                        <Button variant="success" type="submit">Salvar</Button>
                                    </Col>

                            }
                        </Row>

                        <Modal show={showModalChooseCustomer} onHide={handleCloseModalChooseCustomer}>
                            <Modal.Header closeButton>
                                <Modal.Title>Lista de clientes</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Form.Group controlId="categoryFormGridName">
                                    <Form.Label>Nome do cliente</Form.Label>
                                    <Form.Control type="search"
                                        placeholder="Digite para pesquisar"
                                        autoComplete="off"
                                        onChange={handleSearch}
                                    />
                                </Form.Group>
                            </Modal.Body>

                            <Modal.Dialog scrollable style={{ marginTop: 0, width: '100%' }}>
                                <Modal.Body style={{ maxHeight: 'calc(100vh - 3.5rem)' }}>
                                    <Row>
                                        <Col>
                                            <ListGroup className="mt-3 mb-3">
                                                {
                                                    customerResults.map((customer, index) => {
                                                        return <ListGroup.Item
                                                            key={index}
                                                            action
                                                            variant="light"
                                                            onClick={() => {
                                                                setFieldValue('customer', customer.id);
                                                                setFieldValue('customerName', customer.name);

                                                                api.get(`customers/${customer.id}/properties`).then(res => {
                                                                    setProperties(res.data);

                                                                    setFieldValue('property', '');

                                                                    handleCloseModalChooseCustomer();
                                                                }).catch(err => {
                                                                    console.log('Error to get customer properties ', err);
                                                                });
                                                            }}
                                                        >
                                                            <Row>
                                                                <Col>
                                                                    <h6>{customer.name}</h6>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col>
                                                                    <span
                                                                        className="text-italic"
                                                                    >
                                                                        {`${customer.document} - ${customer.city}/${customer.state}`}
                                                                    </span>
                                                                </Col>
                                                            </Row>
                                                        </ListGroup.Item>
                                                    })
                                                }
                                            </ListGroup>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleCloseModalChooseCustomer}>Cancelar</Button>
                                </Modal.Footer>
                            </Modal.Dialog>
                        </Modal>
                    </Form>
                )}
            </Formik>
        }

        {
            licensingData && <>
                <Col className="border-top mt-3 mb-3"></Col>

                <Row className="mb-3">
                    <Col>
                        <Row>
                            <Col sm={2}>
                                <h6 className="text-success">Histórico <FaHistory /></h6>
                            </Col>

                            <Col sm={1}>
                                <Button variant="outline-success" onClick={handleShowModalNewEvent}>
                                    <FaPlus />
                                </Button>
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
                                            message="Nenhum evento registrado para esse licensiamento."
                                        />
                                    </Col>
                            }
                        </Row>
                    </Col>
                </Row>

                <Modal show={showModalNewEvent} onHide={handleCloseModalNewEvent}>
                    <Modal.Header closeButton>
                        <Modal.Title>Criar evento</Modal.Title>
                    </Modal.Header>
                    <Formik
                        initialValues={
                            {
                                description: '',
                                done: false,
                                finished_at: new Date(),
                                licensing: licensingData.id,
                            }
                        }
                        onSubmit={async values => {
                            setTypeMessage("waiting");
                            setEventMessageShow(true);

                            try {
                                await api.post('events/licensing', {
                                    description: values.description,
                                    done: values.done,
                                    finished_at: values.finished_at,
                                    licensing: values.licensing,
                                });

                                await handleListEvents();

                                setTypeMessage("success");

                                setTimeout(() => {
                                    setEventMessageShow(false);
                                    handleCloseModalNewEvent();
                                }, 1000);
                            }
                            catch (err) {
                                console.log('error to create event.');
                                console.log(err);

                                setTypeMessage("error");

                                setTimeout(() => {
                                    setEventMessageShow(false);
                                }, 4000);
                            }
                        }}
                        validationSchema={validationSchemaEvents}
                    >
                        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                            <Form onSubmit={handleSubmit}>
                                <Modal.Body>
                                    <Form.Group controlId="eventFormGridDescription">
                                        <Form.Label>Descrição</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            style={{ resize: 'none' }}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.description}
                                            name="description"
                                            isInvalid={!!errors.description && touched.description}
                                        />
                                        <Form.Control.Feedback type="invalid">{touched.description && errors.description}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Button
                                        variant={values.done ? 'success' : 'secondary'}
                                        onClick={() => {
                                            setFieldValue('done', !values.done);
                                        }}
                                        style={{ width: '100%' }}
                                    >
                                        {
                                            values.done ? <span><FaCheck /> concluído</span> :
                                                <span><FaClock /> marcar como concluído</span>
                                        }
                                    </Button>

                                </Modal.Body>
                                <Modal.Footer>
                                    {
                                        eventMessageShow ? <AlertMessage status={typeMessage} /> :
                                            <>
                                                <Button variant="secondary" onClick={handleCloseModalNewEvent}>Cancelar</Button>
                                                <Button variant="success" type="submit">Salvar</Button>
                                            </>

                                    }
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </Modal>
            </>
        }
    </Container>
}