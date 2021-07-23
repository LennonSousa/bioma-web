import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { FaUserTie, FaHistory, FaPlus, FaSearchPlus, FaFileAlt, FaIdCard } from 'react-icons/fa';
import {
    Button,
    Col,
    Container,
    Form,
    FormControl,
    InputGroup,
    ListGroup,
    Modal,
    Row,
    Toast
} from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format, subDays } from 'date-fns';
import filesize from "filesize";
import { CircularProgressbar } from 'react-circular-progressbar';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { Project } from '../../../components/Projects';
import { Customer } from '../../../components/Customers';
import Members from '../../../components/ProjectMembers';
import { User, can } from '../../../components/Users';
import { ProjectType } from '../../../components/ProjectTypes';
import { ProjectLine } from '../../../components/ProjectLines';
import { ProjectStatus } from '../../../components/ProjectStatus';
import { Bank } from '../../../components/Banks';
import { Property } from '../../../components/Properties';
import { DocsProject } from '../../../components/DocsProject';
import EventsProject from '../../../components/EventsProject';
import ProjectAttachments from '../../../components/ProjectAttachments';
import PageBack from '../../../components/PageBack';
import { AlertMessage, statusModal } from '../../../components/Interfaces/AlertMessage';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { prettifyCurrency } from '../../../components/InputMask/masks';

import "react-circular-progressbar/dist/styles.css";
import styles from './styles.module.css';

const validationSchema = Yup.object().shape({
    value: Yup.string().notRequired(),
    deal: Yup.string().notRequired(),
    paid: Yup.boolean().notRequired(),
    paid_date: Yup.string().notRequired().nullable(),
    contract: Yup.string().notRequired().nullable(),
    analyst: Yup.string().notRequired().nullable(),
    analyst_contact: Yup.string().notRequired().nullable(),
    notes: Yup.string().notRequired(),
    warnings: Yup.boolean().notRequired(),
    warnings_text: Yup.string().notRequired().nullable(),
    customer: Yup.string().required('Obrigatório!'),
    type: Yup.string().required('Obrigatório!'),
    line: Yup.string().required('Obrigatório!'),
    status: Yup.string().required('Obrigatório!'),
    bank: Yup.string().required('Obrigatório!'),
    property: Yup.string().required('Obrigatório!'),
});

const validationSchemaEvents = Yup.object().shape({
    description: Yup.string().required('Obrigatório!'),
    project: Yup.string().required('Obrigatório!'),
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
    const { project } = router.query;
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [projectData, setProjectData] = useState<Project>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [usersToAdd, setUsersToAdd] = useState<User[]>([]);
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [projectLines, setProjectLines] = useState<ProjectLine[]>([]);
    const [projectStatus, setProjectStatus] = useState<ProjectStatus[]>([]);
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
        handleItemSideBar('projects');
        handleSelectedMenu('projects-index');

        if (user) {
            if (can(user, "projects", "update:any")) {
                if (project) {

                    api.get(`projects/${project}`).then(res => {
                        let projectRes: Project = res.data;

                        api.get('customers').then(res => {
                            setCustomers(res.data);
                        }).catch(err => {
                            console.log('Error to get project status, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });

                        api.get('users').then(res => {
                            setUsers(res.data);
                            const usersRes: User[] = res.data;

                            handleUsersToAdd(usersRes, projectRes);
                        }).catch(err => {
                            console.log('Error to get users on project edit, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });

                        api.get('projects/types').then(res => {
                            setProjectTypes(res.data);
                        }).catch(err => {
                            console.log('Error to get project types, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });

                        api.get('projects/lines').then(res => {
                            setProjectLines(res.data);
                        }).catch(err => {
                            console.log('Error to get project lines, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });

                        api.get('projects/status').then(res => {
                            setProjectStatus(res.data);
                        }).catch(err => {
                            console.log('Error to get project status, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });

                        api.get('banks').then(res => {
                            setBanks(res.data);
                        }).catch(err => {
                            console.log('Error to get banks, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });

                        api.get('docs/project').then(res => {
                            let docsProject: DocsProject[] = res.data;

                            docsProject = docsProject.filter(docProject => { return docProject.active });

                            projectRes = {
                                ...projectRes, docs: docsProject.map(docProject => {
                                    const projectDoc = projectRes.docs.find(projectDoc => { return projectDoc.doc.id === docProject.id });

                                    if (projectDoc)
                                        return { ...projectDoc, project: projectRes };

                                    return {
                                        id: '0',
                                        path: '',
                                        received_at: new Date(),
                                        checked: false,
                                        project: projectRes,
                                        doc: docProject,
                                    };
                                })
                            }

                            setProjectData(projectRes);
                            setLoadingData(false);
                        }).catch(err => {
                            console.log('Error to get docs project to edit, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });

                        api.get(`customers/${projectRes.customer.id}/properties`).then(res => {
                            setProperties(res.data);

                            setProjectData(projectRes);
                        }).catch(err => {
                            console.log('Error to get customer properties ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setHasErrors(true);
                        });
                    }).catch(err => {
                        console.log('Error to get project, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });
                }
            }
        }
    }, [user, project]); // eslint-disable-line react-hooks/exhaustive-deps

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

            if (!!customersFound.length) resultsUpdated = customersFound;

            setCustomerResults(resultsUpdated);
        }
    }

    async function handleListMembers() {
        if (projectData) {
            const res = await api.get(`projects/${project}`);

            const updatedCustomer: Project = res.data;
            setProjectData({ ...projectData, members: updatedCustomer.members });

            handleUsersToAdd(users, updatedCustomer);
        }
    }

    async function createMember(userId: string) {
        if (projectData) {
            try {
                await api.post('members/project', {
                    project: projectData.id,
                    user: userId,
                });

                toggleShowUsers();

                handleListMembers();
            }
            catch (err) {
                console.log("Error to create project member");
                console.log(err);
            }
        }
    }

    async function handleUsersToAdd(usersList: User[], project: Project) {
        setUsersToAdd(
            usersList.filter(user => {
                return !project.members.find(member => {
                    return member.user.id === user.id
                })
            })
        )
    }

    async function handleListAttachments() {
        if (projectData) {
            const res = await api.get(`projects/${project}`);

            const updatedCustomer: Project = res.data;

            setProjectData({ ...projectData, attachments: updatedCustomer.attachments });
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
        if (projectData) {
            const updatedDocs = projectData.docs.map(projecDoc => {
                if (projecDoc.doc.id === event.target.value)
                    return { ...projecDoc, checked: !projecDoc.checked }

                return projecDoc;
            });

            setProjectData({ ...projectData, docs: updatedDocs });
        }
    }

    function handleReceivedAt(docId: string, value: string) {
        if (projectData) {
            const updatedDocs = projectData.docs.map(projecDoc => {

                if (projecDoc.doc.id === docId)
                    return { ...projecDoc, received_at: new Date(new Date(`${value} 12:00:00`)) }

                return projecDoc;
            });

            setProjectData({ ...projectData, docs: updatedDocs });
        }
    }

    return (
        <>
            <NextSeo
                title="Editar projeto"
                description="Editar projeto da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Editar projeto',
                    description: 'Editar projeto da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Editar projeto | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "projects", "update:any") ? <>
                                {
                                    loadingData || hasErrors ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !projectData ? <PageWaiting status="waiting" /> :
                                                    <Container className="content-page">
                                                        <>
                                                            <Row className="mb-3">
                                                                <Col>
                                                                    <PageBack href={`/projects/details/${projectData.id}`} subTitle="Voltar para detalhes do projeto" />
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
                                                                            projectData.members.map(member => {
                                                                                return <Members
                                                                                    key={member.id}
                                                                                    member={member}
                                                                                    canRemove={projectData.members.length > 1}
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
                                                                    value: prettifyCurrency(String(projectData.value)),
                                                                    deal: prettifyCurrency(String(projectData.deal)),
                                                                    paid: projectData.paid,
                                                                    paid_date: projectData.paid_date,
                                                                    contract: projectData.contract,
                                                                    analyst: projectData.analyst,
                                                                    analyst_contact: projectData.analyst_contact,
                                                                    notes: projectData.notes,
                                                                    warnings: projectData.warnings,
                                                                    warnings_text: projectData.warnings_text,
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
                                                                            paid: values.paid,
                                                                            paid_date: values.paid_date,
                                                                            contract: values.contract,
                                                                            analyst: values.analyst,
                                                                            analyst_contact: values.analyst_contact,
                                                                            notes: values.notes,
                                                                            warnings: values.warnings,
                                                                            warnings_text: values.warnings_text,
                                                                            customer: values.customer,
                                                                            type: values.type,
                                                                            line: values.line,
                                                                            status: values.status,
                                                                            bank: values.bank,
                                                                            property: values.property,
                                                                        });

                                                                        projectData.docs.forEach(async doc => {
                                                                            if (doc.id === '0') {
                                                                                await api.post('projects/docs', {
                                                                                    path: doc.path,
                                                                                    received_at: doc.received_at,
                                                                                    checked: doc.checked,
                                                                                    project: doc.project.id,
                                                                                    doc: doc.doc.id,
                                                                                });
                                                                                return
                                                                            }

                                                                            await api.put(`projects/docs/${doc.id}`, {
                                                                                ...doc,
                                                                                project: doc.project.id,
                                                                                doc: doc.doc.id,
                                                                            });
                                                                        });

                                                                        setTypeMessage("success");

                                                                        setTimeout(() => {
                                                                            router.push(`/projects/details/${projectData.id}`);
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
                                                                                    <Button
                                                                                        id="btnGroupAddon"
                                                                                        variant="success"
                                                                                        onClick={handleShowModalChooseCustomer}
                                                                                    >
                                                                                        <FaSearchPlus />
                                                                                    </Button>
                                                                                </InputGroup>
                                                                                <Form.Control.Feedback type="invalid">{errors.customerName}</Form.Control.Feedback>
                                                                            </Col>

                                                                            <Form.Group as={Col} sm={6} controlId="formGridProperty">
                                                                                <Form.Label>Fazenda/imóvel</Form.Label>
                                                                                <Form.Select
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
                                                                                </Form.Select>
                                                                                <Form.Control.Feedback type="invalid">{touched.property && errors.property}</Form.Control.Feedback>
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
                                                                                <Form.Label>Linha de crédito</Form.Label>
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

                                                                            <Form.Group as={Col} sm={6} controlId="formGridStatus">
                                                                                <Form.Label>Fase do projeto</Form.Label>
                                                                                <Form.Select
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
                                                                                </Form.Select>
                                                                                <Form.Control.Feedback type="invalid">{touched.status && errors.status}</Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        </Row>

                                                                        <Row className="mb-2">
                                                                            <Form.Group as={Col} sm={5} controlId="formGridAnalyst">
                                                                                <Form.Label>Analista no banco</Form.Label>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    onChange={handleChange}
                                                                                    onBlur={handleBlur}
                                                                                    value={values.analyst}
                                                                                    name="analyst"
                                                                                    isInvalid={!!errors.analyst && touched.analyst}
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">{touched.analyst && errors.analyst}</Form.Control.Feedback>
                                                                            </Form.Group>

                                                                            <Form.Group as={Col} sm={7} controlId="formGridAnalystContact">
                                                                                <Form.Label>Contatos do analista</Form.Label>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    onChange={handleChange}
                                                                                    onBlur={handleBlur}
                                                                                    value={values.analyst_contact}
                                                                                    name="analyst_contact"
                                                                                    isInvalid={!!errors.analyst_contact && touched.analyst_contact}
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">{touched.analyst_contact && errors.analyst_contact}</Form.Control.Feedback>
                                                                            </Form.Group>
                                                                        </Row>

                                                                        <Row className="align-items-center mb-2">
                                                                            <Form.Group as={Col} sm={3} controlId="formGridValue">
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
                                                                                values.paid && <Form.Group as={Col} sm={3} controlId="formGridPaidDate">
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
                                                                            <Form.Switch
                                                                                id="warnings"
                                                                                label="Pendências"
                                                                                checked={values.warnings}
                                                                                onChange={() => { setFieldValue('warnings', !values.warnings) }}
                                                                            />
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
                                                                            <Form.Group as={Col} controlId="formGridDocs">
                                                                                <h6 className="text-success">Documentação <FaIdCard /></h6>
                                                                                <ListGroup className="mb-3">
                                                                                    {
                                                                                        projectData.docs.map((doc, index) => {
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
                                                                                title="Criar um novo evento para este projeto."
                                                                            >
                                                                                <FaPlus />
                                                                            </Button>
                                                                        </Col>
                                                                    </Row>

                                                                    <Row className="mt-2">
                                                                        {
                                                                            !!projectData.events.length ? <Col>
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

                                                            <Row className="mb-3">
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
                                                                            !!projectData.attachments.length ? <Col>
                                                                                <ListGroup>
                                                                                    {
                                                                                        projectData.attachments.map(attachment => {
                                                                                            return <ProjectAttachments
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
                                                                                        message="Nenhum anexo enviado para esse projeto."
                                                                                    />
                                                                                </Col>
                                                                        }
                                                                    </Row>
                                                                </Form.Group>
                                                            </Row>

                                                            <Modal show={showModalNewEvent} onHide={handleCloseModalNewEvent}>
                                                                <Modal.Header closeButton>
                                                                    <Modal.Title>Criar evento</Modal.Title>
                                                                </Modal.Header>
                                                                <Formik
                                                                    initialValues={
                                                                        {
                                                                            description: '',
                                                                            project: projectData.id,
                                                                        }
                                                                    }
                                                                    onSubmit={async values => {
                                                                        setTypeMessage("waiting");
                                                                        setEventMessageShow(true);

                                                                        try {
                                                                            await api.post('events/project', {
                                                                                description: values.description,
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
                                                                            customer: projectData.id,
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
                                                                                data.append('project', values.customer);

                                                                                await api.post(`projects/${projectData.id}/attachments`, data, {
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