import { useEffect, useState } from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';

import { Customer } from '../../components/customers';
import CustomerItem from '../../components/customer-item';

import api from '../../services/api';

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        // api.get('customers').then(res => {
        //     setCustomers(res.data);
        // }).catch(err => {
        //     console.log('Error to get customers, ', err);
        // })
    }, []);

    return (
        <>
            <Container className="content-page">
                <Row>
                    <Col>
                        <ListGroup>
                            {
                                customers.map((customer, index) => {
                                    return <CustomerItem key={index} customer={customer} />
                                })
                            }
                        </ListGroup>
                    </Col>
                </Row>
            </Container>
        </>
    )
}