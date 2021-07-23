import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row, Toast } from 'react-bootstrap';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { FaSearchPlus, FaPlus, FaUserTie } from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import Members, { Member } from '../../../components/PropertyMembers';
import { User, can } from '../../../components/Users';
import { Customer } from '../../../components/Customers';
import { DocsProperty } from '../../../components/DocsProperty';
import { statesCities } from '../../../components/StatesCities';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../../components/Interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!'),
    registration: Yup.string().notRequired(),
    route: Yup.string().notRequired(),
    city: Yup.string().required('Obrigatório!'),
    state: Yup.string().required('Obrigatório!'),
    area: Yup.string().required('Obrigatório!'),
    coordinates: Yup.string().notRequired().nullable(),
    notes: Yup.string().notRequired(),
    warnings: Yup.boolean().notRequired(),
    warnings_text: Yup.string().notRequired().nullable(),
});

export default function NewProperty() {
    const router = useRouter();
    const { customer } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
    const [errorSelectedCustomer, setErrorSelectedCustomer] = useState(false);

    const [users, setUsers] = useState<User[]>([]);
    const [usersToAdd, setUsersToAdd] = useState<User[]>([]);
    const [membersAdded, setMembersAdded] = useState<Member[]>([]);
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [docsProperty, setDocsProperty] = useState<DocsProperty[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");
    const [cities, setCities] = useState<string[]>([]);

    const [showUsers, setShowUsers] = useState(false);

    const toggleShowUsers = () => setShowUsers(!showUsers);

    const [showModalChooseCustomer, setShowModalChooseCustomer] = useState(false);

    const handleCloseModalChooseCustomer = () => setShowModalChooseCustomer(false);
    const handleShowModalChooseCustomer = () => setShowModalChooseCustomer(true);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('properties-new');

        if (user) {
            if (can(user, "properties", "create")) {
                api.get('users').then(res => {
                    setUsers(res.data);

                    const usersRes: User[] = res.data;
                    let newMembersAddedList: Member[] = [];

                    if (user) {
                        const rootUsers = usersRes.filter(userItem => { return userItem.sudo });

                        rootUsers.forEach(userItem => {
                            newMembersAddedList.push({
                                id: userItem.id,
                                property: undefined,
                                user: userItem,
                            });
                        });

                        if (!newMembersAddedList.find(newMember => { return newMember.id === user.id })) {
                            newMembersAddedList.push({
                                id: user.id,
                                property: undefined,
                                user,
                            });
                        }

                        handleUsersToAdd(usersRes, newMembersAddedList);

                        setMembersAdded(newMembersAddedList);

                        setLoadingData(false);
                    }
                }).catch(err => {
                    console.log('Error to get users on new property, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });

                api.get('customers').then(res => {
                    const customersRes: Customer[] = res.data;

                    if (customer) {
                        customersRes.forEach(customerItem => {
                            if (customerItem.id === customer)
                                setSelectedCustomer(customerItem)
                        })
                    }

                    setCustomers(customersRes);
                }).catch(err => {
                    console.log('Error to get customers, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });

                api.get('docs/property').then(res => {
                    let docsPropertyRes: DocsProperty[] = res.data;

                    docsPropertyRes = docsPropertyRes.filter(docProperty => { return docProperty.active });

                    setDocsProperty(docsPropertyRes);
                }).catch(err => {
                    console.log('Error to get docs property, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });
            }
        }
    }, [user, customer]); // eslint-disable-line react-hooks/exhaustive-deps

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

    function createMember(userId: string) {
        const userFound = usersToAdd.find(user => { return user.id === userId });

        if (!userFound) return;

        let newMembersAddedList = membersAdded;

        newMembersAddedList.push({
            id: '',
            property: undefined,
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
                title="Criar imóvel"
                description="Criar imóvel da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Criar imóvel',
                    description: 'Criar imóvel da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Criar imóvel | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "properties", "create") ? <>
                                {
                                    loadingData ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <Container className="content-page">
                                            <Row className="mb-3">
                                                <Col>
                                                    <PageBack href="/properties" subTitle="Voltar para a lista de imóveis" />
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
                                                    name: '',
                                                    registration: '',
                                                    route: '',
                                                    city: '',
                                                    state: '',
                                                    area: '',
                                                    coordinates: '',
                                                    notes: '',
                                                    warnings: false,
                                                    warnings_text: '',
                                                }}
                                                onSubmit={async values => {
                                                    if (!selectedCustomer) {
                                                        setErrorSelectedCustomer(true);
                                                        return;
                                                    }

                                                    setTypeMessage("waiting");
                                                    setMessageShow(true);

                                                    const docs = docsProperty.map(doc => {
                                                        return { doc: doc.id }
                                                    });

                                                    const members = membersAdded.map(member => {
                                                        return { user: member.user.id }
                                                    });

                                                    try {
                                                        const res = await api.post('properties', {
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
                                                            docs,
                                                            members,
                                                        });

                                                        setTypeMessage("success");

                                                        setTimeout(() => {
                                                            router.push(`/properties/details/${res.data.id}`);
                                                        }, 1500);
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
                                                                        onClick={handleShowModalChooseCustomer}
                                                                    >
                                                                        <FaSearchPlus />
                                                                    </Button>
                                                                </InputGroup>
                                                                <Form.Text className="text-danger">{errorSelectedCustomer && 'Obrigatório!'}</Form.Text>
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
                                                                                                setSelectedCustomer(customer);
                                                                                                setErrorSelectedCustomer(false);
                                                                                                handleCloseModalChooseCustomer();
                                                                                            }}
                                                                                        >
                                                                                            <Row>
                                                                                                <Col>
                                                                                                    <h6>{customer.name}</h6>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col>
                                                                                                    <span className="text-italic">{`${customer.document} - ${customer.city}/${customer.state}`}</span>
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