import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row } from 'react-bootstrap';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { FaLongArrowAltLeft, FaSearchPlus } from 'react-icons/fa';

import api from '../../../services/api';
import { Customer } from '../../../components/Customers';
import { DocsProperty } from '../../../components/DocsProperty';
import { statesCities } from '../../../components/StatesCities';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!'),
    registration: Yup.string().notRequired(),
    route: Yup.string().notRequired(),
    city: Yup.string().required('Obrigatório!'),
    state: Yup.string().required('Obrigatório!'),
    area: Yup.string().required('Obrigatório!'),
    notes: Yup.string().notRequired(),
    warnings: Yup.boolean().notRequired(),
    customer: Yup.string().required('Obrigatório!'),
});

export default function NewCustomer() {
    const router = useRouter();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [docsProperty, setDocsProperty] = useState<DocsProperty[]>([]);
    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");
    const [cities, setCities] = useState<string[]>([]);

    const [showModalNewDoc, setShowModalNewDoc] = useState(false);

    const handleCloseModalNewDoc = () => setShowModalNewDoc(false);
    const handleShowModalNewDoc = () => setShowModalNewDoc(true);

    useEffect(() => {
        api.get('customers').then(res => {
            setCustomers(res.data);

            api.get('docs/property').then(res => {
                setDocsProperty(res.data);
            }).catch(err => {
                console.log('Error to get docs property, ', err);
            });
        }).catch(err => {
            console.log('Error to get customers, ', err);
        });
    }, []);

    return <Container className="content-page">
        <Formik
            initialValues={{
                name: '',
                registration: '',
                route: '',
                city: '',
                state: '',
                area: '',
                notes: '',
                warnings: false,
                customer: '',
                docs: [],
            }}
            onSubmit={async values => {
                setTypeMessage("waiting");
                setMessageShow(true);

                const docs = docsProperty.map(doc => {
                    let checked = false;

                    values.docs.forEach(item => { if (item === doc.id) checked = true });

                    return { checked, doc: doc.id }
                });

                try {
                    const res = await api.post('properties', {
                        name: values.name,
                        registration: values.registration,
                        route: values.route,
                        city: values.city,
                        state: values.state,
                        area: values.area,
                        notes: values.notes,
                        warnings: values.warnings,
                        customer: values.customer,
                        docs,
                    });

                    setTypeMessage("success");

                    setTimeout(() => {
                        router.push(`/properties/details/${res.data.id}`)
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
                        <Link href="/properties">
                            <a title="Voltar para a lista de imóveis" data-title="Voltar para a lista de imóveis">
                                <FaLongArrowAltLeft /> voltar
                                </a>
                        </Link>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} sm={6} controlId="formGridName">
                            <Form.Label>Nome do imóvel/fazenda*</Form.Label>
                            <Form.Control
                                type="name"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.name}
                                name="name"
                                isInvalid={!!errors.name && touched.name}
                            />
                            <Form.Control.Feedback type="invalid">{touched.name && errors.name}</Form.Control.Feedback>
                        </Form.Group>

                        <Col sm={6}>
                            <Form.Label>Cliente</Form.Label>
                            <InputGroup className="mb-2">
                                <FormControl
                                    placeholder="Escolha um cliente"
                                    type="name"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.customer}
                                    name="customer"
                                    aria-label="Input group example"
                                    aria-describedby="btnGroupAddon"
                                    isInvalid={!!errors.customer && touched.customer}
                                    readOnly
                                />
                                <InputGroup.Prepend>
                                    <Button
                                        id="btnGroupAddon"
                                        variant="success"
                                        onClick={handleShowModalNewDoc}
                                    >
                                        <FaSearchPlus />
                                    </Button>
                                </InputGroup.Prepend>
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">{touched.customer && errors.customer}</Form.Control.Feedback>
                        </Col>
                    </Row>

                    <Row className="mb-2">
                        <Form.Group as={Col} sm={4} controlId="formGridRegistration">
                            <Form.Label>Matrícula</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.registration}
                                name="registration"
                                isInvalid={!!errors.registration && touched.registration}
                            />
                            <Form.Control.Feedback type="invalid">{touched.registration && errors.registration}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={3} controlId="formGridArea">
                            <Form.Label>Área do imóvel</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.area}
                                name="area"
                                isInvalid={!!errors.area && touched.area}
                            />
                            <Form.Control.Feedback type="invalid">{touched.area && errors.area}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-2">
                        <Form.Group as={Col} sm={6} controlId="formGridAddress">
                            <Form.Label>Roteiro</Form.Label>
                            <Form.Control
                                type="address"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.route}
                                name="route"
                                isInvalid={!!errors.route && touched.route}
                            />
                            <Form.Control.Feedback type="invalid">{touched.route && errors.route}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={2} controlId="formGridState">
                            <Form.Label>Estado</Form.Label>
                            <Form.Control
                                as="select"
                                onChange={(e) => {
                                    setFieldValue('state', e.target.value);
                                    const stateCities = statesCities.estados.find(item => { return item.nome === e.target.value })

                                    if (stateCities)
                                        setCities(stateCities.cidades);
                                }}
                                onBlur={handleBlur}
                                value={values.state}
                                name="state"
                                isInvalid={!!errors.state && touched.state}
                            >
                                <option hidden>...</option>
                                {
                                    statesCities.estados.map((estado, index) => {
                                        return <option key={index} value={estado.nome}>{estado.nome}</option>
                                    })
                                }
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">{touched.state && errors.state}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={4} controlId="formGridCity">
                            <Form.Label>Cidade</Form.Label>
                            <Form.Control
                                as="select"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.city}
                                name="city"
                                isInvalid={!!errors.city && touched.city}
                                disabled={!!!values.state}
                            >
                                <option hidden>...</option>
                                {
                                    !!values.state && cities.map((city, index) => {
                                        return <option key={index} value={city}>{city}</option>
                                    })
                                }
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">{touched.city && errors.city}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Form.Row className="mb-2">
                        <label>
                            <Field type="checkbox" name="warnings" /> Observações
                        </label>
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

                    <Col className="border-top mb-3"></Col>

                    <Form.Row>
                        <Form.Group as={Col} sm={5} controlId="formGridDocs">
                            <Form.Label>Documentação</Form.Label>
                            <ListGroup className="mb-3">
                                {
                                    docsProperty.map((doc, index) => {
                                        return <ListGroup.Item key={index} action as="div" variant="light">
                                            <Row>
                                                <Col>
                                                    <label>
                                                        <Field
                                                            type="checkbox"
                                                            name="docs"
                                                            value={doc.id}
                                                        />
                                                        {doc.name}
                                                    </label>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    })
                                }
                            </ListGroup>
                        </Form.Group>
                    </Form.Row>

                    <Row className="justify-content-end text-end">
                        {
                            messageShow ? <Col sm={3}><AlertMessage status={typeMessage} /></Col> :
                                <Col sm={2}>
                                    <Button variant="success" type="submit">Salvar</Button>
                                </Col>

                        }
                    </Row>
                </Form>
            )}
        </Formik>

        <Modal show={showModalNewDoc} onHide={handleCloseModalNewDoc}>
            <Modal.Header closeButton>
                <Modal.Title>Criar um documento</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={
                    {
                        customer: '',
                    }
                }
                onSubmit={async values => {

                }}
                validationSchema={validationSchema}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Group controlId="categoryFormGridName">
                                <Form.Label>Nome do documento</Form.Label>
                                <Form.Control type="text"
                                    placeholder="Digite para pesquisar"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.customer}
                                    name="customer"
                                    isInvalid={!!errors.customer && touched.customer}
                                />
                                <Form.Control.Feedback type="invalid">{touched.customer && errors.customer}</Form.Control.Feedback>
                            </Form.Group>

                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModalNewDoc}>
                                Cancelar
                                        </Button>
                            <Button variant="success" type="submit">Salvar</Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    </Container>
}