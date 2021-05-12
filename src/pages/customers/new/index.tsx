import { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';

import api from '../../../services/api';
import { DocsCustomer } from '../../../components/DocsCustomer';
import { cpf, cnpj, cellphone } from '../../../components/InputMask/masks';
import { statesCities } from '../../../components/StatesCities';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!'),
    document: Yup.string().min(14, 'CPF inválido!').max(18, 'CNPJ inválido!').required('Obrigatório!'),
    phone: Yup.string().notRequired(),
    cellphone: Yup.string().notRequired(),
    contacts: Yup.string().notRequired(),
    email: Yup.string().email('E-mail inválido!').notRequired(),
    address: Yup.string().notRequired(),
    city: Yup.string().required('Obrigatório!'),
    state: Yup.string().required('Obrigatório!'),
    owner: Yup.string().notRequired(),
    notes: Yup.string().notRequired(),
    warnings: Yup.boolean().notRequired(),
    birth: Yup.date().required('Obrigatório!'),
});

export default function NewCustomer() {
    const [docsCustomer, setDocsCustomer] = useState<DocsCustomer[]>([]);
    const [messageShow, setMessageShow] = useState(false);
    const [documentType, setDocumentType] = useState("CPF");
    const [warnings, setWarnings] = useState(false);
    const [cities, setCities] = useState<string[]>([])

    useEffect(() => {
        api.get('docs/customer').then(res => {
            setDocsCustomer(res.data);
        }).catch(err => {
            console.log('Error to get docs customer, ', err);
        })
    }, []);

    return <Container className="content-page">
        <Formik
            initialValues={{
                name: '',
                document: '',
                phone: '',
                cellphone: '',
                contacts: '',
                email: '',
                address: '',
                city: '',
                state: '',
                owner: '',
                notes: '',
                warnings,
                birth: format(new Date(), 'yyyy-MM-dd'),
                docs: [],
            }}
            onSubmit={async values => {

            }}
            validationSchema={validationSchema}
        >
            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Form.Group as={Col} sm={6} controlId="formGridName">
                            <Form.Label>Nome do cliente*</Form.Label>
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

                        <Form.Group as={Col} sm={4} controlId="formGridDocument">
                            <Form.Label>{documentType}</Form.Label>
                            <Form.Control
                                type="text"
                                maxLength={18}
                                onChange={(e) => {
                                    setFieldValue('document', e.target.value.length <= 14 ? cpf(e.target.value) : cnpj(e.target.value), false);
                                    if (e.target.value.length > 14)
                                        setDocumentType("CNPJ");
                                    else
                                        setDocumentType("CPF");
                                }}
                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                    setFieldValue('document', e.target.value.length <= 14 ? cpf(e.target.value) : cnpj(e.target.value));
                                    if (e.target.value.length > 14)
                                        setDocumentType("CNPJ");
                                    else
                                        setDocumentType("CPF");
                                }}
                                value={values.document}
                                name="document"
                                isInvalid={!!errors.document && touched.document}
                            />
                            <Form.Control.Feedback type="invalid">{touched.document && errors.document}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={2} controlId="formGridBirth">
                            <Form.Label>Nascimento</Form.Label>
                            <Form.Control
                                type="date"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.birth}
                                name="birth"
                                isInvalid={!!errors.birth && touched.birth}
                            />
                            <Form.Control.Feedback type="invalid">{touched.birth && errors.birth}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} sm={3} controlId="formGridPhone">
                            <Form.Label>Telefone comercial</Form.Label>
                            <Form.Control
                                type="text"
                                maxLength={15}
                                onChange={(e) => {
                                    setFieldValue('phone', cellphone(e.target.value));
                                }}
                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                    setFieldValue('phone', cellphone(e.target.value));
                                }}
                                value={values.phone}
                                name="phone"
                                isInvalid={!!errors.phone && touched.phone}
                            />
                            <Form.Control.Feedback type="invalid">{touched.phone && errors.phone}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={3} controlId="formGridCellphone">
                            <Form.Label>Celular</Form.Label>
                            <Form.Control
                                type="text"
                                maxLength={15}
                                onChange={(e) => {
                                    setFieldValue('cellphone', cellphone(e.target.value));
                                }}
                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                    setFieldValue('cellphone', cellphone(e.target.value));
                                }}
                                value={values.cellphone}
                                name="cellphone"
                                isInvalid={!!errors.cellphone && touched.cellphone}
                            />
                            <Form.Control.Feedback type="invalid">{touched.cellphone && errors.cellphone}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={6} controlId="formGridEmail">
                            <Form.Label>E-mail</Form.Label>
                            <Form.Control
                                type="email"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                                name="email"
                                isInvalid={!!errors.email && touched.email}
                            />
                            <Form.Control.Feedback type="invalid">{touched.email && errors.email}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} sm={8} controlId="formGridContacts">
                            <Form.Label>Outros contatos</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.contacts}
                                name="contacts"
                                isInvalid={!!errors.contacts && touched.contacts}
                            />
                            <Form.Control.Feedback type="invalid">{touched.contacts && errors.contacts}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={4} controlId="formGridOwner">
                            <Form.Label>Responsável</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.owner}
                                name="owner"
                                isInvalid={!!errors.owner && touched.owner}
                            />
                            <Form.Control.Feedback type="invalid">{touched.owner && errors.owner}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-2">
                        <Form.Group as={Col} sm={6} controlId="formGridAddress">
                            <Form.Label>Endereço</Form.Label>
                            <Form.Control
                                type="address"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.address}
                                name="address"
                                isInvalid={!!errors.address && touched.address}
                            />
                            <Form.Control.Feedback type="invalid">{touched.address && errors.address}</Form.Control.Feedback>
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
                                <option hidden>Escolha</option>
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
                                <option hidden>Escolha</option>
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
                        <Form.Group as={Col} controlId="formGridWarnings">
                            <Form.Check
                                type="switch"
                                id="custom-switch-warnings"
                                label="Observações"
                                onChange={() => { setWarnings(!warnings) }}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row className="mb-3">
                        <Form.Group as={Col} controlId="formGridNotes">
                            <Form.Control
                                as="textarea"
                                rows={4}
                                disabled={!warnings}
                                style={{ resize: 'none' }}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Col className="border-top mb-3"></Col>

                    <Form.Row>
                        <Form.Group as={Col} sm={5} controlId="formGridDocs">
                            <Form.Label>Documentação</Form.Label>
                            <ListGroup className="mb-3">
                                {
                                    docsCustomer.map((doc, index) => {
                                        return <ListGroup.Item key={index} action as="div" variant="light">
                                            <Row>
                                                <Col>
                                                    <Form.Check
                                                        type="checkbox"
                                                        label={doc.name}
                                                        name="docs"
                                                        id={`formHorizontalRadios${doc.id}`}
                                                        value={doc.id}
                                                    />
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    })
                                }
                            </ListGroup>
                        </Form.Group>
                    </Form.Row>

                    {
                        messageShow ? <Alert variant="danger" onClose={() => setMessageShow(false)} dismissible>
                            <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                            <p>
                                Change this and that and try again. Duis mollis, est non commodo
                                luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
                                Cras mattis consectetur purus sit amet fermentum.
                        </p>
                        </Alert> : <Row className="justify-content-end text-end">
                            <Col sm={2}>
                                <Button variant="success" type="submit">Salvar</Button>
                            </Col>

                        </Row>
                    }
                </Form>
            )}
        </Formik>
    </Container>
}