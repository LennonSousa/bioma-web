import { useContext, useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';

import { Customer } from '../../components/Customers';
import CustomerItem from '../../components/CustomerListItem';

import api from '../../api/api';
import { SideBarContext } from '../../context/SideBarContext';

export default function Customers() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('customers-index');

        api.get('customers').then(res => {
            setCustomers(res.data);
        }).catch(err => {
            console.log('Error to get customers, ', err);
        })
    }, []);

    return (
        <Container>
            <Row>
                {
                    customers.map((customer, index) => {
                        return <CustomerItem key={index} customer={customer} />
                    })
                }
            </Row>
        </Container>
    )
}