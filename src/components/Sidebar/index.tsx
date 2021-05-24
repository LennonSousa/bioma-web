import { useContext } from 'react';
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

import { SideBarContext } from '../../context/SideBarContext';
import styles from './styles.module.css';

const Sidebar: React.FC = () => {
    const { itemSideBar, selectedMenu, handleItemSideBar } = useContext(SideBarContext);

    return (
        <div className={styles.sideBarContainer}>
            <Accordion activeKey={itemSideBar} className={styles.accordionContainer}>
                <Card className={styles.menuCard}>
                    <Accordion.Toggle
                        as={Card.Header}
                        className={styles.menuCardHeader}
                        eventKey="customers"
                        onClick={() => handleItemSideBar('customers')}
                    >
                        <div>
                            <FaUserTie /> <span>Clientes</span>
                        </div>
                    </Accordion.Toggle>

                    <Accordion.Collapse eventKey="customers">
                        <Card.Body className={styles.menuCardBody}>
                            <Link href="/customers">
                                <a title="Listar todos os clientes" data-title="Listar todos os clientes">
                                    <Row
                                        className={
                                            selectedMenu === 'customers-index' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                                    <Row
                                        className={
                                            selectedMenu === 'customers-new' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                                    <Row
                                        className={
                                            selectedMenu === 'customers-docs' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                                    <Row
                                        className={
                                            selectedMenu === 'properties-index' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                                    <Row
                                        className={
                                            selectedMenu === 'properties-new' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                                    <Row
                                        className={
                                            selectedMenu === 'properties-docs' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                    <Accordion.Toggle
                        as={Card.Header}
                        className={styles.menuCardHeader}
                        eventKey="projects"
                        onClick={() => handleItemSideBar('projects')}
                    >
                        <div>
                            <FaFileAlt /> <span>Projetos</span>
                        </div>
                    </Accordion.Toggle>

                    <Accordion.Collapse eventKey="projects">
                        <Card.Body className={styles.menuCardBody}>
                            <Link href="/projects">
                                <a title="Listar todos os imóveis" data-title="Listar todos os imóveis">
                                    <Row
                                        className={
                                            selectedMenu === 'projects-index' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                                <a title="Criar um novo projeto" data-title="Criar um novo projeto">
                                    <Row
                                        className={
                                            selectedMenu === 'projects-new' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                                    <Row
                                        className={
                                            selectedMenu === 'projects-types' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                                <a title="Listar as fases" data-title="Listar as fases">
                                    <Row
                                        className={
                                            selectedMenu === 'projects-status' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                                    <Row
                                        className={
                                            selectedMenu === 'projects-lines' ? styles.selectedMenuCardBodyItem :
                                                styles.menuCardBodyItem
                                        }
                                    >
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
                    <Accordion.Toggle as={Card.Header} className={styles.menuCardHeader} eventKey="licensings">
                        <div>
                            <FaFileAlt /> <span>Licenças</span>
                        </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="licensings">
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
                    <Accordion.Toggle as={Card.Header} className={styles.menuCardHeader} eventKey="banks">
                        <div>
                            <FaUniversity /> <span>Bancos</span>
                        </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="banks">
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