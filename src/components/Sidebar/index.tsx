import Link from 'next/link';
import { Accordion, Card, Dropdown, Row, Col } from 'react-bootstrap';
import {
    FaUserTie,
    FaFileAlt,
    FaList,
    FaPlus,
    FaIdCard,
    FaMapSigns,
    FaFileSignature
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

                            <Row className={styles.menuCardBodyItem}>
                                <Col sm={1}>
                                    <FaIdCard size={14} />
                                </Col>
                                <Col>
                                    <span>Documentos</span>
                                </Col>
                            </Row>

                            <Dropdown.Divider />

                            <Row className={styles.menuCardBodyItem}>
                                <Col sm={1}>
                                    <FaMapSigns size={14} />
                                </Col>
                                <Col>
                                    <span>Imóveis</span>
                                </Col>
                            </Row>

                            <Row className={styles.menuCardBodyItem}>
                                <Col sm={1}>
                                    <FaPlus size={14} />
                                </Col>
                                <Col>
                                    <span>Novo</span>
                                </Col>
                            </Row>

                            <Row className={styles.menuCardBodyItem}>
                                <Col sm={1}>
                                    <FaFileSignature size={14} />
                                </Col>
                                <Col>
                                    <span>Documentos</span>
                                </Col>
                            </Row>

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
                        <Card.Body>Hello! I'm the body</Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </div>
    )
}

export default Sidebar;