import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row, Toast } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaSearchPlus, FaPlus, FaUserTie } from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import Members, { Member } from '../../../components/LicensingMembers';
import { User } from '../../../components/Users';
import { Customer } from '../../../components/Customers';
import { LicensingAgency } from '../../../components/LicensingAgencies';
import { LicensingAuthorization } from '../../../components/LicensingAuthorizations';
import { LicensingInfringement } from '../../../components/LicensingInfringements';
import { LicensingStatus } from '../../../components/LicensingStatus';
import { Property } from '../../../components/Properties';
import PageBack from '../../../components/PageBack';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

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

export default function NewLicensing() {
    const router = useRouter();
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { user } = useContext(AuthContext);

    const [users, setUsers] = useState<User[]>([]);
    const [usersToAdd, setUsersToAdd] = useState<User[]>([]);
    const [membersAdded, setMembersAdded] = useState<Member[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [licensingAgencies, setLicensingAgencies] = useState<LicensingAgency[]>([]);
    const [licensingAuthorizations, setLicensingAuthorizations] = useState<LicensingAuthorization[]>([]);
    const [licensingInfringements, setLicensingInfringements] = useState<LicensingInfringement[]>([]);
    const [licensingStatus, setLicensingStatus] = useState<LicensingStatus[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [showUsers, setShowUsers] = useState(false);

    const toggleShowUsers = () => setShowUsers(!showUsers);

    const [showModalChooseCustomer, setShowModalChooseCustomer] = useState(false);

    const handleCloseModalChooseCustomer = () => setShowModalChooseCustomer(false);
    const handleShowModalChooseCustomer = () => setShowModalChooseCustomer(true);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-new');

        api.get('users').then(res => {
            setUsers(res.data);
            const usersRes: User[] = res.data;

            if (user) {
                const newMembersAddedList = [{
                    id: '',
                    licensing: undefined,
                    user,
                }];

                handleUsersToAdd(usersRes, newMembersAddedList);

                setMembersAdded(newMembersAddedList);
            }
        }).catch(err => {
            console.log('Error to get users on new customer, ', err);
        });

        api.get('customers').then(res => {
            setCustomers(res.data);
        }).catch(err => {
            console.log('Error to get licensings customers, ', err);
        });

        api.get('licensings/agencies').then(res => {
            setLicensingAgencies(res.data);
        }).catch(err => {
            console.log('Error to get licensings agencies, ', err);
        });

        api.get('licensings/authorizations').then(res => {
            setLicensingAuthorizations(res.data);
        }).catch(err => {
            console.log('Error to get licensings authorizations, ', err);
        });

        api.get('licensings/infringements').then(res => {
            setLicensingInfringements(res.data);
        }).catch(err => {
            console.log('Error to get licensings infringements, ', err);
        });

        api.get('licensings/status').then(res => {
            setLicensingStatus(res.data);
        }).catch(err => {
            console.log('Error to get licensings status, ', err);
        });
    }, []);

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

    return <Container className="content-page">
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
                customer: '',
                customerName: '',
                property: '0',
                infringement: '0',
                authorization: '',
                agency: '',
                status: '',
            }}
            onSubmit={async values => {
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
                        customer: values.customer,
                        property: values.property,
                        infringement: values.infringement,
                        authorization: values.authorization,
                        agency: values.agency,
                        status: values.status,
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
                                                            setFieldValue('customer', customer.id);
                                                            setFieldValue('customerName', customer.name);

                                                            api.get(`customers/${customer.id}/properties`).then(res => {
                                                                setProperties(res.data);

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
    </Container>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { token } = context.req.cookies;

    const tokenVerified = await TokenVerify(token);

    if (tokenVerified === "not-authorized") { // Not authenticated, token invalid!
        return {
            redirect: {
                destination: '/',
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