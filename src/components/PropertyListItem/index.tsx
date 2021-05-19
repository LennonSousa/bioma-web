import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaPencilAlt, FaFileContract } from 'react-icons/fa'

import { Property } from '../Properties';

import styles from './styles.module.css';

interface PropertyListItemProps {
    property: Property;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({ property }) => {
    const router = useRouter();

    function goToEdit() {
        router.push(`/customers/edit/${property.id}`);
    }

    return (
        <Col sm={4}>
            <div className={styles.itemContainer}>
                <Row className="align-items-center">
                    <Col sm={11}>
                        <Link href={`/customers/details/${property.id}`}>
                            <a>
                                <h4 className={`form-control-plaintext text-success ${styles.itemText}`}>{property.name}</h4>
                            </a>
                        </Link>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <span className={`form-control-plaintext text-secondary ${styles.itemText}`} >
                            {property.customer.name}
                        </span>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <span className={`form-control-plaintext text-secondary ${styles.itemText}`} >
                            {`${property.city} - ${property.state}`}
                        </span>
                    </Col>
                </Row>

                <Row>
                    <ButtonGroup size="sm">
                        <Button variant="success"><FaFileAlt /></Button>
                        <Button variant="success"><FaFileContract /></Button>
                        <Button variant="success" onClick={goToEdit} ><FaPencilAlt /></Button>
                    </ButtonGroup>
                </Row>
            </div>
        </Col >
    )
}

export default PropertyListItem;