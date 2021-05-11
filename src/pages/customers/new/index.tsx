import { Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!'),
    document: Yup.string().required('Obrigatório!'),
    phone: Yup.string().notRequired(),
    cellphone: Yup.string().notRequired(),
    contacts: Yup.string().notRequired(),
    email: Yup.string().notRequired(),
    address: Yup.string().notRequired(),
    city: Yup.string().required('Obrigatório!'),
    state: Yup.string().required('Obrigatório!'),
    owner: Yup.string().notRequired(),
    notes: Yup.string().notRequired(),
    warnings: Yup.boolean().notRequired(),
    birth: Yup.date().required('Obrigatório!'),
});

export default function NewCustomer() {
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
                warnings: false,
                birth: new Date().toString().split('T')[0],
            }}
            onSubmit={async values => {

            }}
            validationSchema={validationSchema}
        >
            {({ handleChange, handleSubmit, values, errors, isValid }) => (
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Form.Group as={Col} sm={6} controlId="formGridName">
                            <Form.Label>Nome do cliente*</Form.Label>
                            <Form.Control
                                type="name"
                                onChange={handleChange}
                                value={values.name}
                                name="name"
                                isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={4} controlId="formGridDocument">
                            <Form.Label>CPF/CNPJ</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                value={values.document}
                                name="document"
                                isInvalid={!!errors.document}
                            />
                            <Form.Control.Feedback type="invalid">{errors.document}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={2} controlId="formGridBirth">
                            <Form.Label>Nascimento</Form.Label>
                            <Form.Control
                                type="date"
                                onChange={handleChange}
                                value={values.birth.toString().split('T')[0]}
                                name="birth"
                                isInvalid={!!errors.birth}
                            />
                            <Form.Control.Feedback type="invalid">{errors.birth}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} sm={3} controlId="formGridPhone">
                            <Form.Label>Telefone comercial</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                value={values.phone}
                                name="phone"
                                isInvalid={!!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={3} controlId="formGridCellphone">
                            <Form.Label>Celular</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                value={values.cellphone}
                                name="cellphone"
                                isInvalid={!!errors.cellphone}
                            />
                            <Form.Control.Feedback type="invalid">{errors.cellphone}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={6} controlId="formGridEmail">
                            <Form.Label>E-mail</Form.Label>
                            <Form.Control
                                type="email"
                                onChange={handleChange}
                                value={values.email}
                                name="email"
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} sm={8} controlId="formGridContacts">
                            <Form.Label>Outros contatos</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                value={values.contacts}
                                name="contacts"
                                isInvalid={!!errors.contacts}
                            />
                            <Form.Control.Feedback type="invalid">{errors.contacts}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={4} controlId="formGridOwner">
                            <Form.Label>Responsável</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                value={values.owner}
                                name="owner"
                                isInvalid={!!errors.owner}
                            />
                            <Form.Control.Feedback type="invalid">{errors.owner}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="mb-2">
                        <Form.Group as={Col} sm={6} controlId="formGridAddress">
                            <Form.Label>Endereço</Form.Label>
                            <Form.Control
                                type="address"
                                onChange={handleChange}
                                value={values.address}
                                name="address"
                                isInvalid={!!errors.address}
                            />
                            <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={2} controlId="formGridState">
                            <Form.Label>Estado</Form.Label>
                            <Form.Control
                                as="select"
                                onChange={handleChange}
                                value={values.state}
                                name="state"
                                isInvalid={!!errors.state}
                            >
                                <option hidden>Escolha</option>
                                <option value={1}>Teste</option>
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} sm={4} controlId="formGridCity">
                            <Form.Label>Cidade</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleChange}
                                value={values.city}
                                name="city"
                                isInvalid={!!errors.city}
                            />
                            <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Form.Row>
                        <Form.Group as={Col} controlId="formGridWarnings">
                            <Form.Check
                                type="switch"
                                id="custom-switch-warnings"
                                label="Observações"
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} controlId="formGridNotes">
                            <Form.Control
                                as="textarea"
                                rows={3}
                            />
                            <Form.Text className="text-muted text-right">1/250 caracteres.</Form.Text>
                        </Form.Group>
                    </Form.Row>
                </Form>
            )}
        </Formik>
    </Container>
}