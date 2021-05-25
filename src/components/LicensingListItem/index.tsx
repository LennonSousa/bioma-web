import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { FaPencilAlt, FaExclamationCircle } from 'react-icons/fa'

import { Licensing } from '../Licensings';

import styles from './styles.module.css';

interface LicensingListItemProps {
    licensing: Licensing;
}

const PropertyListItem: React.FC<LicensingListItemProps> = ({ licensing }) => {
    const router = useRouter();

    function goToEdit() {
        router.push(`/licensings/edit/${licensing.id}`);
    }

    return (
        <Col sm={4}>
            <div className={styles.itemContainer}>
                <Row className="align-items-center">
                    <Col sm={10}>
                        <Link href={`/licensings/details/${licensing.id}`}>
                            <a>
                                <h5 className={styles.itemText}>{licensing.customer.name}</h5>
                            </a>
                        </Link>
                    </Col>
                    <Col className="text-warning" sm={1}>{licensing.property && <FaExclamationCircle />}</Col>
                </Row>

                <Row>
                    <Col>
                        <span className={`form-control-plaintext text-secondary ${styles.itemText}`} >
                            {licensing.property.name}
                        </span>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <span className={`form-control-plaintext text-secondary ${styles.itemText}`} >
                            {`${licensing.authorization} - ${licensing.status.name}`}
                        </span>
                    </Col>
                </Row>

                <Row>
                    <ButtonGroup size="sm" className="col-12">
                        <Button variant="success" onClick={goToEdit} ><FaPencilAlt /> Editar</Button>
                    </ButtonGroup>
                </Row>
            </div>
        </Col >
    )
}

export default PropertyListItem;