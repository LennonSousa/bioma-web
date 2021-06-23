import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';
import { AccessControl } from 'accesscontrol';

import { Customer } from '../../components/Customers';
import CustomerItem from '../../components/CustomerListItem';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { PageWaiting } from '../../components/PageWaiting';

const ac = new AccessControl();

export default function Customers() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        if (user) {
            ac.setGrants(user.grants);

            if (ac.can(user.id).readAny('customers').granted) {
                handleItemSideBar('customers');
                handleSelectedMenu('customers-index');

                api.get('customers').then(res => {
                    setCustomers(res.data);
                }).catch(err => {
                    console.log('Error to get customers, ', err);
                });
            }
        }
    }, [user]);

    return (
        loading ? <PageWaiting status="waiting" /> :
            <Container>
                <Row>
                    {
                        user && ac.hasRole(user.id) && ac.can(user.id).readAny('customers').granted ? customers.map((customer, index) => {
                            return <CustomerItem key={index} customer={customer} />
                        }) :
                            <PageWaiting status="warning" message="Acesso negado!" />
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