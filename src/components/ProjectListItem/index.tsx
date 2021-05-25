import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaPencilAlt, FaFileContract, FaExclamationCircle } from 'react-icons/fa';
import { format } from 'date-fns';

import { Project } from '../Projects';

import styles from './styles.module.css';

interface ProjectListItemProps {
    project: Project;
    showBank?: boolean;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, showBank = true }) => {
    const router = useRouter();

    function goToEdit() {
        router.push(`/projects/edit/${project.id}`);
    }

    return (
        <Col sm={4}>
            <div className={styles.itemContainer}>
                <Row className="align-items-center">
                    <Col sm={10}>
                        <Link href={`/projects/details/${project.id}`}>
                            <a>
                                <h5 className={styles.itemText}>{project.customer.name}</h5>
                            </a>
                        </Link>
                    </Col>
                    <Col className="text-warning" sm={1}>{project.warnings && <FaExclamationCircle />}</Col>
                </Row>

                <Row>
                    <Col>
                        <span className={`form-control-plaintext text-secondary ${styles.itemText}`} >
                            {project.status.name}
                        </span>
                    </Col>
                </Row>

                {
                    showBank && <Row>
                        <Col>
                            <span className={`form-control-plaintext text-secondary ${styles.itemText}`} >
                                {`${project.bank.institution.name} - ${project.bank.sector}, ${format(new Date(project.updated_at), 'dd/MM/yyyy')}`}
                            </span>
                        </Col>
                    </Row>
                }

                <Row>
                    <ButtonGroup size="sm" className="col-12">
                        <Button variant="success"><FaFileAlt /></Button>
                        <Button variant="success"><FaFileContract /></Button>
                        <Button variant="success" onClick={goToEdit} ><FaPencilAlt /></Button>
                    </ButtonGroup>
                </Row>
            </div>
        </Col >
    )
}

export default ProjectListItem;