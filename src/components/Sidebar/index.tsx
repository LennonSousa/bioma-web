import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Accordion, AccordionButton, Card, Dropdown, Nav, NavDropdown, Row, Col } from 'react-bootstrap';
import {
    FaColumns,
    FaUserTie,
    FaFileAlt,
    FaList,
    FaPlus,
    FaIdCard,
    FaMapSigns,
    FaFileSignature,
    FaFileContract,
    FaProjectDiagram,
    FaClipboardList,
    FaLayerGroup,
    FaUniversity,
    FaCity,
    FaAward,
    FaBalanceScaleLeft,
    FaFileExcel,
    FaSortAlphaDown,
    FaUsers,
    FaUsersCog
} from 'react-icons/fa';

import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';

import styles from './styles.module.css';

const Sidebar: React.FC = () => {
    const router = useRouter();
    const { itemSideBar, selectedMenu, handleItemSideBar } = useContext(SideBarContext);
    const { signed, user } = useContext(AuthContext);

    const [showPageHeader, setShowPageHeader] = useState(false);

    const pathsNotShow = [
        '/',
        '/users/new/auth',
        '/users/reset',
        '/users/reset/auth',
        '/404',
        '500',
        '/shares/auth',
    ];

    useEffect(() => {
        let show = false;

        if (signed && user) {
            if (!pathsNotShow.find(item => { return item === router.route })) show = true;
        }

        setShowPageHeader(show);
    }, [signed, router.route, user]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleToDashboard() {
        router.push('/dashboard');
    }

    return (
        showPageHeader && user ? <div className={`${styles.sideBarContainer} d-print-none`}>
            <Accordion activeKey={itemSideBar} className={styles.accordionContainer}>
                <Card className={styles.menuCard}>
                    <AccordionButton
                        as={Card.Header}
                        className={styles.menuCardHeader}
                        eventKey="dashboard"
                        onClick={handleToDashboard}
                    >
                        <div>
                            <FaColumns /> <span>Painel</span>
                        </div>
                    </AccordionButton>
                </Card>

                {
                    can(user, "customers", "view") && <Card className={styles.menuCard}>
                        <AccordionButton
                            as={Card.Header}
                            className={styles.menuCardHeader}
                            eventKey="customers"
                            onClick={() => handleItemSideBar('customers')}
                        >
                            <div>
                                <FaUserTie /> <span>Clientes</span>
                            </div>
                        </AccordionButton>

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

                                {
                                    can(user, "customers", "create") && <Link href="/customers/new">
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
                                }

                                {
                                    can(user, "customers", "update") && <>
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

                                        <Link href="/customers/types">
                                            <a title="Listar os tipos" data-title="Listar os tipos">
                                                <Row
                                                    className={
                                                        selectedMenu === 'customers-types' ? styles.selectedMenuCardBodyItem :
                                                            styles.menuCardBodyItem
                                                    }
                                                >
                                                    <Col sm={1}>
                                                        <FaUsersCog size={14} />
                                                    </Col>
                                                    <Col>
                                                        <span>Tipos</span>
                                                    </Col>
                                                </Row>
                                            </a>
                                        </Link>
                                    </>
                                }


                                {
                                    can(user, "properties", "view") && <>
                                        <Dropdown.Divider />

                                        <Link href="/properties">
                                            <a title="Listar todos os im??veis" data-title="Listar todos os im??veis">
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
                                                        <span>Im??veis</span>
                                                    </Col>
                                                </Row>
                                            </a>
                                        </Link>

                                        {
                                            can(user, "customers", "create") && <Link href="/properties/new">
                                                <a title="Criar um novo im??vel" data-title="Criar um novo im??vel">
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
                                        }

                                        {
                                            can(user, "properties", "update") && <Link href="/docs/property">
                                                <a title="Listar os documentos para im??veis" data-title="Listar os documentos para im??veis">
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
                                        }
                                    </>
                                }
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                }

                {
                    can(user, "projects", "view") && <Card className={styles.menuCard}>
                        <AccordionButton
                            as={Card.Header}
                            className={styles.menuCardHeader}
                            eventKey="projects"
                            onClick={() => handleItemSideBar('projects')}
                        >
                            <div>
                                <FaFileAlt /> <span>Projetos</span>
                            </div>
                        </AccordionButton>

                        <Accordion.Collapse eventKey="projects">
                            <Card.Body className={styles.menuCardBody}>
                                <Link href="/projects">
                                    <a title="Listar todos os im??veis" data-title="Listar todos os im??veis">
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

                                {
                                    can(user, "projects", "create") && <Link href="/projects/new">
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
                                }

                                {
                                    can(user, "projects", "update") && <>
                                        <Link href="/docs/project">
                                            <a title="Listar os documentos para projetos" data-title="Listar os documentos para projetos">
                                                <Row
                                                    className={
                                                        selectedMenu === 'projects-docs' ? styles.selectedMenuCardBodyItem :
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
                                            <a title="Listar as linhas de cr??dito" data-title="Listar as linhas de cr??dito">
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
                                    </>
                                }
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                }

                {
                    can(user, "licensings", "view") && <Card className={styles.menuCard}>
                        <AccordionButton
                            as={Card.Header}
                            className={styles.menuCardHeader}
                            eventKey="licensings"
                            onClick={() => handleItemSideBar('licensings')}
                        >
                            <div>
                                <FaFileContract /> <span>Licen??as</span>
                            </div>
                        </AccordionButton>
                        <Accordion.Collapse eventKey="licensings">
                            <Card.Body className={styles.menuCardBody}>
                                <Link href="/licensings">
                                    <a title="Listar todos os licenciamentos" data-title="Listar todos os licenciamentos">
                                        <Row
                                            className={
                                                selectedMenu === 'licensings-index' ? styles.selectedMenuCardBodyItem :
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

                                {
                                    can(user, "licensings", "create") && <Link href="/licensings/new">
                                        <a title="Criar um novo licenciamento" data-title="Criar um novo licenciamento">
                                            <Row
                                                className={
                                                    selectedMenu === 'licensings-new' ? styles.selectedMenuCardBodyItem :
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
                                }

                                {
                                    can(user, "licensings", "update") && <>
                                        <Dropdown.Divider />

                                        <Link href="/licensings/authorizations">
                                            <a title="Listar os tipos" data-title="Listar os tipos">
                                                <Row
                                                    className={
                                                        selectedMenu === 'licensings-authorizations' ? styles.selectedMenuCardBodyItem :
                                                            styles.menuCardBodyItem
                                                    }
                                                >
                                                    <Col sm={1}>
                                                        <FaAward size={14} />
                                                    </Col>
                                                    <Col>
                                                        <span>Licen??as</span>
                                                    </Col>
                                                </Row>
                                            </a>
                                        </Link>

                                        <Link href="/licensings/agencies">
                                            <a title="Listar as ??rg??os" data-title="Listar os ??rg??os">
                                                <Row
                                                    className={
                                                        selectedMenu === 'licensings-agencies' ? styles.selectedMenuCardBodyItem :
                                                            styles.menuCardBodyItem
                                                    }
                                                >
                                                    <Col sm={1}>
                                                        <FaBalanceScaleLeft size={14} />
                                                    </Col>
                                                    <Col>
                                                        <span>??rg??os</span>
                                                    </Col>
                                                </Row>
                                            </a>
                                        </Link>

                                        <Link href="/licensings/status">
                                            <a title="Listar as fases" data-title="Listar as fases">
                                                <Row
                                                    className={
                                                        selectedMenu === 'licensings-status' ? styles.selectedMenuCardBodyItem :
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

                                        <Link href="/licensings/infringements">
                                            <a title="Listar as infra????es" data-title="Listar as infra????es">
                                                <Row
                                                    className={
                                                        selectedMenu === 'licensings-infringements' ? styles.selectedMenuCardBodyItem :
                                                            styles.menuCardBodyItem
                                                    }
                                                >
                                                    <Col sm={1}>
                                                        <FaFileExcel size={14} />
                                                    </Col>
                                                    <Col>
                                                        <span>Infra????es</span>
                                                    </Col>
                                                </Row>
                                            </a>
                                        </Link>
                                    </>
                                }
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                }

                {
                    can(user, "banks", "view") && <Card className={styles.menuCard}>
                        <AccordionButton
                            as={Card.Header}
                            className={styles.menuCardHeader}
                            eventKey="banks"
                            onClick={() => handleItemSideBar('banks')}
                        >
                            <div>
                                <FaUniversity /> <span>Bancos</span>
                            </div>
                        </AccordionButton>
                        <Accordion.Collapse eventKey="banks">
                            <Card.Body className={styles.menuCardBody}>
                                <Link href="/banks">
                                    <a title="Listar todos os bancos" data-title="Listar todos os bancos">
                                        <Row
                                            className={
                                                selectedMenu === 'banks-index' ? styles.selectedMenuCardBodyItem :
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

                                {
                                    can(user, "banks", "create") && <Link href="/banks/new">
                                        <a title="Criar um novo banco" data-title="Criar um novo banco">
                                            <Row
                                                className={
                                                    selectedMenu === 'banks-new' ? styles.selectedMenuCardBodyItem :
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
                                }

                                <Dropdown.Divider />

                                {
                                    can(user, "institutions", "view") && <Link href="/institutions">
                                        <a title="Listar todas as institui????es" data-title="Listar todas as institui????es">
                                            <Row
                                                className={
                                                    selectedMenu === 'institutions-index' ? styles.selectedMenuCardBodyItem :
                                                        styles.menuCardBodyItem
                                                }
                                            >
                                                <Col sm={1}>
                                                    <FaCity size={14} />
                                                </Col>
                                                <Col>
                                                    <span>Institui????es</span>
                                                </Col>
                                            </Row>
                                        </a>
                                    </Link>
                                }
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                }

                <Card className={styles.menuCard}>
                    <AccordionButton
                        as={Card.Header}
                        className={styles.menuCardHeader}
                        eventKey="reports"
                        onClick={() => handleItemSideBar('reports')}
                    >
                        <div>
                            <FaSortAlphaDown /> <span>Relat??rios</span>
                        </div>
                    </AccordionButton>
                    <Accordion.Collapse eventKey="reports">
                        <Card.Body className={styles.menuCardBody}>
                            {
                                can(user, "banks", "view") && <Link href="/reports/banks">
                                    <a title="Relat??rios de bancos" data-title="Relat??rios de bancos">
                                        <Row
                                            className={
                                                selectedMenu === 'reports-banks' ? styles.selectedMenuCardBodyItem :
                                                    styles.menuCardBodyItem
                                            }
                                        >
                                            <Col sm={1}>
                                                <FaUniversity size={14} />
                                            </Col>
                                            <Col>
                                                <span>Bancos</span>
                                            </Col>
                                        </Row>
                                    </a>
                                </Link>
                            }

                            {
                                can(user, "customers", "view") && <Link href="/reports/customers">
                                    <a title="Relat??rios de clientes" data-title="Relat??rios de clientes">
                                        <Row
                                            className={
                                                selectedMenu === 'reports-customers' ? styles.selectedMenuCardBodyItem :
                                                    styles.menuCardBodyItem
                                            }
                                        >
                                            <Col sm={1}>
                                                <FaUserTie size={14} />
                                            </Col>
                                            <Col>
                                                <span>Clientes</span>
                                            </Col>
                                        </Row>
                                    </a>
                                </Link>
                            }

                            {
                                can(user, "licensings", "view") && <Link href="/reports/licensings">
                                    <a title="Relat??rios de licenciamentos" data-title="Relat??rios de licenciamentos">
                                        <Row
                                            className={
                                                selectedMenu === 'reports-licensings' ? styles.selectedMenuCardBodyItem :
                                                    styles.menuCardBodyItem
                                            }
                                        >
                                            <Col sm={1}>
                                                <FaFileContract />
                                            </Col>
                                            <Col>
                                                <span>Licen??as</span>
                                            </Col>
                                        </Row>
                                    </a>
                                </Link>
                            }

                            {
                                can(user, "projects", "view") && <Link href="/reports/projects">
                                    <a title="Relat??rios de projetos" data-title="Relat??rios de projetos">
                                        <Row
                                            className={
                                                selectedMenu === 'reports-projects' ? styles.selectedMenuCardBodyItem :
                                                    styles.menuCardBodyItem
                                            }
                                        >
                                            <Col sm={1}>
                                                <FaFileAlt size={14} />
                                            </Col>
                                            <Col>
                                                <span>Projetos</span>
                                            </Col>
                                        </Row>
                                    </a>
                                </Link>
                            }

                            {
                                can(user, "properties", "view") && <Link href="/reports/properties">
                                    <a title="Relat??rios de im??veis" data-title="Relat??rios de im??veis">
                                        <Row
                                            className={
                                                selectedMenu === 'reports-properties' ? styles.selectedMenuCardBodyItem :
                                                    styles.menuCardBodyItem
                                            }
                                        >
                                            <Col sm={1}>
                                                <FaMapSigns size={14} />
                                            </Col>
                                            <Col>
                                                <span>Im??veis</span>
                                            </Col>
                                        </Row>
                                    </a>
                                </Link>
                            }
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>

                {
                    can(user, "users", "view") && <Card className={styles.menuCard}>
                        <AccordionButton
                            as={Card.Header}
                            className={styles.menuCardHeader}
                            eventKey="users"
                            onClick={() => handleItemSideBar('users')}
                        >
                            <div>
                                <FaUsers /> <span>Usu??rios</span>
                            </div>
                        </AccordionButton>
                        <Accordion.Collapse eventKey="users">
                            <Card.Body className={styles.menuCardBody}>
                                <Link href="/users">
                                    <a title="Listar todos os usu??rios" data-title="Listar todos os usu??rios">
                                        <Row
                                            className={
                                                selectedMenu === 'users-index' ? styles.selectedMenuCardBodyItem :
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

                                {
                                    can(user, "users", "create") && <Link href="/users/new">
                                        <a title="Criar um novo usu??rio" data-title="Criar um novo usu??rio">
                                            <Row
                                                className={
                                                    selectedMenu === 'users-new' ? styles.selectedMenuCardBodyItem :
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
                                }
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                }
            </Accordion>
        </div > : null
    )
}

export function SideNavBar() {
    const { user } = useContext(AuthContext);

    return (
        user ? <Nav className="me-auto mb-3">
            <Link href="/dashboard" passHref>
                <Nav.Link><FaColumns /> <span>Painel</span></Nav.Link>
            </Link>

            {
                can(user, "customers", "view") && <NavDropdown title="Clientes" id="customers-dropdown">
                    <Link href="/customers" passHref>
                        <NavDropdown.Item ><FaList size={14} /> Lista</NavDropdown.Item>
                    </Link>

                    {
                        can(user, "customers", "create") && <Link href="/customers/new" passHref>
                            <NavDropdown.Item ><FaPlus size={14} /> Novo</NavDropdown.Item>
                        </Link>
                    }

                    {
                        can(user, "customers", "update") && <>
                            <NavDropdown.Divider />

                            <Link href="/docs/customer" passHref>
                                <NavDropdown.Item ><FaIdCard size={14} /> Documentos</NavDropdown.Item>
                            </Link>

                            <Link href="/customers/types" passHref>
                                <NavDropdown.Item ><FaUsersCog size={14} /> Tipos</NavDropdown.Item>
                            </Link>
                        </>
                    }

                    {
                        can(user, "properties", "view") && <>
                            <NavDropdown.Divider />

                            <Link href="/properties" passHref>
                                <NavDropdown.Item ><FaMapSigns size={14} /> Im??veis</NavDropdown.Item>
                            </Link>

                            {
                                can(user, "properties", "create") && <Link href="/properties/new" passHref>
                                    <NavDropdown.Item ><FaPlus size={14} /> Novo</NavDropdown.Item>
                                </Link>
                            }

                            {
                                can(user, "properties", "update") &&
                                <Link href="/docs/property" passHref>
                                    <NavDropdown.Item ><FaFileSignature size={14} /> Documentos</NavDropdown.Item>
                                </Link>
                            }
                        </>
                    }
                </NavDropdown>
            }

            {
                can(user, "projects", "view") && <NavDropdown title="Projetos" id="projects-dropdown">
                    <Link href="/projects" passHref>
                        <NavDropdown.Item ><FaList size={14} /> Lista</NavDropdown.Item>
                    </Link>

                    {
                        can(user, "projects", "create") && <Link href="/projects/new" passHref>
                            <NavDropdown.Item ><FaPlus size={14} /> Novo</NavDropdown.Item>
                        </Link>
                    }

                    {
                        can(user, "projects", "update") && <>
                            <Link href="/docs/project" passHref>
                                <NavDropdown.Item ><FaIdCard size={14} /> Documentos</NavDropdown.Item>
                            </Link>

                            <NavDropdown.Divider />

                            <Link href="/projects/types" passHref>
                                <NavDropdown.Item ><FaProjectDiagram size={14} /> Tipos</NavDropdown.Item>
                            </Link>

                            <Link href="/projects/status" passHref>
                                <NavDropdown.Item ><FaClipboardList size={14} /> Fases</NavDropdown.Item>
                            </Link>

                            <Link href="/projects/lines" passHref>
                                <NavDropdown.Item ><FaLayerGroup size={14} /> Linhas</NavDropdown.Item>
                            </Link>
                        </>
                    }
                </NavDropdown>
            }

            {
                can(user, "licensings", "view") && <NavDropdown title="Licenciamentos" id="licensings-dropdown">
                    <Link href="/licensings" passHref>
                        <NavDropdown.Item ><FaList size={14} /> Lista</NavDropdown.Item>
                    </Link>

                    {
                        can(user, "licensings", "create") && <Link href="/licensings/new" passHref>
                            <NavDropdown.Item ><FaPlus size={14} /> Novo</NavDropdown.Item>
                        </Link>
                    }

                    {
                        can(user, "licensings", "update") && <>
                            <Link href="/licensings/authorizations" passHref>
                                <NavDropdown.Item ><FaAward size={14} /> Licen??as</NavDropdown.Item>
                            </Link>

                            <NavDropdown.Divider />

                            <Link href="/licensings/agencies" passHref>
                                <NavDropdown.Item ><FaBalanceScaleLeft size={14} /> ??rg??os</NavDropdown.Item>
                            </Link>

                            <Link href="/licensings/status" passHref>
                                <NavDropdown.Item ><FaClipboardList size={14} /> Fases</NavDropdown.Item>
                            </Link>

                            <Link href="/licensings/infringements" passHref>
                                <NavDropdown.Item ><FaFileExcel size={14} /> Infra????es</NavDropdown.Item>
                            </Link>
                        </>
                    }
                </NavDropdown>
            }

            {
                can(user, "banks", "view") && <NavDropdown title="Bancos" id="banks-dropdown">
                    <Link href="/banks" passHref>
                        <NavDropdown.Item ><FaList size={14} /> Lista</NavDropdown.Item>
                    </Link>

                    {
                        can(user, "banks", "create") && <Link href="/banks/new" passHref>
                            <NavDropdown.Item ><FaPlus size={14} /> Novo</NavDropdown.Item>
                        </Link>
                    }

                    <NavDropdown.Divider />

                    {
                        can(user, "institutions", "view") && <Link href="/institutions" passHref>
                            <NavDropdown.Item ><FaCity size={14} /> Institui????es</NavDropdown.Item>
                        </Link>
                    }
                </NavDropdown>
            }

            <NavDropdown title="Relat??rios" id="reports-dropdown">
                {
                    can(user, "banks", "view") && <Link href="/reports/banks" passHref>
                        <NavDropdown.Item ><FaUniversity size={14} /> Bancos</NavDropdown.Item>
                    </Link>
                }

                {
                    can(user, "customers", "view") && <Link href="/reports/customers" passHref>
                        <NavDropdown.Item ><FaUserTie size={14} /> Clientes</NavDropdown.Item>
                    </Link>
                }

                {
                    can(user, "licensings", "view") && <Link href="/reports/licensings" passHref>
                        <NavDropdown.Item ><FaFileContract /> Licen??as</NavDropdown.Item>
                    </Link>
                }

                {
                    can(user, "projects", "view") && <Link href="/reports/projects" passHref>
                        <NavDropdown.Item ><FaFileAlt size={14} /> Projetos</NavDropdown.Item>
                    </Link>
                }

                {
                    can(user, "properties", "view") && <Link href="/reports/properties" passHref>
                        <NavDropdown.Item ><FaMapSigns size={14} /> Im??veis</NavDropdown.Item>
                    </Link>
                }
            </NavDropdown>

            {
                can(user, "users", "view") && <NavDropdown title="Usu??rios" id="users-dropdown">
                    {
                        can(user, "users", "create") && <Link href="/users" passHref>
                            <NavDropdown.Item ><FaList size={14} /> Lista</NavDropdown.Item>
                        </Link>
                    }

                    <NavDropdown.Divider />

                    {
                        can(user, "users", "view") && <Link href="/users/new" passHref>
                            <NavDropdown.Item ><FaPlus size={14} /> Novo</NavDropdown.Item>
                        </Link>
                    }
                </NavDropdown>
            }
        </Nav> : <></>
    )
}

export default Sidebar;