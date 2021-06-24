import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { Customer } from '../../components/Customers';
import CustomerItem from '../../components/CustomerListItem';
import { SideBarContext } from '../../contexts/SideBarContext';
import { PageWaiting } from '../../components/PageWaiting';


export default function Customers() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [customers, setCustomers] = useState<Customer[]>([]);

    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('customers-index');

        if (user) {
            if (can(user, "customers", "read:any")) {
                api.get('customers').then(res => {
                    setCustomers(res.data);

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get customers, ', err);
                });
            }
        }
    }, [user]);

    return (
        !user || loading ? <PageWaiting status="waiting" /> :
            <Container>
                <Row>
                    {
                        loadingData ? <PageWaiting status="waiting" /> :
                            <>
                                {
                                    can(user, "customers", "read:any") ? <>
                                        {
                                            !!customers.length ? customers.map((customer, index) => {
                                                return <CustomerItem key={index} customer={customer} />
                                            }) :
                                                <PageWaiting status="empty" message="Você ainda não tem nenhum cliente registrado." />
                                        }
                                    </> :
                                        <PageWaiting status="warning" message="Acesso negado!" />
                                }
                            </>
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