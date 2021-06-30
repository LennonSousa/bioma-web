import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, ButtonGroup, Col, Container, ListGroup, Row, Tabs, Tab } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaFileAlt,
    FaIdCard,
    FaExclamationCircle,
    FaCheck,
    FaPencilAlt,
    FaPlus,
    FaRegFile,
} from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { can } from '../../../components/Users';
import { Customer } from '../../../components/Customers';
import Members from '../../../components/CustomerMembers';
import { DocsCustomer } from '../../../components/DocsCustomer';
import PropertyListItem from '../../../components/PropertyListItem';
import ProjectListItem from '../../../components/ProjectListItem';
import LicensingListItem from '../../../components/LicensingListItem';
import CustomerAttachments from '../../../components/CustomerAttachments';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage } from '../../../components/interfaces/AlertMessage';

import styles from './styles.module.css';

export default function CustomerDetails() {
    const router = useRouter();
    const { customer } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [customerData, setCustomerData] = useState<Customer>();
    const [documentType, setDocumentType] = useState("CPF");

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('customers-index');

        if (user) {
            if (can(user, "customers", "read:any")) {
                if (customer) {
                    api.get(`customers/${customer}`).then(res => {
                        let customerRes: Customer = res.data;

                        if (customerRes.document.length > 14)
                            setDocumentType("CNPJ");

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

                            setLoadingData(false);
                        }).catch(err => {
                            console.log('Error to get docs customer to edit, ', err);

                            setTypeLoadingMessage("error");
                            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                            setLoadingData(false);
                        });
                    }).catch(err => {
                        console.log('Error to get customer: ', err);

                        setTypeLoadingMessage("error");
                        setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                        setLoadingData(false);
                    });
                }
            }
        }
    }, [user, customer]);

    function handleRoute(route: string) {
        router.push(route);
    }

    return !user || loading ? <PageWaiting status="waiting" /> :
        <>
            {
                can(user, "customers", "read:any") ? <>
                    {
                        loadingData ? <PageWaiting
                            status={typeLoadingMessage}
                            message={textLoadingMessage}
                        /> :
                            <>
                                {
                                    !customerData ? <PageWaiting status="waiting" /> :
                                        <Container className="content-page">
                                            <Row>
                                                <Col>
                                                    <Row className="mb-3">
                                                        <Col>
                                                            <PageBack href="/customers" subTitle="Voltar para a lista de clientes" />
                                                        </Col>

                                                        <Col className="col-row">
                                                            <ButtonGroup className="col-12">
                                                                <Button
                                                                    title="Editar cliente."
                                                                    variant="success"
                                                                    onClick={() => handleRoute(`/customers/edit/${customerData.id}`)}
                                                                >
                                                                    <FaPencilAlt />
                                                                </Button>
                                                            </ButtonGroup>
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
                                                                            canRemove={false}
                                                                        />
                                                                    })
                                                                }
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col sm={6}>
                                                            <Row className="align-items-center">
                                                                <Col className="col-row">
                                                                    <h3 className="form-control-plaintext text-success">{customerData.name}</h3>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={4} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">{documentType}</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.document}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={2} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Nascimento</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{format(new Date(customerData.birth), 'dd/MM/yyyy')}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col sm={3}>
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Telefone comercial</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.phone}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={3} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Celular</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.cellphone}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={6} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">E-mail</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.email}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col sm={8}>
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Outros contatos</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.contacts}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={4} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Responsável</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.owner}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col sm={6}>
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Endereço</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.address}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={4} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Cidade</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.city}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={2} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Estado</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.state}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    {
                                                        customerData.warnings && <Row className="mb-3">
                                                            <Col >
                                                                <Row>
                                                                    <Col>
                                                                        <h6 className="text-success">Observação {customerData.warnings && <FaExclamationCircle />}</h6>
                                                                    </Col>
                                                                </Row>

                                                                <Row>
                                                                    <Col>
                                                                        <span className="text-secondary text-wrap">{customerData.notes}</span>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        </Row>
                                                    }

                                                    <Row className="mb-3">
                                                        <Col>
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Tipo</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.type.name}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Col className="border-top mb-3"></Col>

                                                    <Row className="mb-3">
                                                        <Col sm={4} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Criado em</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{format(new Date(customerData.created_at), 'dd/MM/yyyy')}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                        <Col sm={4} >
                                                            <Row>
                                                                <Col>
                                                                    <span className="text-success">Usuário</span>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-secondary">{customerData.created_by}</h6>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col>
                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-success">Documentação <FaIdCard /></h6>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col>
                                                                    <ListGroup className="mb-3">
                                                                        {
                                                                            customerData.docs.map((doc, index) => {
                                                                                return <ListGroup.Item key={index} action as="div" variant="light">
                                                                                    <Row>
                                                                                        <Col className={`${doc.checked ? 'text-success' : ''}`} sm={8}>
                                                                                            {
                                                                                                doc.checked ? <FaCheck /> :
                                                                                                    <FaRegFile />} <label>{doc.doc.name} </label>
                                                                                        </Col>

                                                                                        {
                                                                                            doc.checked && <>
                                                                                                <Col sm={2}>Data do recebimento</Col>

                                                                                                <Col sm={2}>
                                                                                                    {format(new Date(doc.received_at), 'dd/MM/yyyy')}
                                                                                                </Col>
                                                                                            </>
                                                                                        }
                                                                                    </Row>
                                                                                </ListGroup.Item>
                                                                            })
                                                                        }
                                                                    </ListGroup>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <Col>
                                                            <Row>
                                                                <Col>
                                                                    <h6 className="text-success">Anexos <FaFileAlt /></h6>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                {
                                                                    !!customerData.attachments.length ? <Col>
                                                                        <ListGroup>
                                                                            {
                                                                                customerData.attachments.map((attachment, index) => {
                                                                                    return <CustomerAttachments
                                                                                        key={index}
                                                                                        attachment={attachment}
                                                                                        canEdit={false}
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
                                                        </Col>
                                                    </Row>

                                                    <Col className="border-top mb-3"></Col>

                                                    <Tabs defaultActiveKey="properties" id="relations-customer">
                                                        <Tab eventKey="properties" title="Imóveis">
                                                            <Row className={styles.relationsContainer}>
                                                                <Col>
                                                                    <Row className={styles.relationsButtonsContent}>
                                                                        <Col>
                                                                            <Link href={`/properties/new/customer/${customerData.id}`}>
                                                                                <a
                                                                                    className="btn btn-outline-success"
                                                                                    title="Criar um novo imóvel para esse cliente"
                                                                                    data-title="Criar um novo imóvel para esse cliente"
                                                                                >
                                                                                    <FaPlus /> Criar um imóvel
                                                                                </a>
                                                                            </Link>
                                                                        </Col>
                                                                    </Row>

                                                                    <Row className={styles.relationsContent}>
                                                                        {
                                                                            !!customerData.properties.length ? customerData.properties.map((property, index) => {
                                                                                return <PropertyListItem
                                                                                    key={index}
                                                                                    property={property}
                                                                                    showCustomer={false}
                                                                                />
                                                                            }) :
                                                                                <Col>
                                                                                    <span className="text-success">Nenhum imóvel registrado.</span>
                                                                                </Col>
                                                                        }
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                        </Tab>

                                                        <Tab eventKey="projects" title="Projetos">
                                                            <Row className={styles.relationsContainer}>
                                                                <Col>
                                                                    <Row className={styles.relationsButtonsContent}>
                                                                        <Col>
                                                                            <Link href={`/projects/new/customer/${customerData.id}`}>
                                                                                <a
                                                                                    className="btn btn-outline-success"
                                                                                    title="Criar um novo projeto para esse cliente"
                                                                                    data-title="Criar um novo projeto para esse cliente"
                                                                                >
                                                                                    <FaPlus /> Criar um projeto
                                                                                </a>
                                                                            </Link>
                                                                        </Col>
                                                                    </Row>

                                                                    <Row className={styles.relationsContent}>
                                                                        {
                                                                            !!customerData.projects.length ? customerData.projects.map((project, index) => {
                                                                                return <ProjectListItem
                                                                                    key={index}
                                                                                    project={project}
                                                                                />
                                                                            }) :
                                                                                <Col>
                                                                                    <span className="text-success">Nenhum projeto registrado.</span>
                                                                                </Col>
                                                                        }
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                        </Tab>

                                                        <Tab eventKey="licensings" title="Licenciamentos">
                                                            <Row className={styles.relationsContainer}>
                                                                <Col>
                                                                    <Row className={styles.relationsButtonsContent}>
                                                                        <Col>
                                                                            <Link href={`/licensings/new/customer/${customerData.id}`}>
                                                                                <a
                                                                                    className="btn btn-outline-success"
                                                                                    title="Criar um novo licenciamento para esse cliente"
                                                                                    data-title="Criar um novo licenciamento para esse cliente"
                                                                                >
                                                                                    <FaPlus /> Criar um licenciamento
                                                                                </a>
                                                                            </Link>
                                                                        </Col>
                                                                    </Row>

                                                                    <Row className={styles.relationsContent}>
                                                                        {
                                                                            !!customerData.licensings.length ? customerData.licensings.map((licensing, index) => {
                                                                                return <LicensingListItem
                                                                                    key={index}
                                                                                    licensing={licensing}
                                                                                />
                                                                            }) :
                                                                                <Col>
                                                                                    <span className="text-success">Nenhum licenciamento registrado.</span>
                                                                                </Col>
                                                                        }
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                        </Tab>
                                                    </Tabs>
                                                </Col>
                                            </Row>
                                        </Container>
                                }
                            </>
                    }
                </> :
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