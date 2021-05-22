import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Col, Container, ListGroup, Row, Tabs, Tab } from 'react-bootstrap';
import { format } from 'date-fns';
import {
    FaLongArrowAltLeft,
    FaIdCard,
    FaExclamationCircle,
    FaCheck,
    FaMapSigns,
    FaPencilAlt,
    FaPlus,
    FaPlusSquare,
    FaRegFile
} from 'react-icons/fa';

import api from '../../../services/api';
import { Property } from '../../../components/Properties';
import PropertyListItem from '../../../components/PropertyListItem';
import { DocsProperty } from '../../../components/DocsProperty';
import PageBack from '../../../components/PageBack';

import styles from './styles.module.css';

export default function PropertyDetails() {
    const router = useRouter();
    const { property } = router.query;

    const [propertyData, setPropertyData] = useState<Property>();

    useEffect(() => {
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
                            <Col sm={6}>
                                <Row className="align-items-center">
                                    <Col>
                                        <h3 className="form-control-plaintext text-success">{propertyData.name}</h3>
                                    </Col>

                                    <Col>
                                        <Link href={`/properties/edit/${propertyData.id}`}>
                                            <a title="Editar" data-title="Editar"><FaPencilAlt /></a>
                                        </Link>
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
                                    <Col>
                                        <Link href={`/properties/new?customer=${propertyData.customer.id}`}>
                                            <a
                                                title="Criar um novo imóvel para este cliente"
                                                data-title="Criar um novo imóvel para este cliente"
                                            >
                                                <FaPlusSquare /><FaMapSigns />
                                            </a>
                                        </Link>
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