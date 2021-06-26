import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Button, Col, Container, Form, FormControl, InputGroup, ListGroup, Modal, Row, Toast } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaSearchPlus, FaUserTie } from 'react-icons/fa';
import { format } from 'date-fns';
import { AccessControl } from 'accesscontrol';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { PageWaiting } from '../../../components/PageWaiting';
import Members, { Member } from '../../../components/ProjectMembers';
import { User } from '../../../components/Users';
import { Customer } from '../../../components/Customers';
import { ProjectType } from '../../../components/ProjectTypes';
import { ProjectLine } from '../../../components/ProjectLines';
import { ProjectStatus } from '../../../components/ProjectStatus';
import { Bank } from '../../../components/Banks';
import { Property } from '../../../components/Properties';
import { DocsProject } from '../../../components/DocsProject';
import PageBack from '../../../components/PageBack';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';
import { prettifyCurrency } from '../../../components/InputMask/masks';

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
    customer: Yup.string().required('Obrigatório!'),
    type: Yup.string().required('Obrigatório!'),
    line: Yup.string().required('Obrigatório!'),
    status: Yup.string().required('Obrigatório!'),
    bank: Yup.string().required('Obrigatório!'),
    property: Yup.string().required('Obrigatório!'),
});

const ac = new AccessControl();

export default function NewProject() {
    const router = useRouter();
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [users, setUsers] = useState<User[]>([]);
    const [usersToAdd, setUsersToAdd] = useState<User[]>([]);
    const [membersAdded, setMembersAdded] = useState<Member[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [projectLines, setProjectLines] = useState<ProjectLine[]>([]);
    const [projectStatus, setProjectStatus] = useState<ProjectStatus[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [docsProject, setDocsProject] = useState<DocsProject[]>([]);

    const [accessVerified, setAccessVerified] = useState(false);
    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [showUsers, setShowUsers] = useState(false);

    const toggleShowUsers = () => setShowUsers(!showUsers);

    const [showModalChooseCustomer, setShowModalChooseCustomer] = useState(false);

    const handleCloseModalChooseCustomer = () => setShowModalChooseCustomer(false);
    const handleShowModalChooseCustomer = () => setShowModalChooseCustomer(true);

    useEffect(() => {
        if (user) {
            ac.setGrants(user.grants);

            if (ac.hasRole(user.id)) {
                if (ac.can(user.id).readAny('projects').granted) {
                    handleItemSideBar('projects');
                    handleSelectedMenu('projects-new');

                    api.get('users').then(res => {
                        setUsers(res.data);

                        const usersRes: User[] = res.data;
                        let newMembersAddedList: Member[] = [];

                        if (user) {
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
                        }
                    }).catch(err => {
                        console.log('Error to get users on new project, ', err);
                    });

                    api.get('customers').then(res => {
                        setCustomers(res.data);
                    }).catch(err => {
                        console.log('Error to get project status, ', err);
                    });

                    api.get('projects/types').then(res => {
                        setProjectTypes(res.data);
                    }).catch(err => {
                        console.log('Error to get project types, ', err);
                    });

                    api.get('projects/lines').then(res => {
                        setProjectLines(res.data);
                    }).catch(err => {
                        console.log('Error to get project lines, ', err);
                    });

                    api.get('projects/status').then(res => {
                        setProjectStatus(res.data);
                    }).catch(err => {
                        console.log('Error to get project status, ', err);
                    });

                    api.get('banks').then(res => {
                        setBanks(res.data);
                    }).catch(err => {
                        console.log('Error to get banks, ', err);
                    });

                    api.get('docs/project').then(res => {
                        let docsProjectRes: DocsProject[] = res.data;

                        docsProjectRes = docsProjectRes.filter(docProject => { return docProject.active });

                        setDocsProject(docsProjectRes);
                    }).catch(err => {
                        console.log('Error to get docs project, ', err);
                    });
                }
            }

            setAccessVerified(true);
        }
    }, [user]);

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

    return loading || !accessVerified ? <PageWaiting status="waiting" /> :
        <>
            {
                ac.hasRole(user.id) && ac.can(user.id).createAny('projects').granted ? <Container className="content-page">
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
                            customer: '',
                            customerName: '',
                            type: '',
                            line: '',
                            status: '',
                            bank: '',
                            property: '',
                        }}
                        onSubmit={async values => {
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
                                    value: Number(values.value.replace(".", "").replace(",", ".")),
                                    deal: Number(values.deal.replace(".", "").replace(",", ".")),
                                    paid: values.paid,
                                    paid_date: values.paid_date,
                                    contract: values.contract,
                                    analyst: values.analyst,
                                    analyst_contact: values.analyst_contact,
                                    notes: values.notes,
                                    warnings: values.warnings,
                                    customer: values.customer,
                                    type: values.type,
                                    line: values.line,
                                    status: values.status,
                                    bank: values.bank,
                                    property: values.property,
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
                                            <option hidden>...</option>
                                            {
                                                properties.map((property, index) => {
                                                    return <option key={index} value={property.id}>{property.name}</option>
                                                })
                                            }
                                        </Form.Control>
                                        <Form.Control.Feedback type="invalid">{touched.property && errors.property}</Form.Control.Feedback>
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
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="btnGroupValue">R$</InputGroup.Text>
                                            </InputGroup.Prepend>
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
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="btnGroupDeal">%</InputGroup.Text>
                                            </InputGroup.Prepend>
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

                                <Form.Row className="mb-2">
                                    <Form.Switch
                                        id="warnings"
                                        label="Observações"
                                        checked={values.warnings}
                                        onChange={() => { setFieldValue('warnings', !values.warnings) }}
                                    />
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
                </Container> :
                    <PageWaiting status="warning" message="Acesso negado!" />
            }
        </>
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