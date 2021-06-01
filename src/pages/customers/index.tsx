import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import { Customer } from '../../components/Customers';
import CustomerItem from '../../components/CustomerListItem';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
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

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { token } = context.req.cookies;

    const tokenVerified = await TokenVerify(token);

    if (tokenVerified === "not-authorized") { // Not authenticated, token invalid!
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    if (tokenVerified === "error") { // Server error!
        return {
            redirect: {
                destination: '/500',
                permanent: false,
            },
        }
    }

    return {
        props: {},
    }
}