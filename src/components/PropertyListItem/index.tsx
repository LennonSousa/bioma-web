import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaPencilAlt, FaFileContract, FaExclamationCircle } from 'react-icons/fa'

import { Property } from '../Properties';

import styles from './styles.module.css';

interface PropertyListItemProps {
    property: Property;
    showCustomer?: boolean;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({ property, showCustomer = true }) => {
    const router = useRouter();

    function goToEdit() {
        router.push(`/properties/edit/${property.id}`);
    }

    return (
        <Col sm={4}>
            <div className={styles.itemContainer}>
                <Row className="align-items-center">
                    <Col sm={10}>
                        <Link href={`/properties/details/${property.id}`}>
                            <a>
                                <h5 className={styles.itemText}>{property.name}</h5>
                            </a>
                        </Link>
                    </Col>
                    <Col className="text-warning" sm={1}>{property.warnings && <FaExclamationCircle />}</Col>
                </Row>

                {
                    showCustomer && <Row>
                        <Col>
                            <span className={`form-control-plaintext text-secondary ${styles.itemText}`} >
                                {property.customer.name}
                            </span>
                        </Col>
                    </Row>
                }

                <Row>
                    <Col>
                        <span className={`form-control-plaintext text-secondary ${styles.itemText}`} >
                            {`${property.city} - ${property.state}`}
                        </span>
                    </Col>
                </Row>

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

export default PropertyListItem;