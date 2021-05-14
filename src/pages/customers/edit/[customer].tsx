import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Col, Container, Form, ListGroup, Modal, Row } from 'react-bootstrap';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { FaLongArrowAltLeft, FaPlus } from 'react-icons/fa';

import api from '../../../services/api';
import { Customer } from '../../../components/Customers';
import { DocsCustomer } from '../../../components/DocsCustomer';
import CustomerAttachments from '../../../components/CustomerAttachments';
import { cpf, cnpj, cellphone } from '../../../components/InputMask/masks';
import { statesCities } from '../../../components/StatesCities';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

import styles from './styles.module.css';

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
    const router = useRouter();
    const { customer } = router.query;

    const [customerData, setCustomerData] = useState<Customer>();
    const [docsCustomer, setDocsCustomer] = useState<DocsCustomer[]>([]);
    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");
    const [documentType, setDocumentType] = useState("CPF");
    const [cities, setCities] = useState<string[]>([]);

    const [showModalNewAttachment, setShowModalNewAttachment] = useState(false);

    const handleCloseModalNewAttachment = () => setShowModalNewAttachment(false);
    const handleShowModalNewAttachment = () => setShowModalNewAttachment(true);

    const [fileToSave, setFileToSave] = useState<File>();
    const [filePreview, setFilePreview] = useState('');

    useEffect(() => {
        api.get(`customers/${customer}`).then(res => {
            setCustomerData(res.data);

            api.get(`docs/customer${customer}`).then(res => {
                setDocsCustomer(res.data);
            }).catch(err => {
                console.log('Error to get docs customer to edit, ', err);
            })
        }).catch(err => {
            console.log('Error to get customer to edit, ', err);
        });
    }, []);

    async function handleListAttachments() {
        const res = await api.get(`customers/${customer}`);

        const updatedCustomer: Customer = res.data;

        setCustomerData({ ...customerData, attachments: updatedCustomer.attachments });
    }

    function handleImages(event: ChangeEvent<HTMLInputElement>) {
        const image = event.target.files[0];

        setFileToSave(image);

        const imagesToPreview = image.name;

        setFilePreview(imagesToPreview);
    }

    return <Container className="content-page">
        {
            customerData && <Formik
                initialValues={{
                    name: customerData.name,
                    document: customerData.document,
                    phone: customerData.phone,
                    cellphone: customerData.cellphone,
                    contacts: customerData.contacts,
                    email: customerData.email,
                    address: customerData.address,
                    city: customerData.city,
                    state: customerData.state,
                    owner: customerData.owner,
                    notes: customerData.notes,
                    warnings: customerData.warnings,
                    birth: format(customerData.birth, 'yyyy-MM-dd'),
                    docs: [],
                }}
                onSubmit={async values => {
                    setTypeMessage("waiting");
                    setMessageShow(true);

                    const docs = docsCustomer.map(doc => {
                        let checked = false;

                        values.docs.forEach(item => { if (item === doc.id) checked = true });

                        return { checked, doc: doc.id }
                    });

                    try {
                        const res = await api.post('customers', {
                            name: values.name,
                            document: values.document,
                            phone: values.phone,
                            cellphone: values.cellphone,
                            contacts: values.contacts,
                            email: values.email,
                            address: values.address,
                            city: values.city,
                            state: values.state,
                            owner: values.owner,
                            notes: values.notes,
                            warnings: values.warnings,
                            birth: values.birth,
                            docs,
                        });

                        setTypeMessage("success");

                        setTimeout(() => {
                            router.push(`/customers/details/${res.data.id}`)
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
                            <Link href="/customers">
                                <a title="Voltar para a lista de clientes" data-title="Voltar para a lista de clientes">
                                    <FaLongArrowAltLeft /> voltar
                                </a>
                            </Link>
                        </Row>

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
                                        docsCustomer.map((doc, index) => {
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

                        <Form.Row className="mb-3">
                            <Form.Group as={Col} sm={5} controlId="formGridDocs">
                                <Row>
                                    <Col>
                                        <Form.Label>Anexos</Form.Label>
                                    </Col>

                                    <Col>
                                        <Button variant="outline-success" onClick={handleShowModalNewAttachment}>
                                            <FaPlus />
                                        </Button>
                                    </Col>
                                </Row>

                                <ListGroup className="mb-3">
                                    {
                                        customerData.attachments.map((attachment, index) => {
                                            return <CustomerAttachments
                                                key={index}
                                                attachment={attachment}
                                                handleListAttachments={handleListAttachments}
                                            />
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
        }

        <Modal show={showModalNewAttachment} onHide={handleCloseModalNewAttachment}>
            <Modal.Header closeButton>
                <Modal.Title>Criar um anexo</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={
                    {
                        name: '',
                        path: '',
                        received_at: format(new Date(), 'yyyy-MM-dd'),
                        expire: false,
                        expire_at: format(new Date(), 'yyyy-MM-dd'),
                        renewal: 0,
                    }
                }
                onSubmit={async values => {
                    setTypeMessage("waiting");
                    setMessageShow(true);

                    try {
                        const data = new FormData();

                        data.append('name', values.name);

                        data.append('file', fileToSave);

                        data.append('received_at', values.received_at);
                        data.append('expire', String(values.expire));
                        data.append('expire_at', values.expire_at);
                        data.append('renewal', String(values.renewal));

                        await api.post('customers/attachments', data);

                        await handleListAttachments();

                        setTypeMessage("success");

                        setTimeout(() => {
                            setMessageShow(false);
                            handleCloseModalNewAttachment();
                        }, 2000);
                    }
                    catch (err) {
                        console.log('error create attachment.');
                        console.log(err);

                        setTypeMessage("error");

                        setTimeout(() => {
                            setMessageShow(false);
                        }, 4000);
                    }
                }}
                validationSchema={validationSchema}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Group controlId="attachmentFormGridName">
                                <Form.Label>Nome do documento</Form.Label>
                                <Form.Control type="text"
                                    placeholder="Nome"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.name}
                                    name="name"
                                    isInvalid={!!errors.name && touched.name}
                                />
                                <Form.Control.Feedback type="invalid">{touched.name && errors.name}</Form.Control.Feedback>
                                <Form.Text className="text-muted text-right">{`${values.name.length}/50 caracteres.`}</Form.Text>
                            </Form.Group>

                            <Row className="mb-3">
                                <label htmlFor="fileAttachement" className={styles.productImageButton}>
                                    <Row>
                                        <Col>
                                            <FaPlus />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            Anexo
                                        </Col>
                                    </Row>
                                    <input
                                        type="file" accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf"
                                        onChange={handleImages}
                                        id="fileAttachement"
                                    />
                                </label>
                                <label>{filePreview}</label>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col} sm={4} controlId="formGridReceivedAt">
                                    <Form.Label>Data do recebimento</Form.Label>
                                    <Form.Control
                                        type="date"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.received_at}
                                        name="received_at"
                                        isInvalid={!!errors.received_at && touched.received_at}
                                    />
                                    <Form.Control.Feedback type="invalid">{touched.received_at && errors.received_at}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col} sm={4} controlId="formGridExpire">
                                    <label>
                                        <Field type="checkbox" name="expire" /> Expira?
                                        </label>
                                </Form.Group>

                                {
                                    values.expire && <Form.Group as={Col} sm={4} controlId="formGridExpireAt">
                                        <Form.Label>Nascimento</Form.Label>
                                        <Form.Control
                                            type="date"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.expire_at}
                                            name="expire_at"
                                            isInvalid={!!errors.expire_at && touched.expire_at}
                                        />
                                        <Form.Control.Feedback type="invalid">{touched.expire_at && errors.expire_at}</Form.Control.Feedback>
                                    </Form.Group>
                                }
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col} sm={2} controlId="formGridName">
                                    <Form.Label>Dias para renovar</Form.Label>
                                    <Form.Control
                                        type="number"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={Number(values.renewal)}
                                        name="renewal"
                                        isInvalid={!!errors.renewal && touched.renewal}
                                    />
                                    <Form.Control.Feedback type="invalid">{touched.name && errors.name}</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            {
                                messageShow ? <AlertMessage status={typeMessage} /> :
                                    <>
                                        <Button variant="secondary" onClick={handleCloseModalNewAttachment}>Cancelar</Button>
                                        <Button variant="success" type="submit">Salvar</Button>
                                    </>
                            }
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    </Container>
}