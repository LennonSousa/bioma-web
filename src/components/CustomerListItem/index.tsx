import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaMapSigns, FaPencilAlt, FaFileContract, FaExclamationCircle } from 'react-icons/fa'

import { Customer } from '../Customers';

import styles from './styles.module.css';

interface CustomerItemProps {
    customer: Customer;
}

const CustomerItem: React.FC<CustomerItemProps> = ({ customer }) => {
    const router = useRouter();

    function goToEdit() {
        router.push(`/customers/edit/${customer.id}`);
    }

    return (
        <Col sm={4}>
            <div className={styles.itemContainer}>
                <Row className="align-items-center">
                    <Col sm={10}>
                        <Link href={`/customers/details/${customer.id}`}>
                            <a>
                                <h5 className={styles.itemText}>{customer.name}</h5>
                            </a>
                        </Link>
                    </Col>
                    <Col className="text-warning" sm={1}>{customer.warnings && <FaExclamationCircle />}</Col>
                </Row>

                <Row>
                    <Col>
                        <span
                            className={`form-control-plaintext text-secondary ${styles.itemText}`}
                        >
                            {!!customer.document ? customer.document : <br />}
                        </span>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <span
                            className={`form-control-plaintext text-secondary ${styles.itemText}`}
                        >
                            {!!customer.address ? customer.address : <br />}
                        </span>
                    </Col>
                </Row>

                <Row>
                    <ButtonGroup size="sm" className="col-12">
                        <Button variant="success"><FaFileAlt /></Button>
                        <Button variant="success"><FaMapSigns /></Button>
                        <Button variant="success"><FaFileContract /></Button>
                        <Button variant="success" onClick={goToEdit} ><FaPencilAlt /></Button>
                    </ButtonGroup>
                </Row>
            </div>
        </Col >
    )
}

export default CustomerItem;