import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, ButtonGroup, Col, Container, ListGroup, Row, Tabs, Tab } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaIdCard,
    FaExclamationCircle,
    FaCheck,
    FaMapSigns,
    FaPencilAlt,
    FaPlus,
    FaFileAlt,
    FaRegFile
} from 'react-icons/fa';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../context/SideBarContext';
import { Property } from '../../../components/Properties';
import Members from '../../../components/PropertyMembers';
import PropertyListItem from '../../../components/PropertyListItem';
import { DocsProperty } from '../../../components/DocsProperty';
import PropertyAttachments from '../../../components/PropertyAttachments';
import PageBack from '../../../components/PageBack';

import styles from './styles.module.css';

export default function PropertyDetails() {
    const router = useRouter();
    const { property } = router.query;
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [propertyData, setPropertyData] = useState<Property>();

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('properties-index');

        if (property) {
            api.get(`properties/${property}`).then(res => {
                let propertyRes: Property = res.data;

                api.get('docs/property').then(res => {
                    const documentsRes: DocsProperty[] = res.data;

                    propertyRes = {
                        ...propertyRes, docs: documentsRes.map(doc => {
                            const customerDoc = propertyRes.docs.find(item => { return item.doc.id === doc.id });

                            if (customerDoc)
                                return { ...customerDoc, property: propertyRes };

                            return {
                                id: '0',
                                path: '',
                                received_at: new Date(),
                                checked: false,
                                property: propertyRes,
                                doc: doc,
                            };
                        })
                    }

                    setPropertyData(propertyRes);
                }).catch(err => {
                    console.log('Error to get docs property to edit, ', err);
                });
            }).catch(err => {
                console.log('Error to get property: ', err);
            });
        }
    }, [property]);

    function handleRoute(route: string) {
        router.push(route);
    }

    return <Container className="content-page">
        {
            !propertyData ? <h1>Aguarde...</h1> :
                <Row>
                    <Col>
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
                                        propertyData.members.map(member => {
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
                                        <h3 className="form-control-plaintext text-success">{propertyData.name}</h3>
                                    </Col>

                                    <Col className="col-row">
                                        <ButtonGroup size="sm" className="col-12">

                                            <Button
                                                title="Editar cliente."
                                                variant="success"
                                                onClick={() => handleRoute(`/properties/edit/${propertyData.customer.id}`)}
                                            >
                                                <FaPencilAlt />
                                            </Button>

                                            <Button
                                                variant="success"
                                                title="Criar um novo projeto para este cliente."
                                                onClick={() => handleRoute(`/properties/new?customer=${propertyData.customer.id}`)}
                                            >
                                                <FaPlus /><FaMapSigns />
                                            </Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            </Col>

                            <Col sm={6} >
                                <Row>
                                    <Col>
                                        <span className="text-success">Cliente</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <h6 className="text-secondary">{propertyData.customer.name}</h6>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col sm={3}>
                                <Row>
                                    <Col>
                                        <span className="text-success">Matrícula</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <h6 className="text-secondary">{propertyData.registration}</h6>
                                    </Col>
                                </Row>
                            </Col>

                            <Col sm={3} >
                                <Row>
                                    <Col>
                                        <span className="text-success">Área</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <h6 className="text-secondary">{propertyData.area}</h6>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col sm={6}>
                                <Row>
                                    <Col>
                                        <span className="text-success">Roteiro</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <h6 className="text-secondary">{propertyData.route}</h6>
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
                                        <h6 className="text-secondary">{propertyData.city}</h6>
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
                                        <h6 className="text-secondary">{propertyData.state}</h6>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        {
                            propertyData.warnings && <Row className="mb-3">
                                <Col >
                                    <Row>
                                        <Col>
                                            <h6 className="text-success">Observação {propertyData.warnings && <FaExclamationCircle />}</h6>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <span className="text-secondary text-wrap">{propertyData.notes}</span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        }

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
                                        <h6 className="text-secondary">{format(new Date(propertyData.created_at), 'dd/MM/yyyy')}</h6>
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
                                        <h6 className="text-secondary">{propertyData.created_by}</h6>
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
                                                propertyData.docs.map((doc, index) => {
                                                    return <ListGroup.Item key={index} action as="div" variant="light">
                                                        <Row>
                                                            <Col sm={8}>
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
                                    <Col>
                                        <ListGroup>
                                            {
                                                propertyData.attachments.map((attachment, index) => {
                                                    return <PropertyAttachments
                                                        key={index}
                                                        attachment={attachment}
                                                        canEdit={false}
                                                    />
                                                })
                                            }
                                        </ListGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Col className="border-top mb-3"></Col>

                        <Tabs defaultActiveKey="projects" id="relations-customer">
                            <Tab eventKey="projects" title="Projetos">
                                <Row className={styles.relationsContainer}>
                                    <Col>
                                        <Row className={styles.relationsButtonsContent}>
                                            <Col>
                                                <Link href={`/projects/new/customer/${propertyData.id}`}>
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
                                            <Col>
                                                <span className="text-success">Nenhum projeto registrado.</span>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Tab>

                            <Tab eventKey="properties" title="Outros imóveis">
                                <Row className={styles.relationsContainer}>
                                    <Col>
                                        <Row className={styles.relationsButtonsContent}>
                                            <Col>
                                                <Link href={`/properties/new?customer=${propertyData.customer.id}`}>
                                                    <a
                                                        className="btn btn-outline-success"
                                                        title="Criar um novo imóvel para este cliente."
                                                        data-title="Criar um novo imóvel para este cliente."
                                                    >
                                                        <FaPlus /> Criar um imóvel
                                                    </a>
                                                </Link>
                                            </Col>
                                        </Row>

                                        <Row className={styles.relationsContent}>
                                            {
                                                propertyData.customer.properties.length > 0 ? propertyData.customer.properties.map((property, index) => {
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
                        </Tabs>
                    </Col>
                </Row>
        }
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