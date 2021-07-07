import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Button, Col, Container, Form, ListGroup, Modal, Row, Toast } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format, subDays } from 'date-fns';
import { FaPlus, FaUserTie } from 'react-icons/fa';
import filesize from "filesize";
import { CircularProgressbar } from 'react-circular-progressbar';
import "react-circular-progressbar/dist/styles.css";

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { Customer } from '../../../components/Customers';
import Members from '../../../components/CustomerMembers';
import { User, can } from '../../../components/Users';
import { CustomerType } from '../../../components/CustomerTypes';
import { DocsCustomer } from '../../../components/DocsCustomer';
import CustomerAttachments from '../../../components/CustomerAttachments';
import { cpf, cnpj, cellphone } from '../../../components/InputMask/masks';
import { statesCities } from '../../../components/StatesCities';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

import styles from './styles.module.css';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!'),
    document: Yup.string().min(14, 'CPF inválido!').max(18, 'CNPJ inválido!').required('Obrigatório!'),
    phone: Yup.string().notRequired().nullable(),
    cellphone: Yup.string().notRequired().nullable(),
    contacts: Yup.string().notRequired().nullable(),
    email: Yup.string().email('E-mail inválido!').notRequired().nullable(),
    address: Yup.string().notRequired().nullable(),
    city: Yup.string().required('Obrigatório!'),
    state: Yup.string().required('Obrigatório!'),
    owner: Yup.string().notRequired().nullable(),
    notes: Yup.string().notRequired().nullable(),
    warnings: Yup.boolean().notRequired(),
    warnings_text: Yup.string().notRequired().nullable(),
    birth: Yup.date().required('Obrigatório!'),
});

const attachmentValidationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    path: Yup.string().required('Obrigatório!'),
    size: Yup.number().lessThan(200 * 1024 * 1024, 'O arquivo não pode ultrapassar 200MB.').notRequired().nullable(),
    received_at: Yup.date().required('Obrigatório!'),
    expire: Yup.boolean().notRequired().nullable(),
    expire_at: Yup.date().required('Obrigatório!'),
    schedule: Yup.boolean().notRequired(),
    schedule_at: Yup.number().required('Obrigatório!'),
    customer: Yup.string().required('Obrigatório!'),
});

export default function NewCustomer() {
    const router = useRouter();
    const { customer } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [customerData, setCustomerData] = useState<Customer>();
    const [users, setUsers] = useState<User[]>([]);
    const [usersToAdd, setUsersToAdd] = useState<User[]>([]);
    const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [hasErrors, setHasErrors] = useState(false);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    const [isUploading, setIsUploading] = useState(false);
    const [uploadingPercentage, setUploadingPercentage] = useState(0);
    const [messageShow, setMessageShow] = useState(false);
    const [messageShowNewAttachment, setMessageShowNewAttachment] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");
    const [documentType, setDocumentType] = useState("CPF");
    const [cities, setCities] = useState<string[]>([]);

    const [showUsers, setShowUsers] = useState(false);

    const toggleShowUsers = () => setShowUsers(!showUsers);

    const [showModalNewAttachment, setShowModalNewAttachment] = useState(false);

    const handleCloseModalNewAttachment = () => setShowModalNewAttachment(false);
    const handleShowModalNewAttachment = () => {
        setFileToSave(undefined);
        setFilePreview('');
        setShowModalNewAttachment(true);
    }

    const [fileToSave, setFileToSave] = useState<File>();
    const [filePreview, setFilePreview] = useState('');

    const [deletingMessageShow, setDeletingMessageShow] = useState(false);

    const [showItemDelete, setShowItemDelete] = useState(false);

    const handleCloseItemDelete = () => setShowItemDelete(false);
    const handelShowItemDelete = () => setShowItemDelete(true);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('customers-index');

        if (user && customer) {
            if (can(user, "customers", "update:any")) {
                api.get(`customers/${customer}`).then(res => {
                    let customerRes: Customer = res.data;

                    if (customerRes.document.length > 14)
                        setDocumentType("CNPJ");

                    try {
                        const stateCities = statesCities.estados.find(item => { return item.nome === res.data.state })

                        if (stateCities)
                            setCities(stateCities.cidades);
                    }
                    catch { }

                    api.get('users').then(res => {
                        setUsers(res.data);
                        const usersRes: User[] = res.data;

                        handleUsersToAdd(usersRes, customerRes);
                    }).catch(err => {
                        console.log('Error to get users on customer edit, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('customers/types').then(res => {
                        setCustomerTypes(res.data);
                    }).catch(err => {
                        console.log('Error to get customer types, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('docs/customer').then(res => {
                        let docsCustomer: DocsCustomer[] = res.data;

                        docsCustomer = docsCustomer.filter(docCustomer => { return docCustomer.active });

                        customerRes = {
                            ...customerRes, docs: docsCustomer.map(docCustomer => {
                                const customerDoc = customerRes.docs.find(customerDoc => { return customerDoc.doc.id === docCustomer.id });

                                if (customerDoc)
                                    return { ...customerDoc, customer: customerRes };

                                return {
                                    id: '0',
                                    path: '',
                                    received_at: new Date(),
                                    checked: false,
                                    customer: customerRes,
                                    doc: docCustomer,
                                };
                            })
                        }

                        setCustomerData(customerRes);
                    }).catch(err => {
                        console.log('Error to get docs customer to edit, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get customer to edit, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setHasErrors(true);
                });
            }
        }
    }, [user, customer]);

    async function handleListMembers() {
        const res = await api.get(`customers/${customer}`);

        const updatedCustomer: Customer = res.data;
        setCustomerData({ ...customerData, members: updatedCustomer.members });

        handleUsersToAdd(users, updatedCustomer);
    }

    async function createMember(userId: string) {
        try {
            await api.post('members/customer', {
                customer: customerData.id,
                user: userId,
            });

            toggleShowUsers();

            handleListMembers();
        }
        catch (err) {
            console.log("Error to create customer member");
            console.log(err);
        }
    }

    async function handleUsersToAdd(usersList: User[], customer: Customer) {
        setUsersToAdd(
            usersList.filter(user => {
                return !customer.members.find(member => {
                    return member.user.id === user.id
                })
            })
        )
    }

    async function handleListAttachments() {
        const res = await api.get(`customers/${customer}`);

        const updatedCustomer: Customer = res.data;

        setCustomerData({ ...customerData, attachments: updatedCustomer.attachments });
    }
    function handleImages(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files[0]) {
            const image = event.target.files[0];

            setFileToSave(image);

            const imagesToPreview = image.name;

            setFilePreview(imagesToPreview);
        }
    }

    function handleChecks(event: ChangeEvent<HTMLInputElement>) {
        const updatedDocs = customerData.docs.map(customerDoc => {
            if (customerDoc.doc.id === event.target.value)
                return { ...customerDoc, checked: !customerDoc.checked }

            return customerDoc;
        });

        setCustomerData({ ...customerData, docs: updatedDocs });
    }

    function handleReceivedAt(docId: string, value: string) {
        const updatedDocs = customerData.docs.map(customerDoc => {

            if (customerDoc.doc.id === docId)
                return { ...customerDoc, received_at: new Date(new Date(`${value} 12:00:00`)) }

            return customerDoc;
        });

        setCustomerData({ ...customerData, docs: updatedDocs });
    }

    async function handleItemDelete() {
        if (customer) {
            setTypeMessage("waiting");
            setDeletingMessageShow(true);

            try {
                if (can(user, "customers", "delete")) {
                    await api.delete(`customers/${customer}`);

                    setTypeMessage("success");

                    setTimeout(() => {
                        router.push('/customers');
                    }, 1000);
                }
            }
            catch (err) {
                console.log('error deleting customer');
                console.log(err);

                setTypeMessage("error");

                setTimeout(() => {
                    setDeletingMessageShow(false);
                }, 4000);
            }
        }
    }

    return (
        <>
            <NextSeo
                title="Editar cliente"
                description="Editar cliente da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Editar cliente',
                    description: 'Editar cliente da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Editar cliente | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />
            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "customers", "update:any") ? <>
                                {
                                    loadingData || hasErrors ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !customerData ? <PageWaiting status="waiting" /> :
                                                    <Container className="content-page">
                                                        <>
                                                            <Row className="mb-3">
                                                                <Col>
                                                                    <PageBack href={`/customers/details/${customerData.id}`} subTitle="Voltar para detalhes do cliente" />
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
                                                                            customerData.members.map(member => {
                                                                                return <Members
                                                                                    key={member.id}
                                                                                    member={member}
                                                                                    canRemove={customerData.members.length > 1}
                                                                                    handleListMembers={handleListMembers}
                                                                                />
                                                                            })
                                                                        }
                                                                        <div className="member-container">
                                                                            <Button
                                                                                onClick={toggleShowUsers}
                                                                                className="member-item"
                                                                                variant="secondary"
                                                                                disabled={usersToAdd.length < 1}
                                                                                title="Adicionar um membro responsável para este cliente."
                                                                            >
                                                                                <FaPlus />
                                                                            </Button>

                                                                            <Toast
                                                                                show={showUsers}
                                                                                onClose={toggleShowUsers}
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: 0,
                                                                                    left: 0,
                                                                                    zIndex: 999,
                                                                                }}
                                                                            >
                                                                                <Toast.Header>
                                                                                    <FaUserTie style={{ marginRight: '.5rem' }} /><strong className="me-auto">Adicionar um membro</strong>
                                                                                </Toast.Header>
                                                                                <Toast.Body>
                                                                                    <ListGroup>
                                                                                        {
                                                                                            usersToAdd.map(user => {
                                                                                                return <ListGroup.Item key={user.id} action onClick={() => createMember(user.id)}>
                                                                                                    {user.name}
                                                                                                </ListGroup.Item>
                                                                                            })
                                                                                        }
                                                                                    </ListGroup>
                                                                                </Toast.Body>
                                                                            </Toast>
                                                                        </div>
                                                                    </Row>
                                                                </Col>
                                                            </Row>

                                                            <Formik
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
                                                                    warnings_text: customerData.warnings_text,
                                                                    birth: format(new Date(customerData.birth), 'yyyy-MM-dd'),
                                                                    type: customerData.type.id,
                                                                }}
                                                                onSubmit={async values => {
                                                                    setTypeMessage("waiting");
                                                                    setMessageShow(true);

                                                                    try {
                                                                        await api.put(`customers/${customerData.id}`, {
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
                                                                            warnings_text: values.warnings_text,
                                                                            birth: new Date(`${values.birth} 12:00:00`),
                                                                            type: values.type,
                                                                        });

                                                                        customerData.docs.forEach(async doc => {
                                                                            if (doc.id === '0') {
                                                                                await api.post('customers/docs', {
                                                                                    path: doc.path,
                                                                                    received_at: doc.received_at,
                                                                                    checked: doc.checked,
                                                                                    customer: doc.customer.id,
                                                                                    doc: doc.doc.id,
                                                                                });
                                                                                return
                                                                            }

                                                                            await api.put(`customers/docs/${doc.id}`, {
                                                                                ...doc,
                                                                                customer: doc.customer.id,
                                                                                doc: doc.doc.id,
                                                                            });
                                                                        });

                                                                        setTypeMessage("success");

                                                                        setTimeout(() => {
                                                                            router.push(`/customers/details/${customerData.id}`)
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

                                                                            <Form.Group as={Col} sm={3} controlId="formGridDocument">
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

                                                                            <Form.Group as={Col} sm={3} controlId="formGridBirth">
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
                                                                                    value={values.state ? values.state : '...'}
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
                                                                                    value={values.city ? values.city : '...'}
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

                                                                        <Row className="mb-3">
                                                                            <Form.Group as={Col} sm={6} controlId="formGridType">
                                                                                <Form.Label>Tipo</Form.Label>
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
                                                                                        customerTypes.map((type, index) => {
                                                                                            return <option key={index} value={type.id}>{type.name}</option>
                                                                                        })
                                                                                    }
                                                                                </Form.Control>
                                                                                <Form.Control.Feedback type="invalid">{touched.type && errors.type}</Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        </Row>

                                                                        <Form.Row className="mb-3">
                                                                            <Form.Group as={Col} controlId="formGridNotes">
                                                                                <Form.Label>Observações</Form.Label>
                                                                                <Form.Control
                                                                                    as="textarea"
                                                                                    rows={4}
                                                                                    style={{ resize: 'none' }}
                                                                                    onChange={handleChange}
                                                                                    onBlur={handleBlur}
                                                                                    value={values.notes}
                                                                                    name="notes"
                                                                                />
                                                                            </Form.Group>
                                                                        </Form.Row>

                                                                        <Form.Row className="mb-2">
                                                                            <Form.Switch
                                                                                id="warnings"
                                                                                label="Pendências"
                                                                                checked={values.warnings}
                                                                                onChange={() => { setFieldValue('warnings', !values.warnings) }}
                                                                            />
                                                                        </Form.Row>

                                                                        <Form.Row className="mb-3">
                                                                            <Form.Group as={Col} controlId="formGridWarningsText">
                                                                                <Form.Control
                                                                                    as="textarea"
                                                                                    rows={4}
                                                                                    disabled={!values.warnings}
                                                                                    style={{ resize: 'none' }}
                                                                                    onChange={handleChange}
                                                                                    onBlur={handleBlur}
                                                                                    value={values.warnings_text}
                                                                                    name="warnings_text"
                                                                                />
                                                                            </Form.Group>
                                                                        </Form.Row>

                                                                        <Col className="border-top mb-3"></Col>

                                                                        <Form.Row className="mb-4">
                                                                            <Form.Group as={Col} controlId="formGridDocs">
                                                                                <h6 className="text-success">Documentação</h6>
                                                                                <ListGroup className="mb-3">
                                                                                    {
                                                                                        customerData.docs.map((doc, index) => {
                                                                                            return <ListGroup.Item key={index} action as="div" variant="light">
                                                                                                <Row className="align-items-center">
                                                                                                    <Col sm={8}>
                                                                                                        <Form.Check
                                                                                                            checked={doc.checked}
                                                                                                            type="checkbox"
                                                                                                            label={doc.doc.name}
                                                                                                            name="type"
                                                                                                            id={`formCustomerDocs${doc.doc.id}`}
                                                                                                            value={doc.doc.id}
                                                                                                            onChange={handleChecks}
                                                                                                        />
                                                                                                    </Col>

                                                                                                    <Form.Label column sm={2}>Data do recebimento</Form.Label>
                                                                                                    <Col sm={2}>
                                                                                                        <Form.Control
                                                                                                            type="date"
                                                                                                            className="form-control"
                                                                                                            onChange={e => handleReceivedAt(doc.doc.id, e.target.value)}
                                                                                                            value={format(new Date(doc.received_at), 'yyyy-MM-dd')}
                                                                                                            name={`receivedAt${doc.doc.id}`}
                                                                                                        />
                                                                                                    </Col>
                                                                                                </Row>
                                                                                            </ListGroup.Item>
                                                                                        })
                                                                                    }
                                                                                </ListGroup>
                                                                            </Form.Group>
                                                                        </Form.Row>

                                                                        <Form.Row className="mb-3">
                                                                            <Form.Group as={Col} controlId="formGridDocs">
                                                                                <Row>
                                                                                    <div className="member-container">
                                                                                        <h6 className="text-success">Anexos</h6>
                                                                                    </div>

                                                                                    <Col sm={1}>
                                                                                        <Button
                                                                                            variant="outline-success"
                                                                                            size="sm"
                                                                                            onClick={handleShowModalNewAttachment}
                                                                                            title="Criar um novo anexo para este cliente."
                                                                                        >
                                                                                            <FaPlus />
                                                                                        </Button>
                                                                                    </Col>
                                                                                </Row>

                                                                                <Row className="mt-2">
                                                                                    {
                                                                                        !!customerData.attachments.length ? <Col>
                                                                                            <ListGroup>
                                                                                                {
                                                                                                    customerData.attachments.map(attachment => {
                                                                                                        return <CustomerAttachments
                                                                                                            key={attachment.id}
                                                                                                            attachment={attachment}
                                                                                                            handleListAttachments={handleListAttachments}
                                                                                                        />
                                                                                                    })
                                                                                                }
                                                                                            </ListGroup>
                                                                                        </Col> :
                                                                                            <Col>
                                                                                                <AlertMessage
                                                                                                    status="warning"
                                                                                                    message="Nenhum anexo enviado para esse cliente."
                                                                                                />
                                                                                            </Col>
                                                                                    }
                                                                                </Row>
                                                                            </Form.Group>
                                                                        </Form.Row>

                                                                        <Row className="justify-content-end">
                                                                            {
                                                                                messageShow ? <Col sm={3}><AlertMessage status={typeMessage} /></Col> :
                                                                                    <>
                                                                                        {
                                                                                            can(user, "customers", "delete") && <Col className="col-row">
                                                                                                <Button
                                                                                                    variant="danger"
                                                                                                    title="Excluir cliente."
                                                                                                    onClick={handelShowItemDelete}
                                                                                                >
                                                                                                    Excluir
                                                                                                </Button>
                                                                                            </Col>
                                                                                        }

                                                                                        <Col sm={1}>
                                                                                            <Button
                                                                                                variant="success"
                                                                                                type="submit"
                                                                                                title="Salvar todas as alteraçãos deste cliente."
                                                                                            >
                                                                                                Salvar
                                                                                            </Button>
                                                                                        </Col>
                                                                                    </>
                                                                            }
                                                                        </Row>
                                                                    </Form>
                                                                )}
                                                            </Formik>

                                                            <Modal show={showModalNewAttachment} onHide={handleCloseModalNewAttachment}>
                                                                <Modal.Header closeButton>
                                                                    <Modal.Title>Criar um anexo</Modal.Title>
                                                                </Modal.Header>
                                                                <Formik
                                                                    initialValues={
                                                                        {
                                                                            name: '',
                                                                            path: '',
                                                                            size: 0,
                                                                            received_at: format(new Date(), 'yyyy-MM-dd'),
                                                                            expire: false,
                                                                            expire_at: format(new Date(), 'yyyy-MM-dd'),
                                                                            schedule: false,
                                                                            schedule_at: 0,
                                                                            customer: customerData.id,
                                                                        }
                                                                    }
                                                                    onSubmit={async values => {
                                                                        setUploadingPercentage(0);
                                                                        setTypeMessage("success");
                                                                        setIsUploading(true);
                                                                        setMessageShowNewAttachment(true);

                                                                        const scheduleAt = format(subDays(new Date(`${values.expire_at} 12:00:00`), values.schedule_at), 'yyyy-MM-dd');

                                                                        try {
                                                                            const data = new FormData();

                                                                            data.append('name', values.name);

                                                                            data.append('file', fileToSave);

                                                                            data.append('received_at', `${values.received_at} 12:00:00`);
                                                                            data.append('expire', String(values.expire));
                                                                            data.append('expire_at', `${values.expire_at} 12:00:00`);
                                                                            data.append('schedule', String(values.schedule));
                                                                            data.append('schedule_at', `${scheduleAt} 12:00:00`);
                                                                            data.append('customer', values.customer);

                                                                            api.post(`customers/${customerData.id}/attachments`, data, {
                                                                                onUploadProgress: e => {
                                                                                    const progress = Math.round((e.loaded * 100) / e.total);

                                                                                    setUploadingPercentage(progress);
                                                                                },
                                                                                timeout: 0,
                                                                            }).then(async () => {
                                                                                await handleListAttachments();

                                                                                setIsUploading(false);
                                                                                setMessageShowNewAttachment(true);

                                                                                setTimeout(() => {
                                                                                    setMessageShowNewAttachment(false);
                                                                                    handleCloseModalNewAttachment();
                                                                                }, 1000);
                                                                            }).catch(err => {
                                                                                console.log('error create attachment.');
                                                                                console.log(err);

                                                                                setIsUploading(false);
                                                                                setMessageShowNewAttachment(true);
                                                                                setTypeMessage("error");

                                                                                setTimeout(() => {
                                                                                    setMessageShowNewAttachment(false);
                                                                                }, 4000);
                                                                            });
                                                                        }
                                                                        catch (err) {
                                                                            console.log('error create attachment.');
                                                                            console.log(err);

                                                                            setIsUploading(false);
                                                                            setMessageShowNewAttachment(true);
                                                                            setTypeMessage("error");

                                                                            setTimeout(() => {
                                                                                setMessageShowNewAttachment(false);
                                                                            }, 4000);
                                                                        }
                                                                    }}
                                                                    validationSchema={attachmentValidationSchema}
                                                                >
                                                                    {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
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
                                                                                    <Col sm={4}>
                                                                                        <label
                                                                                            title="Procurar um arquivo para anexar."
                                                                                            htmlFor="fileAttachement"
                                                                                            className={styles.productImageButton}
                                                                                        >
                                                                                            <Row>
                                                                                                <Col>
                                                                                                    <FaPlus />
                                                                                                </Col>
                                                                                            </Row>

                                                                                            <Row>
                                                                                                <Col>Anexo</Col>
                                                                                            </Row>
                                                                                            <input
                                                                                                type="file"
                                                                                                onChange={(e) => {
                                                                                                    handleImages(e);
                                                                                                    if (e.target.files[0]) {
                                                                                                        setFieldValue('path', e.target.files[0].name);
                                                                                                        setFieldValue('size', e.target.files[0].size);
                                                                                                    }
                                                                                                }}
                                                                                                id="fileAttachement"
                                                                                            />
                                                                                        </label>
                                                                                    </Col>

                                                                                    <Col sm={8}>
                                                                                        <Row>
                                                                                            <Col>
                                                                                                <h6 className="text-cut">{filePreview}</h6>
                                                                                            </Col>
                                                                                        </Row>

                                                                                        <Row>
                                                                                            <Col>
                                                                                                <label className="text-wrap">{fileToSave ? filesize(fileToSave.size) : ''}</label>
                                                                                            </Col>
                                                                                        </Row>
                                                                                    </Col>

                                                                                    <Col className="col-12">
                                                                                        <label className="invalid-feedback" style={{ display: 'block' }}>{errors.path}</label>
                                                                                        <label className="invalid-feedback" style={{ display: 'block' }}>{errors.size}</label>
                                                                                    </Col>
                                                                                </Row>

                                                                                <Form.Group as={Row} controlId="formGridReceivedAt">
                                                                                    <Form.Label column sm={7}>Data do recebimento</Form.Label>
                                                                                    <Col sm={5}>
                                                                                        <Form.Control
                                                                                            type="date"
                                                                                            onChange={handleChange}
                                                                                            onBlur={handleBlur}
                                                                                            value={values.received_at}
                                                                                            name="received_at"
                                                                                            isInvalid={!!errors.received_at && touched.received_at}
                                                                                        />
                                                                                        <Form.Control.Feedback type="invalid">{touched.received_at && errors.received_at}</Form.Control.Feedback>
                                                                                    </Col>
                                                                                </Form.Group>

                                                                                <Form.Group className="mb-3" controlId="formGridExpire">
                                                                                    <Form.Switch
                                                                                        label="Expira?"
                                                                                        checked={values.expire}
                                                                                        onChange={() => { setFieldValue('expire', !values.expire) }}
                                                                                    />
                                                                                </Form.Group>

                                                                                {
                                                                                    values.expire && <>
                                                                                        <Row className="mb-3">
                                                                                            <Form.Group as={Col} sm={6} controlId="formGridExpireAt">
                                                                                                <Form.Label>Data de expiração</Form.Label>
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
                                                                                        </Row>
                                                                                        <Form.Group className="mb-3" controlId="formGridSchedule">
                                                                                            <Form.Switch
                                                                                                label="Notificar"
                                                                                                checked={values.schedule}
                                                                                                onChange={() => { setFieldValue('schedule', !values.schedule) }}
                                                                                            />
                                                                                        </Form.Group>

                                                                                        {
                                                                                            values.schedule && <Row className="mb-3">
                                                                                                <Form.Group as={Col} sm={3} controlId="formGridScheduleAt">
                                                                                                    <Form.Label>Dias antes</Form.Label>
                                                                                                    <Form.Control
                                                                                                        type="number"
                                                                                                        onChange={handleChange}
                                                                                                        onBlur={handleBlur}
                                                                                                        value={values.schedule_at}
                                                                                                        name="schedule_at"
                                                                                                        isInvalid={!!errors.schedule_at && touched.schedule_at}
                                                                                                    />
                                                                                                    <Form.Control.Feedback type="invalid">{touched.schedule_at && errors.schedule_at}</Form.Control.Feedback>
                                                                                                </Form.Group>
                                                                                            </Row>
                                                                                        }
                                                                                    </>
                                                                                }
                                                                            </Modal.Body>
                                                                            <Modal.Footer>
                                                                                {
                                                                                    messageShowNewAttachment ? (
                                                                                        isUploading ? <CircularProgressbar
                                                                                            styles={{
                                                                                                root: { width: 50 },
                                                                                                path: { stroke: "#069140" },
                                                                                                text: {
                                                                                                    fontSize: "30px",
                                                                                                    fill: "#069140"
                                                                                                },
                                                                                            }}
                                                                                            strokeWidth={12}
                                                                                            value={uploadingPercentage}
                                                                                            text={`${uploadingPercentage}%`}
                                                                                        /> :
                                                                                            <AlertMessage status={typeMessage} />
                                                                                    ) :
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

                                                            <Modal show={showItemDelete} onHide={handleCloseItemDelete}>
                                                                <Modal.Header closeButton>
                                                                    <Modal.Title>Excluir cliente</Modal.Title>
                                                                </Modal.Header>
                                                                <Modal.Body>
                                                                    Você tem certeza que deseja excluir o cliente <b>{customerData.name}</b>? Essa ação não poderá ser desfeita.
                                                                </Modal.Body>
                                                                <Modal.Footer>
                                                                    <Row>
                                                                        {
                                                                            deletingMessageShow ? <Col><AlertMessage status={typeMessage} /></Col> :
                                                                                <>
                                                                                    {
                                                                                        can(user, "customers", "delete") && <Col className="col-row">
                                                                                            <Button
                                                                                                variant="danger"
                                                                                                type="button"
                                                                                                onClick={handleItemDelete}
                                                                                            >
                                                                                                Excluir
                                                                                            </Button>
                                                                                        </Col>
                                                                                    }

                                                                                    <Button
                                                                                        className="col-row"
                                                                                        variant="outline-secondary"
                                                                                        onClick={handleCloseItemDelete}
                                                                                    >
                                                                                        Cancelar
                                                                                    </Button>
                                                                                </>
                                                                        }
                                                                    </Row>
                                                                </Modal.Footer>
                                                            </Modal>
                                                        </>
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