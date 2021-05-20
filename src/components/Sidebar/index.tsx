import Link from 'next/link';
import { Accordion, Card, Dropdown, Row, Col } from 'react-bootstrap';
import {
    FaUserTie,
    FaFileAlt,
    FaList,
    FaPlus,
    FaIdCard,
    FaMapSigns,
    FaFileSignature,
    FaProjectDiagram,
    FaClipboardList,
    FaLayerGroup,
    FaUniversity,
    FaCity,
} from 'react-icons/fa';

import styles from './styles.module.css';

interface SidebarProps {
    showItem?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ showItem }) => {
    return (
        <div className={styles.sideBarContainer}>
            <Accordion className={styles.accordionContainer}>
                <Card className={styles.menuCard}>
                    <Accordion.Toggle as={Card.Header} className={styles.menuCardHeader} eventKey="0">
                        <div>
                            <FaUserTie /> <span>Clientes</span>
                        </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body className={styles.menuCardBody}>
                            <Link href="/customers">
                                <a title="Listar todos os clientes" data-title="Listar todos os clientes">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaList size={14} />
                                        </Col>
                                        <Col>
                                            <span>Lista</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/customers/new">
                                <a title="Criar um novo cliente" data-title="Criar um novo cliente">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaPlus size={14} />
                                        </Col>
                                        <Col>
                                            <span>Novo</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/docs/customer">
                                <a title="Listar os documentos para clientes" data-title="Listar os documentos para clientes">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaIdCard size={14} />
                                        </Col>
                                        <Col>
                                            <span>Documentos</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Dropdown.Divider />

                            <Link href="/properties">
                                <a title="Listar todos os imóveis" data-title="Listar todos os imóveis">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaMapSigns size={14} />
                                        </Col>
                                        <Col>
                                            <span>Imóveis</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/properties/new">
                                <a title="Criar um novo imóvel" data-title="Criar um novo imóvel">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaPlus size={14} />
                                        </Col>
                                        <Col>
                                            <span>Novo</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/docs/property">
                                <a title="Listar os documentos para imóveis" data-title="Listar os documentos para imóveis">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaFileSignature size={14} />
                                        </Col>
                                        <Col>
                                            <span>Documentos</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                        </Card.Body>
                    </Accordion.Collapse>
                </Card>

                <Card className={styles.menuCard}>
                    <Accordion.Toggle as={Card.Header} className={styles.menuCardHeader} eventKey="1">
                        <div>
                            <FaFileAlt /> <span>Projetos</span>
                        </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="1">
                        <Card.Body className={styles.menuCardBody}>
                            <Link href="/projects">
                                <a title="Listar todos os clientes" data-title="Listar todos os clientes">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaList size={14} />
                                        </Col>
                                        <Col>
                                            <span>Lista</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/projects/new">
                                <a title="Criar um novo cliente" data-title="Criar um novo cliente">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaPlus size={14} />
                                        </Col>
                                        <Col>
                                            <span>Novo</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Dropdown.Divider />

                            <Link href="/projects/types">
                                <a title="Listar os tipos" data-title="Listar os tipos">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaProjectDiagram size={14} />
                                        </Col>
                                        <Col>
                                            <span>Tipos</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/projects/status">
                                <a title="Listar as situações" data-title="Listar as situações">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaClipboardList size={14} />
                                        </Col>
                                        <Col>
                                            <span>Fases</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/projects/lines">
                                <a title="Listar as linhas de crédito" data-title="Listar as linhas de crédito">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaLayerGroup size={14} />
                                        </Col>
                                        <Col>
                                            <span>Linhas</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>

                <Card className={styles.menuCard}>
                    <Accordion.Toggle as={Card.Header} className={styles.menuCardHeader} eventKey="2">
                        <div>
                            <FaFileAlt /> <span>Licenças</span>
                        </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="2">
                        <Card.Body className={styles.menuCardBody}>
                            <Link href="/customers">
                                <a title="Listar todos os clientes" data-title="Listar todos os clientes">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaList size={14} />
                                        </Col>
                                        <Col>
                                            <span>Lista</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/customers/new">
                                <a title="Criar um novo cliente" data-title="Criar um novo cliente">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaPlus size={14} />
                                        </Col>
                                        <Col>
                                            <span>Novo</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/docs/customer">
                                <a title="Listar os documentos para clientes" data-title="Listar os documentos para clientes">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaIdCard size={14} />
                                        </Col>
                                        <Col>
                                            <span>Documentos</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Dropdown.Divider />

                            <Link href="/docs/property">
                                <a title="Listar os documentos para imóveis" data-title="Listar os documentos para imóveis">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaProjectDiagram size={14} />
                                        </Col>
                                        <Col>
                                            <span>Tipos</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/docs/property">
                                <a title="Listar os documentos para imóveis" data-title="Listar os documentos para imóveis">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaClipboardList size={14} />
                                        </Col>
                                        <Col>
                                            <span>Fases</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/docs/property">
                                <a title="Listar os documentos para imóveis" data-title="Listar os documentos para imóveis">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaLayerGroup size={14} />
                                        </Col>
                                        <Col>
                                            <span>Linhas</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>

                <Card className={styles.menuCard}>
                    <Accordion.Toggle as={Card.Header} className={styles.menuCardHeader} eventKey="3">
                        <div>
                            <FaUniversity /> <span>Bancos</span>
                        </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="3">
                        <Card.Body className={styles.menuCardBody}>
                            <Link href="/customers">
                                <a title="Listar todos os clientes" data-title="Listar todos os clientes">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaList size={14} />
                                        </Col>
                                        <Col>
                                            <span>Lista</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Link href="/customers/new">
                                <a title="Criar um novo cliente" data-title="Criar um novo cliente">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaPlus size={14} />
                                        </Col>
                                        <Col>
                                            <span>Novo</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>

                            <Dropdown.Divider />

                            <Link href="/docs/property">
                                <a title="Listar os documentos para imóveis" data-title="Listar os documentos para imóveis">
                                    <Row className={styles.menuCardBodyItem}>
                                        <Col sm={1}>
                                            <FaCity size={14} />
                                        </Col>
                                        <Col>
                                            <span>Instituições</span>
                                        </Col>
                                    </Row>
                                </a>
                            </Link>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </div>
    )
}

export default Sidebar;