import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { FaFileAlt, FaHistory, FaPlus, FaSearchPlus, FaUserTie } from 'react-icons/fa';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row, Toast } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format, subDays } from 'date-fns';
import filesize from "filesize";
import { CircularProgressbar } from 'react-circular-progressbar';
import "react-circular-progressbar/dist/styles.css";

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { Licensing } from '../../../components/Licensings';
import Members from '../../../components/LicensingMembers';
import { User, can } from '../../../components/Users';
import { Customer } from '../../../components/Customers';
import { LicensingAgency } from '../../../components/LicensingAgencies';
import { LicensingAuthorization } from '../../../components/LicensingAuthorizations';
import { LicensingInfringement } from '../../../components/LicensingInfringements';
import { LicensingStatus } from '../../../components/LicensingStatus';
import { Property } from '../../../components/Properties';
import EventsLicensing from '../../../components/EventsLicensing';
import LicensingAttachments from '../../../components/LicensingAttachments';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

import styles from './styles.module.css';

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
    licensing: Yup.string().required('Obrigatório!'),
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
    const { licensing } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [data, setData] = useState<Licensing>();
    const [users, setUsers] = useState<User[]>([]);
    const [usersToAdd, setUsersToAdd] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [licensingAgencies, setLicensingAgencies] = useState<LicensingAgency[]>([]);
    const [licensingAuthorizations, setLicensingAuthorizations] = useState<LicensingAuthorization[]>([]);
    const [licensingInfringements, setLicensingInfringements] = useState<LicensingInfringement[]>([]);
    const [licensingStatus, setLicensingStatus] = useState<LicensingStatus[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [hasErrors, setHasErrors] = useState(false);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    const [isUploading, setIsUploading] = useState(false);
    const [uploadingPercentage, setUploadingPercentage] = useState(0);
    const [messageShow, setMessageShow] = useState(false);
    const [eventMessageShow, setEventMessageShow] = useState(false);
    const [messageShowNewAttachment, setMessageShowNewAttachment] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    const [showUsers, setShowUsers] = useState(false);

    const toggleShowUsers = () => setShowUsers(!showUsers);

    const [showModalChooseCustomer, setShowModalChooseCustomer] = useState(false);

    const handleCloseModalChooseCustomer = () => setShowModalChooseCustomer(false);
    const handleShowModalChooseCustomer = () => setShowModalChooseCustomer(true);

    const [showModalNewEvent, setShowModalNewEvent] = useState(false);

    const handleCloseModalNewEvent = () => setShowModalNewEvent(false);
    const handleShowModalNewEvent = () => setShowModalNewEvent(true);

    const [showModalNewAttachment, setShowModalNewAttachment] = useState(false);

    const handleCloseModalNewAttachment = () => setShowModalNewAttachment(false);
    const handleShowModalNewAttachment = () => {
        setFileToSave(undefined);
        setFilePreview('');
        setShowModalNewAttachment(true);
    }

    const [fileToSave, setFileToSave] = useState<File>();
    const [filePreview, setFilePreview] = useState('');

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-index');

        if (user && licensing) {
            if (can(user, "licensings", "update:any")) {

                api.get(`licensings/${licensing}`).then(res => {
                    const licensingRes: Licensing = res.data;

                    api.get('users').then(res => {
                        setUsers(res.data);
                        const usersRes: User[] = res.data;

                        handleUsersToAdd(usersRes, licensingRes);
                    }).catch(err => {
                        console.log('Error to get users on licensing edit, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('customers').then(res => {
                        setCustomers(res.data);
                    }).catch(err => {
                        console.log('Error to get licensings customers, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('licensings/agencies').then(res => {
                        setLicensingAgencies(res.data);
                    }).catch(err => {
                        console.log('Error to get licensings agencies, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('licensings/authorizations').then(res => {
                        setLicensingAuthorizations(res.data);
                    }).catch(err => {
                        console.log('Error to get licensings authorizations, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('licensings/infringements').then(res => {
                        setLicensingInfringements(res.data);
                    }).catch(err => {
                        console.log('Error to get licensings infringements, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('licensings/status').then(res => {
                        setLicensingStatus(res.data);
                    }).catch(err => {
                        console.log('Error to get licensings status, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get(`customers/${licensingRes.customer.id}/properties`).then(res => {
                        setProperties(res.data);

                        setData(licensingRes);
                        setLoadingData(false);
                    }).catch(err => {
                        console.log('Error to get customer properties ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });
                }).catch(err => {
                    console.log('Error to get licensing, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setHasErrors(true);
                });
            }
        }
    }, [user, licensing]);

    async function handleListEvents() {
        const res = await api.get(`licensings/${licensing}`);

        setData(res.data);
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

            if (!!customersFound.length) resultsUpdated = customersFound;

            setCustomerResults(resultsUpdated);
        }
    }

    async function handleListMembers() {
        const res = await api.get(`licensings/${licensing}`);

        const updatedCustomer: Licensing = res.data;
        setData({ ...data, members: updatedCustomer.members });

        handleUsersToAdd(users, updatedCustomer);
    }

    async function createMember(userId: string) {
        try {
            await api.post('members/licensing', {
                licensing: data.id,
                user: userId,
            });

            toggleShowUsers();

            handleListMembers();
        }
        catch (err) {
            console.log("Error to create licensing member");
            console.log(err);
        }
    }

    async function handleUsersToAdd(usersList: User[], licensing: Licensing) {
        setUsersToAdd(
            usersList.filter(user => {
                return !licensing.members.find(member => {
                    return member.user.id === user.id
                })
            })
        )
    }

    async function handleListAttachments() {
        const res = await api.get(`licensings/${licensing}`);

        const updatedCustomer: Licensing = res.data;

        setData({ ...data, attachments: updatedCustomer.attachments });
    }

    function handleImages(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files[0]) {
            const image = event.target.files[0];

            setFileToSave(image);

            const imagesToPreview = image.name;

            setFilePreview(imagesToPreview);
        }
    }

    return (
        <>
            <NextSeo
                title="Editar licenciamento"
                description="Editar licenciamento da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Editar licenciamento',
                    description: 'Editar licenciamento da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Editar licenciamento | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "licensings", "update:any") ? <>
                                {
                                    loadingData || hasErrors ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !data ? <PageWaiting status="waiting" /> :
                                                    <Container className="content-page">
                                                        <Row className="mb-3">
                                                            <Col>
                                                                <PageBack href={`/licensings/details/${data.id}`} subTitle="Voltar para detalhes do projeto" />
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
                                                                        data.members.map(member => {
                                                                            return <Members
                                                                                key={member.id}
                                                                                member={member}
                                                                                canRemove={data.members.length > 1}
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
                                                                            title="Adicionar um membro responsável para este projeto."
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
                                                                licensing_number: data.licensing_number,
                                                                expire: data.expire,
                                                                renovation: data.renovation,
                                                                deadline: data.deadline,
                                                                process_number: data.process_number,
                                                                customer: data.customer.id,
                                                                customerName: data.customer.name,
                                                                property: data.property ? data.property.id : '0',
                                                                infringement: data.infringement ? data.infringement.id : '0',
                                                                authorization: data.authorization.id,
                                                                agency: data.agency.id,
                                                                status: data.status.id,
                                                            }}
                                                            onSubmit={async values => {
                                                                setTypeMessage("waiting");
                                                                setMessageShow(true);

                                                                try {
                                                                    await api.put(`licensings/${data.id}`, {
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
                                                                        router.push(`/licensings/details/${data.id}`);
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
                                                                            <Form.Label>Validade</Form.Label>
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

                                                        <Col className="border-top mt-3 mb-3"></Col>

                                                        <Row className="mb-3">
                                                            <Col>
                                                                <Row>
                                                                    <div className="member-container">
                                                                        <h6 className="text-success">Histórico <FaHistory /></h6>
                                                                    </div>

                                                                    <Col sm={1}>
                                                                        <Button
                                                                            variant="outline-success"
                                                                            size="sm"
                                                                            onClick={handleShowModalNewEvent}
                                                                            title="Criar um novo evento para este licensiamento."
                                                                        >
                                                                            <FaPlus />
                                                                        </Button>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="mt-2">
                                                                    {
                                                                        !!data.events.length ? <Col>
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
                                                                                            data.events.map((event, index) => {
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

                                                        <Form.Row className="mb-3">
                                                            <Form.Group as={Col} controlId="formGridAttachments">
                                                                <Row>
                                                                    <div className="member-container">
                                                                        <h6 className="text-success">Anexos <FaFileAlt /></h6>
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
                                                                        !!data.attachments.length ? <Col>
                                                                            <ListGroup>
                                                                                {
                                                                                    data.attachments.map(attachment => {
                                                                                        return <LicensingAttachments
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
                                                                                    message="Nenhum anexo enviado para esse licenciamento."
                                                                                />
                                                                            </Col>
                                                                    }
                                                                </Row>
                                                            </Form.Group>
                                                        </Form.Row>

                                                        <Modal show={showModalNewEvent} onHide={handleCloseModalNewEvent}>
                                                            <Modal.Header closeButton>
                                                                <Modal.Title>Criar evento</Modal.Title>
                                                            </Modal.Header>
                                                            <Formik
                                                                initialValues={
                                                                    {
                                                                        description: '',
                                                                        licensing: data.id,
                                                                    }
                                                                }
                                                                onSubmit={async values => {
                                                                    setTypeMessage("waiting");
                                                                    setEventMessageShow(true);

                                                                    try {
                                                                        await api.post('events/licensing', {
                                                                            description: values.description,
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
                                                                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
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
                                                                        customer: data.id,
                                                                    }
                                                                }
                                                                onSubmit={async values => {
                                                                    setUploadingPercentage(0);
                                                                    setTypeMessage("success");
                                                                    setIsUploading(true);
                                                                    setMessageShowNewAttachment(true);

                                                                    const scheduleAt = format(subDays(new Date(`${values.expire_at} 12:00:00`), values.schedule_at), 'yyyy-MM-dd');

                                                                    try {
                                                                        const formData = new FormData();

                                                                        formData.append('name', values.name);

                                                                        formData.append('file', fileToSave);

                                                                        formData.append('received_at', `${values.received_at} 12:00:00`);
                                                                        formData.append('expire', String(values.expire));
                                                                        formData.append('expire_at', `${values.expire_at} 12:00:00`);
                                                                        formData.append('schedule', String(values.schedule));
                                                                        formData.append('schedule_at', `${scheduleAt} 12:00:00`);
                                                                        formData.append('licensing', values.customer);

                                                                        await api.post(`licensings/${data.id}/attachments`, formData, {
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

                                                                            <Form.Group className="mb-3" controlId="formGridAttachmentExpire">
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