import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row, Toast } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format, subDays } from 'date-fns';
import { FaSearchPlus, FaPlus, FaUserTie } from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { Property } from '../../../components/Properties';
import Members from '../../../components/PropertyMembers';
import { User, can } from '../../../components/Users';
import { Customer } from '../../../components/Customers';
import { DocsProperty } from '../../../components/DocsProperty';
import PropertyAttachments from '../../../components/PropertyAttachments';
import { statesCities } from '../../../components/StatesCities';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../../components/Interfaces/AlertMessage';
import filesize from "filesize";
import { CircularProgressbar } from 'react-circular-progressbar';
import SearchCustomers from '../../../components/Interfaces/SearchCustomers';

import "react-circular-progressbar/dist/styles.css";
import styles from './styles.module.css';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!'),
    registration: Yup.string().notRequired(),
    route: Yup.string().notRequired().nullable(),
    city: Yup.string().required('Obrigatório!'),
    state: Yup.string().required('Obrigatório!'),
    area: Yup.string().required('Obrigatório!'),
    coordinates: Yup.string().notRequired().nullable(),
    notes: Yup.string().notRequired().nullable(),
    warnings: Yup.boolean().notRequired(),
    warnings_text: Yup.string().notRequired().nullable(),
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
    property: Yup.string().required('Obrigatório!'),
});

export default function NewProperty() {
    const router = useRouter();
    const { property } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [propertyData, setPropertyData] = useState<Property>();
    const [users, setUsers] = useState<User[]>([]);
    const [usersToAdd, setUsersToAdd] = useState<User[]>([]);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
    const [errorSelectedCustomer, setErrorSelectedCustomer] = useState(false);

    const [loadingData, setLoadingData] = useState(true);
    const [hasErrors, setHasErrors] = useState(false);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    const [isUploading, setIsUploading] = useState(false);
    const [uploadingPercentage, setUploadingPercentage] = useState(0);
    const [messageShow, setMessageShow] = useState(false);
    const [messageShowNewAttachment, setMessageShowNewAttachment] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");
    const [cities, setCities] = useState<string[]>([]);

    const [showSearchModal, setShowSearchModal] = useState(false);

    const handleCloseSearchModal = () => setShowSearchModal(false);
    const handleShowSearchModal = () => setShowSearchModal(true);

    const [showUsers, setShowUsers] = useState(false);

    const toggleShowUsers = () => setShowUsers(!showUsers);

    const [showModalNewAttachment, setShowModalNewAttachment] = useState(false);

    const handleCloseModalNewAttachment = () => setShowModalNewAttachment(false);
    const handleShowModalNewAttachment = () => {
        setFileToSave(undefined);
        setFilePreview('');
        setShowModalNewAttachment(true);
    }

    const [deletingMessageShow, setDeletingMessageShow] = useState(false);

    const [showItemDelete, setShowItemDelete] = useState(false);

    const handleCloseItemDelete = () => setShowItemDelete(false);
    const handelShowItemDelete = () => setShowItemDelete(true);

    const [fileToSave, setFileToSave] = useState<File>();
    const [filePreview, setFilePreview] = useState('');

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('properties-index');

        if (user && property) {
            if (can(user, "properties", "update:any")) {
                api.get(`properties/${property}`).then(res => {
                    let propertyRes: Property = res.data;

                    setSelectedCustomer(propertyRes.customer);

                    try {
                        const stateCities = statesCities.estados.find(item => { return item.nome === res.data.state })

                        if (stateCities)
                            setCities(stateCities.cidades);
                    }
                    catch { }

                    api.get('users').then(res => {
                        setUsers(res.data);
                        const usersRes: User[] = res.data;

                        handleUsersToAdd(usersRes, propertyRes);
                    }).catch(err => {
                        console.log('Error to get users on property edit, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('docs/property').then(res => {
                        let docsProperty: DocsProperty[] = res.data;

                        docsProperty = docsProperty.filter(docProperty => { return docProperty.active });

                        propertyRes = {
                            ...propertyRes, docs: docsProperty.map(docProperty => {
                                const propertyDoc = propertyRes.docs.find(propertyDoc => { return propertyDoc.doc.id === docProperty.id });

                                if (propertyDoc)
                                    return { ...propertyDoc, property: propertyRes };

                                return {
                                    id: '0',
                                    path: '',
                                    received_at: new Date(),
                                    checked: false,
                                    property: propertyRes,
                                    doc: docProperty,
                                };
                            })
                        }

                        setPropertyData(propertyRes);
                        setLoadingData(false);
                    }).catch(err => {
                        console.log('Error to get docs property to edit, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });
                }).catch(err => {
                    console.log('Error to get property to edit, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setHasErrors(true);
                });
            }
        }
    }, [user, property]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleCustomer(customer: Customer) {
        setSelectedCustomer(customer);
        setErrorSelectedCustomer(false);
        handleCloseSearchModal();
    }

    async function handleListMembers() {
        if (propertyData) {
            const res = await api.get(`properties/${property}`);

            const updatedProperty: Property = res.data;
            setPropertyData({ ...propertyData, members: updatedProperty.members });

            handleUsersToAdd(users, updatedProperty);
        }
    }

    async function createMember(userId: string) {
        if (propertyData) {
            try {
                await api.post('members/property', {
                    property: propertyData.id,
                    user: userId,
                });

                toggleShowUsers();

                handleListMembers();
            }
            catch (err) {
                console.log("Error to create property member");
                console.log(err);
            }
        }
    }

    async function handleUsersToAdd(usersList: User[], property: Property) {
        setUsersToAdd(
            usersList.filter(user => {
                return !property.members.find(member => {
                    return member.user.id === user.id
                })
            })
        )
    }

    async function handleListAttachments() {
        if (propertyData) {
            const res = await api.get(`properties/${property}`);

            const updatedProperty: Property = res.data;

            setPropertyData({ ...propertyData, attachments: updatedProperty.attachments });
        }
    }
    function handleImages(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files[0]) {
            const image = event.target.files[0];

            setFileToSave(image);

            const imagesToPreview = image.name;

            setFilePreview(imagesToPreview);
        }
    }

    function handleChecks(event: ChangeEvent<HTMLInputElement>) {
        if (propertyData) {
            const updatedDocs = propertyData.docs.map(customerDoc => {
                if (customerDoc.doc.id === event.target.value)
                    return { ...customerDoc, checked: !customerDoc.checked }

                return customerDoc;
            });

            setPropertyData({ ...propertyData, docs: updatedDocs });
        }
    }

    function handleReceivedAt(docId: string, value: string) {
        if (propertyData) {
            const updatedDocs = propertyData.docs.map(customerDoc => {

                if (customerDoc.doc.id === docId)
                    return { ...customerDoc, received_at: new Date(new Date(`${value} 12:00:00`)) }

                return customerDoc;
            });

            setPropertyData({ ...propertyData, docs: updatedDocs });
        }
    }

    async function handleItemDelete() {
        if (user && property) {
            setTypeMessage("waiting");
            setDeletingMessageShow(true);

            try {
                if (can(user, "properties", "delete")) {
                    await api.delete(`properties/${property}`);

                    setTypeMessage("success");

                    setTimeout(() => {
                        router.push('/properties');
                    }, 1000);
                }
            }
            catch (err) {
                console.log('error deleting property');
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
                title="Editar imóvel"
                description="Editar imóvel da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Editar imóvel',
                    description: 'Editar imóvel da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Editar imóvel | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "properties", "update:any") ? <>
                                {
                                    loadingData || hasErrors ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !propertyData ? <PageWaiting status="waiting" /> :
                                                    <Container className="content-page">
                                                        <>
                                                            <Row className="mb-3">
                                                                <Col>
                                                                    <PageBack href={`/properties/details/${propertyData.id}`} subTitle="Voltar para detalhes do imóvel" />
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
                                                                            propertyData.members.map(member => {
                                                                                return <Members
                                                                                    key={member.id}
                                                                                    member={member}
                                                                                    canRemove={propertyData.members.length > 1}
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
                                                                                title="Adicionar um membro responsável para este imóvel."
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
                                                                                    width: 'auto',
                                                                                    maxWidth: 'fit-content',
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
                                                                    name: propertyData.name,
                                                                    registration: propertyData.registration,
                                                                    route: propertyData.route,
                                                                    city: propertyData.city,
                                                                    state: propertyData.state,
                                                                    area: propertyData.area,
                                                                    coordinates: propertyData.coordinates,
                                                                    notes: propertyData.notes,
                                                                    warnings: propertyData.warnings,
                                                                    warnings_text: propertyData.warnings_text,
                                                                }}
                                                                onSubmit={async values => {
                                                                    if (!selectedCustomer) {
                                                                        setErrorSelectedCustomer(true);
                                                                        return;
                                                                    }

                                                                    setTypeMessage("waiting");
                                                                    setMessageShow(true);

                                                                    try {
                                                                        await api.put(`properties/${propertyData.id}`, {
                                                                            name: values.name,
                                                                            registration: values.registration,
                                                                            route: values.route,
                                                                            city: values.city,
                                                                            state: values.state,
                                                                            area: values.area,
                                                                            coordinates: values.coordinates,
                                                                            notes: values.notes,
                                                                            warnings: values.warnings,
                                                                            warnings_text: values.warnings_text,
                                                                            customer: selectedCustomer.id,
                                                                        });

                                                                        propertyData.docs.forEach(async doc => {
                                                                            if (doc.id === '0') {
                                                                                await api.post('properties/docs', {
                                                                                    path: doc.path,
                                                                                    received_at: doc.received_at,
                                                                                    checked: doc.checked,
                                                                                    property: doc.property.id,
                                                                                    doc: doc.doc.id,
                                                                                });
                                                                                return
                                                                            }

                                                                            await api.put(`properties/docs/${doc.id}`, {
                                                                                ...doc,
                                                                                property: doc.property.id,
                                                                                doc: doc.doc.id,
                                                                            });
                                                                        });

                                                                        setTypeMessage("success");

                                                                        setTimeout(() => {
                                                                            router.push(`/properties/details/${propertyData.id}`)
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
                                                                                        value={selectedCustomer ? selectedCustomer.name : ''}
                                                                                        name="customerName"
                                                                                        aria-label="Nome do cliente"
                                                                                        aria-describedby="btnGroupAddon"
                                                                                        isInvalid={errorSelectedCustomer}
                                                                                        readOnly
                                                                                    />
                                                                                    <Button
                                                                                        id="btnGroupAddon"
                                                                                        variant="success"
                                                                                        onClick={handleShowSearchModal}
                                                                                    >
                                                                                        <FaSearchPlus />
                                                                                    </Button>
                                                                                </InputGroup>
                                                                                <Form.Control.Feedback type="invalid">{errorSelectedCustomer && 'Obrigatório!'}</Form.Control.Feedback>
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

                                                                            <Form.Group as={Col} sm={4} controlId="formGridArea">
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

                                                                            <Form.Group as={Col} sm={4} controlId="formGridCoordinates">
                                                                                <Form.Label>Coordenadas</Form.Label>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    onChange={handleChange}
                                                                                    onBlur={handleBlur}
                                                                                    value={values.coordinates}
                                                                                    name="coordinates"
                                                                                    isInvalid={!!errors.coordinates && touched.coordinates}
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">{touched.coordinates && errors.coordinates}</Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        </Row>

                                                                        <Row className="mb-2">
                                                                            <Form.Group as={Col} sm={2} controlId="formGridState">
                                                                                <Form.Label>Estado</Form.Label>
                                                                                <Form.Select
                                                                                    onChange={(e) => {
                                                                                        setFieldValue('state', e.currentTarget.value);
                                                                                        const stateCities = statesCities.estados.find(item => { return item.nome === e.currentTarget.value })

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
                                                                                </Form.Select>
                                                                                <Form.Control.Feedback type="invalid">{touched.state && errors.state}</Form.Control.Feedback>
                                                                            </Form.Group>

                                                                            <Form.Group as={Col} sm={4} controlId="formGridCity">
                                                                                <Form.Label>Cidade</Form.Label>
                                                                                <Form.Select
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
                                                                                </Form.Select>
                                                                                <Form.Control.Feedback type="invalid">{touched.city && errors.city}</Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        </Row>

                                                                        <Row className="mb-3">
                                                                            <Form.Group as={Col} controlId="formGridRoute">
                                                                                <Form.Label>Roteiro</Form.Label>
                                                                                <Form.Control
                                                                                    as="textarea"
                                                                                    rows={4}
                                                                                    style={{ resize: 'none' }}
                                                                                    onChange={handleChange}
                                                                                    onBlur={handleBlur}
                                                                                    value={values.route}
                                                                                    name="route"
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">{touched.route && errors.route}</Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        </Row>

                                                                        <Row className="mb-3">
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
                                                                        </Row>

                                                                        <Row className="mb-2">
                                                                            <Col>
                                                                                <Form.Switch
                                                                                    id="warnings"
                                                                                    label="Pendências"
                                                                                    checked={values.warnings}
                                                                                    onChange={() => { setFieldValue('warnings', !values.warnings) }}
                                                                                />
                                                                            </Col>
                                                                        </Row>

                                                                        <Row className="mb-3">
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
                                                                        </Row>

                                                                        <Col className="border-top mb-3"></Col>

                                                                        <Row className="mb-4">
                                                                            <Form.Group as={Col}>
                                                                                <Form.Label>Documentação</Form.Label>
                                                                                <ListGroup className="mb-3">
                                                                                    {
                                                                                        propertyData.docs.map((doc, index) => {
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
                                                                        </Row>

                                                                        <Row className="mb-3">
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
                                                                                            title="Criar um novo anexo para este imóvel."
                                                                                        >
                                                                                            <FaPlus />
                                                                                        </Button>
                                                                                    </Col>
                                                                                </Row>

                                                                                <Row className="mt-2">
                                                                                    {
                                                                                        !!propertyData.attachments.length ? <Col>
                                                                                            <ListGroup>
                                                                                                {
                                                                                                    propertyData.attachments.map(attachment => {
                                                                                                        return <PropertyAttachments
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
                                                                                                    message="Nenhum anexo enviado para esse imóvel."
                                                                                                />
                                                                                            </Col>
                                                                                    }
                                                                                </Row>
                                                                            </Form.Group>
                                                                        </Row>

                                                                        <Row className="justify-content-end">
                                                                            {
                                                                                messageShow ? <Col sm={3}><AlertMessage status={typeMessage} /></Col> :
                                                                                    <>
                                                                                        {
                                                                                            can(user, "properties", "delete") && <Col className="col-row">
                                                                                                <Button
                                                                                                    variant="danger"
                                                                                                    title="Excluir cliente."
                                                                                                    onClick={handelShowItemDelete}
                                                                                                >
                                                                                                    Excluir
                                                                                                </Button>
                                                                                            </Col>
                                                                                        }

                                                                                        <Col className="col-row">
                                                                                            <Button variant="success" type="submit">Salvar</Button>
                                                                                        </Col>
                                                                                    </>
                                                                            }
                                                                        </Row>
                                                                    </Form>
                                                                )}
                                                            </Formik>

                                                            <SearchCustomers
                                                                show={showSearchModal}
                                                                handleCustomer={handleCustomer}
                                                                handleCloseSearchModal={handleCloseSearchModal}
                                                            />

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
                                                                            property: propertyData.id,
                                                                        }
                                                                    }
                                                                    onSubmit={async values => {
                                                                        if (fileToSave) {
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
                                                                                data.append('property', values.property);

                                                                                await api.post(`properties/${propertyData.id}/attachments`, data, {
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
                                                                                                    if (e.target.files && e.target.files[0]) {
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
                                                                    Você tem certeza que deseja excluir o imóvel <b>{propertyData.name}</b>? Essa ação não poderá ser desfeita.
                                                                </Modal.Body>
                                                                <Modal.Footer>
                                                                    <Row>
                                                                        {
                                                                            deletingMessageShow ? <Col><AlertMessage status={typeMessage} /></Col> :
                                                                                <>
                                                                                    {
                                                                                        can(user, "properties", "delete") && <Col className="col-row">
                                                                                            <Button
                                                                                                variant="danger"
                                                                                                type="button"
                                                                                                onClick={handleItemDelete}
                                                                                            >
                                                                                                Excluir
                                                                                            </Button>
                                                                                        </Col>
                                                                                    }

                                                                                    <Col className="col-row">
                                                                                        <Button
                                                                                            variant="outline-secondary"
                                                                                            onClick={handleCloseItemDelete}
                                                                                        >
                                                                                            Cancelar
                                                                                        </Button>
                                                                                    </Col>
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