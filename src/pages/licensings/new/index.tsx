import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Row, Toast } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaSearchPlus, FaPlus, FaUserTie } from 'react-icons/fa';
import { format } from 'date-fns';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import Members, { Member } from '../../../components/LicensingMembers';
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
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../../components/Interfaces/AlertMessage';
import { prettifyCurrency } from '../../../components/InputMask/masks';
import SearchCustomers from '../../../components/Interfaces/SearchCustomers';

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
    notes: Yup.string().notRequired(),
    infringement: Yup.string().notRequired().nullable(),
    authorization: Yup.string().required('Obrigatório!'),
    agency: Yup.string().required('Obrigatório!'),
    status: Yup.string().required('Obrigatório!'),
    type: Yup.string().required('Obrigatório!'),
    line: Yup.string().required('Obrigatório!'),
    bank: Yup.string().required('Obrigatório!'),
});

export default function NewLicensing() {
    const router = useRouter();
    const { customer } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [users, setUsers] = useState<User[]>([]);
    const [usersToAdd, setUsersToAdd] = useState<User[]>([]);
    const [membersAdded, setMembersAdded] = useState<Member[]>([]);

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

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    const [showUsers, setShowUsers] = useState(false);

    const toggleShowUsers = () => setShowUsers(!showUsers);

    const [showSearchModal, setShowSearchModal] = useState(false);

    const handleCloseSearchModal = () => setShowSearchModal(false);
    const handleShowSearchModal = () => setShowSearchModal(true);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-new');

        if (user) {
            if (can(user, "licensings", "create")) {

                api.get('users').then(res => {
                    setUsers(res.data);

                    const usersRes: User[] = res.data;
                    let newMembersAddedList: Member[] = [];

                    if (user) {
                        const rootUsers = usersRes.filter(userItem => { return userItem.sudo });

                        rootUsers.forEach(userItem => {
                            newMembersAddedList.push({
                                id: userItem.id,
                                licensing: undefined,
                                user: userItem,
                            });
                        });

                        if (!newMembersAddedList.find(newMember => { return newMember.id === user.id })) {
                            newMembersAddedList.push({
                                id: user.id,
                                licensing: undefined,
                                user,
                            });
                        }

                        handleUsersToAdd(usersRes, newMembersAddedList);

                        setMembersAdded(newMembersAddedList);
                    }
                }).catch(err => {
                    console.log('Error to get users on new customer, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setHasErrors(true);
                });

                if (customer) {
                    api.get(`customers/${customer}`).then(res => {
                        const customerRes: Customer = res.data;

                        setSelectedCustomer(customerRes);

                        api.get(`customers/${customerRes.id}/properties`).then(res => {
                            setProperties(res.data);
                        }).catch(err => {
                            console.log('Error to get customer properties ', err);
                        });
                    }).catch(err => {
                        console.log('Error to get licensings customers, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });
                }

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

                api.get('banks').then(res => {
                    setBanks(res.data);
                }).catch(err => {
                    console.log('Error to get banks, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setHasErrors(true);
                });

                api.get('licensings/status').then(res => {
                    setLicensingStatus(res.data);
                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get licensings status, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setHasErrors(true);
                });
            }
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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

    function createMember(userId: string) {
        const userFound = usersToAdd.find(user => { return user.id === userId });

        if (!userFound) return;

        let newMembersAddedList = membersAdded;

        newMembersAddedList.push({
            id: '',
            licensing: undefined,
            user: userFound,
        });

        handleUsersToAdd(users, newMembersAddedList);

        setMembersAdded(newMembersAddedList);

        toggleShowUsers();
    }

    function handleDeleteMember(userId: string) {
        const newMembersAddedList = membersAdded.filter(member => { return member.user.id !== userId });

        handleUsersToAdd(users, newMembersAddedList);

        setMembersAdded(newMembersAddedList);
    }

    function handleUsersToAdd(usersList: User[], addedList: Member[]) {
        setUsersToAdd(
            usersList.filter(user => {
                return !addedList.find(member => {
                    return member.user.id === user.id
                })
            })
        );
    }

    return (
        <>
            <NextSeo
                title="Criar licenciamento"
                description="Criar licenciamento da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Criar licenciamento',
                    description: 'Criar licenciamento da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Criar licenciamento | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "licensings", "create") ? <>
                                {
                                    loadingData || hasErrors ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <Container className="content-page">
                                            <Row className="mb-3">
                                                <Col>
                                                    <PageBack href="/licensings" subTitle="Voltar para a lista de projetos" />
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
                                                            membersAdded.map(member => {
                                                                return <Members
                                                                    key={member.id}
                                                                    member={member}
                                                                    canRemove={membersAdded.length > 1}
                                                                    isNewItem={true}
                                                                    handleDeleteMember={handleDeleteMember}
                                                                />
                                                            })
                                                        }
                                                        <div className="member-container">
                                                            <Button
                                                                onClick={toggleShowUsers}
                                                                className="member-item"
                                                                variant="secondary"
                                                                disabled={usersToAdd.length < 1}
                                                                title="Adicionar um membro responsável para este licensiamento."
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
                                                    licensing_number: '',
                                                    expire: '',
                                                    renovation: '',
                                                    deadline: '',
                                                    process_number: '',
                                                    value: '0,00',
                                                    deal: '0,0',
                                                    paid: false,
                                                    paid_date: format(new Date(), 'yyyy-MM-dd'),
                                                    contract: '',
                                                    notes: '',
                                                    infringement: '0',
                                                    authorization: '',
                                                    agency: '',
                                                    status: '',
                                                    type: '',
                                                    line: '',
                                                    bank: '',
                                                }}
                                                onSubmit={async values => {
                                                    if (!selectedCustomer) {
                                                        setErrorSelectedCustomer(true);
                                                        return;
                                                    }

                                                    setTypeMessage("waiting");
                                                    setMessageShow(true);

                                                    const members = membersAdded.map(member => {
                                                        return { user: member.user.id }
                                                    });

                                                    try {
                                                        const res = await api.post('licensings', {
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
                                                            members,
                                                        });

                                                        setTypeMessage("success");

                                                        setTimeout(() => {
                                                            router.push(`/licensings/details/${res.data.id}`);
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
                                                                        value={selectedCustomer ? selectedCustomer.name : ''}
                                                                        name="customer"
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
                                                                <Form.Text className="text-danger">{errorSelectedCustomer && 'Obrigatório!'}</Form.Text>
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
                                                                <Form.Select
                                                                    as="select"
                                                                    onChange={e => {
                                                                        handleProperty(e.currentTarget.value);
                                                                    }}
                                                                    value={selectedProperty ? selectedProperty.id : '0'}
                                                                    name="property"
                                                                    disabled={!selectedCustomer}
                                                                >
                                                                    <option value="0">Nenhuma</option>
                                                                    {
                                                                        properties.map((property, index) => {
                                                                            return <option key={index} value={property.id}>{property.name}</option>
                                                                        })
                                                                    }
                                                                </Form.Select>
                                                            </Form.Group>

                                                            <Form.Group as={Col} sm={6} controlId="formGridInfringement">
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

                                                        <Row className="mb-3">
                                                            <Form.Group as={Col} sm={6} controlId="formGridType">
                                                                <Form.Label>Tipo de projeto</Form.Label>
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

                                                            <Form.Group as={Col} sm={2} controlId="formGridContract">
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

                                                        <Col className="border-top mb-3"></Col>

                                                        <Row className="justify-content-end">
                                                            {
                                                                messageShow ? <Col sm={3}><AlertMessage status={typeMessage} /></Col> :
                                                                    <Col sm={1}>
                                                                        <Button variant="success" type="submit">Salvar</Button>
                                                                    </Col>

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
                                        </Container>
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