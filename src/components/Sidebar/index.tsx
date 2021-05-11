import { Accordion, Card, ListGroup, Row, Col } from 'react-bootstrap';
import { FaUserTie, FaFileAlt } from 'react-icons/fa';

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
                            <FaUserTie />
                        </div>
                        <div>
                            <span>Clientes</span>
                        </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>Hello! I'm the body</Card.Body>
                    </Accordion.Collapse>
                </Card>

                <Card className={styles.menuCard}>
                    <Accordion.Toggle as={Card.Header} className={styles.menuCardHeader} eventKey="1">
                        <div>
                            <FaFileAlt />
                        </div>
                        <div>
                            <span>Projetos</span>
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