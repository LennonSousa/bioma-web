import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Row, Toast } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaSearchPlus, FaUserTie } from 'react-icons/fa';
import { format } from 'date-fns';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import Members, { Member } from '../../../components/ProjectMembers';
import { User, can } from '../../../components/Users';
import { Customer } from '../../../components/Customers';
import { ProjectType } from '../../../components/ProjectTypes';
import { ProjectLine } from '../../../components/ProjectLines';
import { ProjectStatus } from '../../../components/ProjectStatus';
import { Bank } from '../../../components/Banks';
import { Property } from '../../../components/Properties';
import { DocsProject } from '../../../components/DocsProject';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../../components/Interfaces/AlertMessage';
import { prettifyCurrency } from '../../../components/InputMask/masks';
import SearchCustomers from '../../../components/Interfaces/SearchCustomers';

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
    type: Yup.string().required('Obrigat??rio!'),
    line: Yup.string().required('Obrigat??rio!'),
    status: Yup.string().required('Obrigat??rio!'),
    bank: Yup.string().required('Obrigat??rio!'),
});

export default function NewProject() {
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
    const [errorSelectedProperty, setErrorSelectedProperty] = useState(false);

    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [projectLines, setProjectLines] = useState<ProjectLine[]>([]);
    const [projectStatus, setProjectStatus] = useState<ProjectStatus[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [docsProject, setDocsProject] = useState<DocsProject[]>([]);

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
        handleItemSideBar('projects');
        handleSelectedMenu('projects-new');

        if (user) {
            if (can(user, "projects", "create")) {

                api.get('users').then(res => {
                    setUsers(res.data);

                    const usersRes: User[] = res.data;
                    let newMembersAddedList: Member[] = [];

                    const rootUsers = usersRes.filter(userItem => { return userItem.sudo });

                    rootUsers.forEach(userItem => {
                        newMembersAddedList.push({
                            id: userItem.id,
                            project: undefined,
                            user: userItem,
                        });
                    });

                    if (!newMembersAddedList.find(newMember => { return newMember.id === user.id })) {
                        newMembersAddedList.push({
                            id: user.id,
                            project: undefined,
                            user,
                        });
                    }

                    handleUsersToAdd(usersRes, newMembersAddedList);

                    setMembersAdded(newMembersAddedList);
                }).catch(err => {
                    console.log('Error to get users on new project, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setHasErrors(true);
                });

                if (customer) {
                    api.get(`customers/${customer}`).then(res => {
                        const customersRes: Customer = res.data;
                        setSelectedCustomer(customersRes);

                        api.get(`customers/${customersRes.id}/properties`).then(res => {
                            setProperties(res.data);
                        }).catch(err => {
                            console.log('Error to get customer properties ', err);
                        });
                    }).catch(err => {
                        console.log('Error to get project status, ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setHasErrors(true);
                    });
                }

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

                api.get('projects/status').then(res => {
                    setProjectStatus(res.data);
                }).catch(err => {
                    console.log('Error to get project status, ', err);

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

                api.get('docs/project').then(res => {
                    let docsProjectRes: DocsProject[] = res.data;

                    docsProjectRes = docsProjectRes.filter(docProject => { return docProject.active });

                    setDocsProject(docsProjectRes);
                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get docs project, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("N??o foi poss??vel carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
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
            setErrorSelectedProperty(false);
            handleCloseSearchModal();
        }).catch(err => {
            console.log('Error to get customer properties ', err);
        });
    }

    function handleProperty(propertyId: String) {
        const property = properties.find(property => { return property.id === propertyId });

        if (property) setSelectedProperty(property);
    }

    function createMember(userId: string) {
        const userFound = usersToAdd.find(user => { return user.id === userId });

        if (!userFound) return;

        let newMembersAddedList = membersAdded;

        newMembersAddedList.push({
            id: '',
            project: undefined,
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
        )
    }

    return (
        <>
            <NextSeo
                title="Criar projeto"
                description="Criar projeto da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Criar projeto',
                    description: 'Criar projeto da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Criar projeto | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "projects", "create") ? <>
                                {
                                    loadingData || hasErrors ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <Container className="content-page">
                                            <Row className="mb-3">
                                                <Col>
                                                    <PageBack href="/projects" subTitle="Voltar para a lista de projetos" />
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
                                                                title="Adicionar um membro respons??vel para este im??vel."
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
                                                    value: '0,00',
                                                    deal: '0,0',
                                                    paid: false,
                                                    paid_date: format(new Date(), 'yyyy-MM-dd'),
                                                    contract: '',
                                                    analyst: '',
                                                    analyst_contact: '',
                                                    notes: '',
                                                    warnings: false,
                                                    warnings_text: '',
                                                    type: '',
                                                    line: '',
                                                    status: '',
                                                    bank: '',
                                                }}
                                                onSubmit={async values => {
                                                    if (!selectedCustomer) {
                                                        setErrorSelectedCustomer(true);
                                                        return;
                                                    }

                                                    if (!selectedProperty) {
                                                        setErrorSelectedProperty(true);
                                                        return;
                                                    }

                                                    setTypeMessage("waiting");
                                                    setMessageShow(true);

                                                    const docs = docsProject.map(doc => {
                                                        return { doc: doc.id }
                                                    });

                                                    const members = membersAdded.map(member => {
                                                        return { user: member.user.id }
                                                    });

                                                    try {
                                                        const res = await api.post('projects', {
                                                            value: Number(values.value.replaceAll(".", "").replaceAll(",", ".")),
                                                            deal: Number(values.deal.replaceAll(".", "").replaceAll(",", ".")),
                                                            paid: values.paid,
                                                            paid_date: values.paid_date,
                                                            contract: values.contract,
                                                            analyst: values.analyst,
                                                            analyst_contact: values.analyst_contact,
                                                            notes: values.notes,
                                                            warnings: values.warnings,
                                                            warnings_text: values.warnings_text,
                                                            customer: selectedCustomer.id,
                                                            type: values.type,
                                                            line: values.line,
                                                            status: values.status,
                                                            bank: values.bank,
                                                            property: selectedProperty.id,
                                                            docs,
                                                            members,
                                                        });

                                                        setTypeMessage("success");

                                                        setTimeout(() => {
                                                            router.push(`/projects/details/${res.data.id}`);
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
                                                                <Form.Control.Feedback type="invalid">{errorSelectedCustomer && 'Obrigat??rio!'}</Form.Control.Feedback>
                                                            </Col>

                                                            <Form.Group as={Col} sm={6} controlId="formGridProperty">
                                                                <Form.Label>Fazenda/im??vel</Form.Label>
                                                                <Form.Select
                                                                    onChange={e => {
                                                                        handleProperty(e.currentTarget.value);
                                                                    }}
                                                                    value={selectedProperty ? selectedProperty.id : ''}
                                                                    name="property"
                                                                    disabled={!selectedCustomer}
                                                                    isInvalid={errorSelectedProperty}
                                                                >
                                                                    <option hidden>...</option>
                                                                    {
                                                                        properties.map((property, index) => {
                                                                            return <option key={index} value={property.id}>{property.name}</option>
                                                                        })
                                                                    }
                                                                </Form.Select>
                                                                <Form.Control.Feedback type="invalid">{errorSelectedProperty && 'Obrigat??rio!'}</Form.Control.Feedback>
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
                                                                <Form.Label>Linha de cr??dito</Form.Label>
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

                                                            <Form.Group as={Col} sm={6} controlId="formGridStatus">
                                                                <Form.Label>Fase do projeto</Form.Label>
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
                                                                        projectStatus.map((status, index) => {
                                                                            return <option key={index} value={status.id}>{status.name}</option>
                                                                        })
                                                                    }
                                                                </Form.Control>
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

                                                        <Row className="mb-2">
                                                            <Col>
                                                                <Form.Check
                                                                    type="switch"
                                                                    id="warnings"
                                                                    label="Pend??ncias"
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