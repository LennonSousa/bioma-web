import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { FaFileAlt, FaHistory, FaPlus, FaSearchPlus, FaUserTie } from 'react-icons/fa';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row, Toast } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format, subDays } from 'date-fns';
import filesize from "filesize";
import { CircularProgressbar } from 'react-circular-progressbar';
import produce from 'immer';

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
import { ProjectType } from '../../../components/ProjectTypes';
import { ProjectLine } from '../../../components/ProjectLines';
import { Bank } from '../../../components/Banks';
import { Property } from '../../../components/Properties';
import EventsLicensing from '../../../components/EventsLicensing';
import LicensingAttachments, { LicensingAttachment } from '../../../components/LicensingAttachments';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { prettifyCurrency } from '../../../components/InputMask/masks';
import { AlertMessage, statusModal } from '../../../components/Interfaces/AlertMessage';
import SearchCustomers from '../../../components/Interfaces/SearchCustomers';

import "react-circular-progressbar/dist/styles.css";
import styles from './styles.module.css';

const validationSchema = Yup.object().shape({
    licensing_number: Yup.string().notRequired().nullable(),
    expire: Yup.string().notRequired().nullable(),
    renovation: Yup.string().notRequired().nullable(),
    deadline: Yup.string().notRequired().nullable(),
    process_number: Yup.string().notRequired().nullable(),
    value: Yup.string().notRequired(),
    deal: Yup.string().notRequired(),
    paid: Yup.boolean().notRequired(),
    paid_date: Yup.string().notRequired().nullable(),
    contract: Yup.string().notRequired().nullable(),
    notes: Yup.string().notRequired().nullable(),
    customer: Yup.string().required('Obrigat??rio!'),
    infringement: Yup.string().notRequired().nullable(),
    authorization: Yup.string().required('Obrigat??rio!'),
    agency: Yup.string().required('Obrigat??rio!'),
    status: Yup.string().required('Obrigat??rio!'),
    type: Yup.string().required('Obrigat??rio!'),
    line: Yup.string().required('Obrigat??rio!'),
    bank: Yup.string().required('Obrigat??rio!'),
});

const validationSchemaEvents = Yup.object().shape({
    description: Yup.string().required('Obrigat??rio!'),
    licensing: Yup.string().required('Obrigat??rio!'),
});

const attachmentValidationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigat??rio!').max(50, 'Deve conter no m??ximo 50 caracteres!'),
    path: Yup.string().required('Obrigat??rio!'),
    size: Yup.number().lessThan(200 * 1024 * 1024, 'O arquivo n??o pode ultrapassar 200MB.').notRequired().nullable(),
    received_at: Yup.date().required('Obrigat??rio!'),
    expire: Yup.boolean().notRequired().nullable(),
    expire_at: Yup.date().required('Obrigat??rio!'),
    schedule: Yup.boolean().notRequired(),
    schedule_at: Yup.number().required('Obrigat??rio!'),
    customer: Yup.string().required('Obrigat??rio!'),
});

export default function NewCustomer() {
    const router = useRouter();
    const { licensing } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [data, setData] = useState<Licensing>();
    const [users, setUsers] = useState<User[]>([]);
    const [usersToAdd, setUsersToAdd] = useState<User[]>([]);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
    const [errorSelectedCustomer, setErrorSelectedCustomer] = useState(false);

    const [selectedProperty, setSelectedProperty] = useState<Property>();

    const [licensingAgencies, setLicensingAgencies] = useState<LicensingAgency[]>([]);
    const [licensingAuthorizations, setLicensingAuthorizations] = useState<LicensingAuthorization[]>([]);
    const [licensingInfringements, setLicensingInfringements] = useState<LicensingInfringement[]>([]);
    const [licensingStatus, setLicensingStatus] = useState<LicensingStatus[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [projectLines, setProjectLines] = useState<ProjectLine[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
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

    const [showSearchModal, setShowSearchModal] = useState(false);

    const handleCloseSearchModal = () => setShowSearchModal(false);
    const handleShowSearchModal = () => setShowSearchModal(true);

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

    const [deletingMessageShow, setDeletingMessageShow] = useState(false);

    const [showItemDelete, setShowItemDelete] = useState(false);

    const handleCloseItemDelete = () => setShowItemDelete(false);
    const handelShowItemDelete = () => setShowItemDelete(true);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-index');

        if (user && licensing) {
            if (can(user, "licensings", "update")) {

                api.get(`licensings/${licensing}`).then(res => {
                    const licensingRes: Licensing = res.data;

                    setSelectedCustomer(licensingRes.customer);

                    api.get('users').then(res => {
                        setUsers(res.data);
                        const usersRes: User[] = res.data;

                        handleUsersToAdd(usersRes, licensingRes);
                    }).catch(err => {
                        console.log('Error to get users on licensing edit, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('licensings/agencies').then(res => {
                        setLicensingAgencies(res.data);
                    }).catch(err => {
                        console.log('Error to get licensings agencies, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('licensings/authorizations').then(res => {
                        setLicensingAuthorizations(res.data);
                    }).catch(err => {
                        console.log('Error to get licensings authorizations, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('licensings/infringements').then(res => {
                        setLicensingInfringements(res.data);
                    }).catch(err => {
                        console.log('Error to get licensings infringements, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('projects/types').then(res => {
                        setProjectTypes(res.data);
                    }).catch(err => {
                        console.log('Error to get project types, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('projects/lines').then(res => {
                        setProjectLines(res.data);
                    }).catch(err => {
                        console.log('Error to get project lines, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('banks').then(res => {
                        setBanks(res.data);
                    }).catch(err => {
                        console.log('Error to get banks, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get('licensings/status').then(res => {
                        setLicensingStatus(res.data);

                        setData(licensingRes);
                        setLoadingData(false);
                    }).catch(err => {
                        console.log('Error to get licensings status, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                    api.get(`customers/${licensingRes.customer.id}/properties`).then(res => {
                        const propertiesRes: Property[] = res.data;

                        if (licensingRes.property) {
                            const property = propertiesRes.find(property => { return property.id === licensingRes.property.id });

                            if (property) setSelectedProperty(property);
                        }

                        setProperties(propertiesRes);
                    }).catch(err => {
                        console.log('Error to get customer properties ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });

                }).catch(err => {
                    console.log('Error to get licensing, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setHasErrors(true);
                });
            }
        }
    }, [user, licensing]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleListEvents() {
        const res = await api.get(`licensings/${licensing}`);

        setData(res.data);
    }

    function handleCustomer(customer: Customer) {
        setSelectedCustomer(customer);

        api.get(`customers/${customer.id}/properties`).then(res => {
            setProperties(res.data);

            setSelectedProperty(undefined);

            setErrorSelectedCustomer(false);
            handleCloseSearchModal();
        }).catch(err => {
            console.log('Error to get customer properties ', err);
        });
    }

    function handleProperty(propertyId: String) {
        const property = properties.find(property => { return property.id === propertyId });

        if (!property) {
            setSelectedProperty(undefined);
            return;
        }

        setSelectedProperty(property);
    }

    async function handleListMembers() {
        if (data) {
            const res = await api.get(`licensings/${licensing}`);

            const updatedCustomer: Licensing = res.data;
            setData({ ...data, members: updatedCustomer.members });

            handleUsersToAdd(users, updatedCustomer);
        }
    }

    async function createMember(userId: string) {
        if (data) {
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
        if (data) {
            const res = await api.get(`licensings/${licensing}`);

            const updatedCustomer: Licensing = res.data;

            setData({ ...data, attachments: updatedCustomer.attachments });
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

    function handleOnDragEnd(result: DropResult) {
        if (data && result.destination) {
            const from = result.source.index;
            const to = result.destination.index;

            const updatedListAttachments = produce(data.attachments, draft => {
                if (draft) {
                    const dragged = draft[from];

                    draft.splice(from, 1);
                    draft.splice(to, 0, dragged);
                }
            });

            if (updatedListAttachments) {
                setData({ ...data, attachments: updatedListAttachments });

                saveOrder(updatedListAttachments);
            }
        }
    }

    async function saveOrder(list: LicensingAttachment[]) {
        list.forEach(async (item, index) => {
            try {
                await api.put(`licensings/attachments/${item.id}`, {
                    name: item.name,
                    received_at: item.received_at,
                    order: index
                });

                handleListAttachments();
            }
            catch (err) {
                console.log('error to save licensing attachments order');
                console.log(err)
            }
        });
    }

    async function handleItemDelete() {
        if (user && licensing) {
            setTypeMessage("waiting");
            setDeletingMessageShow(true);

            try {
                if (can(user, "licensings", "remove")) {
                    await api.delete(`licensings/${licensing}`);

                    setTypeMessage("success");

                    setTimeout(() => {
                        router.push('/licensings');
                    }, 1000);
                }
            }
            catch (err) {
                console.log('error deleting licensing');
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
                            can(user, "licensings", "update") ? <>
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
                                                                            title="Adicionar um membro respons??vel para este projeto."
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
                                                                licensing_number: data.licensing_number,
                                                                expire: data.expire,
                                                                renovation: data.renovation,
                                                                deadline: data.deadline,
                                                                process_number: data.process_number,
                                                                value: prettifyCurrency(String(data.value)),
                                                                deal: prettifyCurrency(String(data.deal)),
                                                                paid: data.paid,
                                                                paid_date: data.paid_date,
                                                                contract: data.contract,
                                                                notes: data.notes,
                                                                customer: data.customer.id,
                                                                customerName: data.customer.name,
                                                                infringement: data.infringement ? data.infringement.id : '0',
                                                                authorization: data.authorization.id,
                                                                agency: data.agency.id,
                                                                status: data.status.id,
                                                                type: data.type && data.type.id,
                                                                line: data.line && data.line.id,
                                                                bank: data.bank && data.bank.id,
                                                            }}
                                                            onSubmit={async values => {
                                                                if (!selectedCustomer) {
                                                                    setErrorSelectedCustomer(true);
                                                                    return;
                                                                }

                                                                setTypeMessage("waiting");
                                                                setMessageShow(true);

                                                                try {
                                                                    await api.put(`licensings/${data.id}`, {
                                                                        licensing_number: values.licensing_number,
                                                                        expire: values.expire,
                                                                        renovation: values.renovation,
                                                                        deadline: values.deadline,
                                                                        process_number: values.process_number,
                                                                        value: Number(values.value.replaceAll(".", "").replaceAll(",", ".")),
                                                                        deal: Number(values.deal.replaceAll(".", "").replaceAll(",", ".")),
                                                                        paid: values.paid,
                                                                        paid_date: values.paid_date,
                                                                        contract: values.contract,
                                                                        notes: values.notes,
                                                                        customer: selectedCustomer.id,
                                                                        property: selectedProperty ? selectedProperty.id : '0',
                                                                        infringement: values.infringement,
                                                                        authorization: values.authorization,
                                                                        agency: values.agency,
                                                                        status: values.status,
                                                                        type: values.type,
                                                                        line: values.line,
                                                                        bank: values.bank,
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
                                                            {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched }) => (
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
                                                                            <Form.Control.Feedback type="invalid">{errorSelectedCustomer && 'Obrigat??rio!'}</Form.Control.Feedback>
                                                                        </Col>

                                                                        <Form.Group as={Col} sm={6} controlId="formGridAuthorizatioin">
                                                                            <Form.Label>Licen??a/autoriza????o</Form.Label>
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
                                                                            <Form.Label>Org??o</Form.Label>
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
                                                                            <Form.Label>Fase</Form.Label>
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
                                                                            <Form.Label>Renova????o</Form.Label>
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
                                                                            <Form.Label>N??mero de licen??a</Form.Label>
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
                                                                            <Form.Label>Fazenda/im??vel</Form.Label>
                                                                            <Form.Control
                                                                                as="select"
                                                                                onChange={e => {
                                                                                    handleProperty(e.currentTarget.value);
                                                                                }}
                                                                                value={selectedProperty ? selectedProperty.id : '0'}
                                                                                name="property"
                                                                                disabled={!!!values.customer}
                                                                            >
                                                                                <option value="0">Nenhuma</option>
                                                                                {
                                                                                    properties.map((property, index) => {
                                                                                        return <option key={index} value={property.id}>{property.name}</option>
                                                                                    })
                                                                                }
                                                                            </Form.Control>
                                                                        </Form.Group>

                                                                        <Form.Group as={Col} sm={6} controlId="formGridInfringement">
                                                                            <Form.Label>Infra????o</Form.Label>
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

                                                                    <Row className="mb-3">
                                                                        <Form.Group as={Col} sm={6} controlId="formGridType">
                                                                            <Form.Label>Tipo de projeto</Form.Label>
                                                                            <Form.Select
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
                                                                            </Form.Select>
                                                                            <Form.Control.Feedback type="invalid">{touched.type && errors.type}</Form.Control.Feedback>
                                                                        </Form.Group>

                                                                        <Form.Group as={Col} sm={6} controlId="formGridLine">
                                                                            <Form.Label>Linha de cr??dito</Form.Label>
                                                                            <Form.Select
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
                                                                            </Form.Select>
                                                                            <Form.Control.Feedback type="invalid">{touched.line && errors.line}</Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Row>

                                                                    <Row className="mb-3">
                                                                        <Form.Group as={Col} sm={6} controlId="formGridBank">
                                                                            <Form.Label>Banco</Form.Label>
                                                                            <Form.Select
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
                                                                            </Form.Select>
                                                                            <Form.Control.Feedback type="invalid">{touched.bank && errors.bank}</Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    </Row>

                                                                    <Row className="align-items-center mb-2">
                                                                        <Form.Group as={Col} sm={2} controlId="formGridValue">
                                                                            <Form.Label>Valor</Form.Label>
                                                                            <InputGroup className="mb-2">
                                                                                <InputGroup.Text id="btnGroupValue">R$</InputGroup.Text>
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
                                                                                    aria-label="Valor do projeto"
                                                                                    aria-describedby="btnGroupValue"
                                                                                />
                                                                            </InputGroup>
                                                                            <Form.Control.Feedback type="invalid">{touched.value && errors.value}</Form.Control.Feedback>
                                                                        </Form.Group>

                                                                        <Form.Group as={Col} sm={2} controlId="formGridDeal">
                                                                            <Form.Label>Acordo</Form.Label>
                                                                            <InputGroup className="mb-2">
                                                                                <InputGroup.Text id="btnGroupDeal">%</InputGroup.Text>
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
                                                                                    aria-label="Acordo"
                                                                                    aria-describedby="btnGroupDeal"
                                                                                />
                                                                            </InputGroup>
                                                                            <Form.Control.Feedback type="invalid">{touched.deal && errors.deal}</Form.Control.Feedback>
                                                                        </Form.Group>

                                                                        <Form.Group as={Col} sm={2} controlId="formGridPaid">
                                                                            <Form.Switch
                                                                                id="paid"
                                                                                label="Pago?"
                                                                                checked={values.paid}
                                                                                onChange={() => { setFieldValue('paid', !values.paid) }}
                                                                            />
                                                                        </Form.Group>

                                                                        {
                                                                            values.paid && <Form.Group as={Col} sm={2} controlId="formGridPaidDate">
                                                                                <Form.Label>Data do pagamento</Form.Label>
                                                                                <Form.Control
                                                                                    type="date"
                                                                                    onChange={handleChange}
                                                                                    onBlur={handleBlur}
                                                                                    value={values.paid_date}
                                                                                    name="paid_date"
                                                                                    isInvalid={!!errors.paid_date && touched.paid_date}
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">{touched.paid_date && errors.paid_date}</Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        }

                                                                        <Form.Group as={Col} sm={4} controlId="formGridContract">
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

                                                                    <Row className="mb-3">
                                                                        <Form.Group as={Col} controlId="formGridNotes">
                                                                            <Form.Label>Observa????es</Form.Label>
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

                                                                    <Col className="border-top mb-3"></Col>

                                                                    <Row className="justify-content-end">
                                                                        {
                                                                            messageShow ? <Col sm={3}><AlertMessage status={typeMessage} /></Col> :
                                                                                <>
                                                                                    {
                                                                                        can(user, "licensings", "remove") && <Col className="col-row">
                                                                                            <Button
                                                                                                variant="danger"
                                                                                                title="Excluir licenciamento."
                                                                                                onClick={handelShowItemDelete}
                                                                                            >
                                                                                                Excluir
                                                                                            </Button>
                                                                                        </Col>
                                                                                    }

                                                                                    <Col sm={1}>
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

                                                        <Col className="border-top mt-3 mb-3"></Col>

                                                        <Row className="mt-5 mb-3">
                                                            <Col>
                                                                <Row>
                                                                    <div className="member-container">
                                                                        <h6 className="text-success">Hist??rico <FaHistory /></h6>
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
                                                                                    <h6>Descri????o</h6>
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

                                                        <Row className="mt-5 mb-3">
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
                                                                            <DragDropContext onDragEnd={handleOnDragEnd}>
                                                                                <Droppable droppableId="attachments">
                                                                                    {provided => (
                                                                                        <div
                                                                                            {...provided.droppableProps}
                                                                                            ref={provided.innerRef}
                                                                                        >
                                                                                            <ListGroup>
                                                                                                {
                                                                                                    data.attachments.map((attachment, index) => {
                                                                                                        return <Draggable key={attachment.id} draggableId={attachment.id} index={index}>
                                                                                                            {(provided) => (
                                                                                                                <div
                                                                                                                    {...provided.draggableProps}
                                                                                                                    {...provided.dragHandleProps}
                                                                                                                    ref={provided.innerRef}
                                                                                                                >
                                                                                                                    <LicensingAttachments
                                                                                                                        attachment={attachment}
                                                                                                                        listAttachments={data.attachments}
                                                                                                                        handleListAttachments={handleListAttachments}
                                                                                                                    />
                                                                                                                </div>
                                                                                                            )}

                                                                                                        </Draggable>
                                                                                                    })
                                                                                                }
                                                                                            </ListGroup>
                                                                                            {provided.placeholder}
                                                                                        </div>
                                                                                    )}
                                                                                </Droppable>
                                                                            </DragDropContext>
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
                                                        </Row>

                                                        <Modal show={showModalNewEvent} size="lg" onHide={handleCloseModalNewEvent}>
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
                                                                                <Form.Label>Descri????o</Form.Label>
                                                                                <Form.Control
                                                                                    as="textarea"
                                                                                    rows={6}
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
                                                                        order: data.attachments.length,
                                                                        customer: data.id,
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
                                                                            const formData = new FormData();

                                                                            formData.append('name', values.name);

                                                                            formData.append('file', fileToSave);

                                                                            formData.append('received_at', `${values.received_at} 12:00:00`);
                                                                            formData.append('expire', String(values.expire));
                                                                            formData.append('expire_at', `${values.expire_at} 12:00:00`);
                                                                            formData.append('schedule', String(values.schedule));
                                                                            formData.append('schedule_at', `${scheduleAt} 12:00:00`);
                                                                            formData.append('order', String(values.order));
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
                                                                                            <Form.Label>Data de expira????o</Form.Label>
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
                                                                <Modal.Title>Excluir licenciamento</Modal.Title>
                                                            </Modal.Header>
                                                            <Modal.Body>
                                                                Voc?? tem certeza que deseja excluir o licenciamento <b>{data.customer.name}</b>? Essa a????o n??o poder?? ser desfeita.
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                {
                                                                    deletingMessageShow ? <AlertMessage status={typeMessage} /> :
                                                                        <>
                                                                            {
                                                                                can(user, "licensings", "remove") && <>
                                                                                    <Button
                                                                                        variant="danger"
                                                                                        onClick={handleItemDelete}
                                                                                    >
                                                                                        Excluir
                                                                                    </Button>


                                                                                </>
                                                                            }

                                                                            <Button
                                                                                variant="outline-secondary"
                                                                                onClick={handleCloseItemDelete}
                                                                            >
                                                                                Cancelar
                                                                            </Button>
                                                                        </>
                                                                }
                                                            </Modal.Footer>
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