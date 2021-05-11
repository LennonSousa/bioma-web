import { ListGroup, Row, Col } from 'react-bootstrap';

import { Customer } from './customers';

interface CustomerItemProps {
    customer: Customer;
}

const CustomerItem: React.FC<CustomerItemProps> = ({ customer }) => {
    return (
        <ListGroup.Item>
            <Row className="align-items-center">
                <Col>{customer.name}</Col>
            </Row>
        </ListGroup.Item>
    )
}

export default CustomerItem;