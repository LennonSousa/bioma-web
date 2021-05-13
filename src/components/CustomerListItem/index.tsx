import Link from 'next/link';
import { ListGroup, Row, Col } from 'react-bootstrap';

import { Customer } from '../Customers';

interface CustomerItemProps {
    customer: Customer;
}

const CustomerItem: React.FC<CustomerItemProps> = ({ customer }) => {
    return (
        <ListGroup.Item action>
            <Link href={`/customers/details/${customer.id}`}>
                <Row className="align-items-center">
                    <Col>{customer.name}</Col>
                </Row>
            </Link>
        </ListGroup.Item>
    )
}

export default CustomerItem;