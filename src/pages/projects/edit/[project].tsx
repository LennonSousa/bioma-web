import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { FaCheck, FaClock, FaHistory, FaPlus, FaSearchPlus } from 'react-icons/fa';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

import api from '../../../api/api';
import { SideBarContext } from '../../../context/SideBarContext';
import { Project } from '../../../components/Projects';
import { Customer } from '../../../components/Customers';
import { ProjectType } from '../../../components/ProjectTypes';
import { ProjectLine } from '../../../components/ProjectLines';
import { ProjectStatus } from '../../../components/ProjectStatus';
import { Bank } from '../../../components/Banks';
import { Property } from '../../../components/Properties';
import EventsProject from '../../../components/EventsProject';
import PageBack from '../../../components/PageBack';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';
import { prettifyCurrency } from '../../../components/InputMask/masks';

const validationSchema = Yup.object().shape({
    value: Yup.string().notRequired(),
    deal: Yup.string().notRequired(),
    contract: Yup.string().notRequired().nullable(),
    notes: Yup.string().notRequired(),
    warnings: Yup.boolean().notRequired(),
    customer: Yup.string().required('Obrigatório!'),
    type: Yup.string().required('Obrigatório!'),
    line: Yup.string().required('Obrigatório!'),
    status: Yup.string().required('Obrigatório!'),
    bank: Yup.string().required('Obrigatório!'),
    property: Yup.string().required('Obrigatório!'),
});

const validationSchemaEvents = Yup.object().shape({
    description: Yup.string().required('Obrigatório!'),
    done: Yup.boolean().required('Obrigatório!'),
    finished_at: Yup.date().notRequired(),
    project: Yup.string().required('Obrigatório!'),
});

export default function NewCustomer() {
    const router = useRouter();
    const { project } = router.query;
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [projectData, setProjectData] = useState<Project>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [projectLines, setProjectLines] = useState<ProjectLine[]>([]);
    const [projectStatus, setProjectStatus] = useState<ProjectStatus[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
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
        handleItemSideBar('projects');
        handleSelectedMenu('projects-index');

        if (project) {
            api.get('customers').then(res => {
                setCustomers(res.data);
            }).catch(err => {
                console.log('Error to get project status, ', err);
            });

            api.get('projects/types').then(res => {
                setProjectTypes(res.data);
            }).catch(err => {
                console.log('Error to get project types, ', err);
            });

            api.get('projects/lines').then(res => {
                setProjectLines(res.data);
            }).catch(err => {
                console.log('Error to get project lines, ', err);
            });

            api.get('projects/status').then(res => {
                setProjectStatus(res.data);
            }).catch(err => {
                console.log('Error to get project status, ', err);
            });

            api.get('banks').then(res => {
                setBanks(res.data);
            }).catch(err => {
                console.log('Error to get banks, ', err);
            });

            api.get(`projects/${project}`).then(res => {
                const projectRes: Project = res.data;

                api.get(`customers/${projectRes.customer.id}/properties`).then(res => {
                    setProperties(res.data);

                    setProjectData(projectRes);
                }).catch(err => {
                    console.log('Error to get customer properties ', err);
                });
            }).catch(err => {
                console.log('Error to get project, ', err);
            });
        }
    }, [project]);

    async function handleListEvents() {
        const res = await api.get(`projects/${project}`);

        setProjectData(res.data);
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
            projectData && <Formik
                initialValues={{
                    value: prettifyCurrency(String(projectData.value)),
                    deal: prettifyCurrency(String(projectData.deal)),
                    contract: projectData.contract,
                    notes: projectData.notes,
                    warnings: projectData.warnings,
                    customer: projectData.customer.id,
                    customerName: projectData.customer.name,
                    type: projectData.type.id,
                    line: projectData.line.id,
                    status: projectData.status.id,
                    bank: projectData.bank.id,
                    property: projectData.property.id,
                }}
                onSubmit={async values => {
                    setTypeMessage("waiting");
                    setMessageShow(true);

                    try {
                        await api.put(`projects/${projectData.id}`, {
                            value: Number(values.value.replace(".", "").replace(",", ".")),
                            deal: Number(values.deal.replace(".", "").replace(",", ".")),
                            contract: values.contract,
                            notes: values.notes,
                            warnings: values.warnings,
                            customer: values.customer,
                            type: values.type,
                            line: values.line,
                            status: values.status,
                            bank: values.bank,
                            property: values.property,
                        });

                        setTypeMessage("success");

                        setTimeout(() => {
                            router.push(`/projects/details/${projectData.id}`);
                        }, 2000);
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
                                <PageBack href={`/projects/details/${projectData.id}`} subTitle="Voltar para detalhes do projeto" />
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
                                    <option hidden>...</option>
                                    {
                                        properties.map((property, index) => {
                                            return <option key={index} value={property.id}>{property.name}</option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.property && errors.property}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} sm={6} controlId="formGridType">
                                <Form.Label>Tipo de projeto/processo</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.type}
                                    name="type"
                                    isInvalid={!!errors.type && touched.type}
                                >
                                    <option hidden>...</option>
                                    {
                                        projectTypes.map((type, index) => {
                                            return <option key={index} value={type.id}>{type.name}</option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.type && errors.type}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} sm={6} controlId="formGridLine">
                                <Form.Label>Linha de crédito</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.line}
                                    name="line"
                                    isInvalid={!!errors.line && touched.line}
                                >
                                    <option hidden>...</option>
                                    {
                                        projectLines.map((line, index) => {
                                            return <option key={index} value={line.id}>{line.name}</option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.line && errors.line}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} sm={6} controlId="formGridBank">
                                <Form.Label>Banco</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.bank}
                                    name="bank"
                                    isInvalid={!!errors.bank && touched.bank}
                                >
                                    <option hidden>...</option>
                                    {
                                        banks.map((bank, index) => {
                                            return <option
                                                key={index}
                                                value={bank.id}
                                            >
                                                {`${bank.institution.name} - ${bank.sector}`}
                                            </option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.bank && errors.bank}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} sm={6} controlId="formGridStatus">
                                <Form.Label>Fase do projeto/processo</Form.Label>
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
                                        projectStatus.map((status, index) => {
                                            return <option key={index} value={status.id}>{status.name}</option>
                                        })
                                    }
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">{touched.status && errors.status}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-2">
                            <Form.Group as={Col} sm={3} controlId="formGridValue">
                                <Form.Label>Valor</Form.Label>
                                <InputGroup className="mb-2">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="btnGroupValue">R$</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control
                                        type="text"
                                        onChange={(e) => {
                                            setFieldValue('value', prettifyCurrency(e.target.value));
                                        }}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                            setFieldValue('value', prettifyCurrency(e.target.value));
                                        }}
                                        value={values.value}
                                        name="value"
                                        isInvalid={!!errors.value && touched.value}
                                        aria-label="Nome do cliente"
                                        aria-describedby="btnGroupValue"
                                    />
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">{touched.value && errors.value}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} sm={3} controlId="formGridDeal">
                                <Form.Label>Acordo</Form.Label>
                                <InputGroup className="mb-2">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="btnGroupDeal">%</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control
                                        type="text"
                                        onChange={(e) => {
                                            setFieldValue('deal', prettifyCurrency(e.target.value));
                                        }}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                            setFieldValue('deal', prettifyCurrency(e.target.value));
                                        }}
                                        value={values.deal}
                                        name="deal"
                                        isInvalid={!!errors.deal && touched.deal}
                                        aria-label="Nome do cliente"
                                        aria-describedby="btnGroupDeal"
                                    />
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">{touched.deal && errors.deal}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} sm={6} controlId="formGridContract">
                                <Form.Label>Contrato</Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.contract}
                                    name="contract"
                                    isInvalid={!!errors.contract && touched.contract}
                                />
                                <Form.Control.Feedback type="invalid">{touched.contract && errors.contract}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Form.Row className="mb-2">
                            <Form.Switch
                                id="warnings"
                                label="Observações"
                                checked={values.warnings}
                                onChange={() => { setFieldValue('warnings', !values.warnings) }}
                            />
                        </Form.Row>

                        <Form.Row className="mb-3">
                            <Form.Group as={Col} controlId="formGridNotes">
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    disabled={!values.warnings}
                                    style={{ resize: 'none' }}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.notes}
                                    name="notes"
                                />
                            </Form.Group>
                        </Form.Row>

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
            projectData && <>
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
                                project: projectData.id,
                            }
                        }
                        onSubmit={async values => {
                            setTypeMessage("waiting");
                            setEventMessageShow(true);

                            try {
                                await api.post('events/project', {
                                    description: values.description,
                                    done: values.done,
                                    finished_at: values.finished_at,
                                    project: values.project,
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