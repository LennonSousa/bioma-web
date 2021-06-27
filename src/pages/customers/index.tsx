import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { PageWaiting, PageType } from '../../components/PageWaiting';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { Customer } from '../../components/Customers';
import CustomerItem from '../../components/CustomerListItem';
import { SideBarContext } from '../../contexts/SideBarContext';

export default function Customers() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [customers, setCustomers] = useState<Customer[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

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

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setLoadingData(false);
                });
            }
        }
    }, [user]);

    return (
        !user || loading ? <PageWaiting status="waiting" /> :
            <>
                {
                    can(user, "customers", "read:any") ? <>
                        <Container>
                            <Row>
                                {
                                    loadingData ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !!customers.length ? customers.map((customer, index) => {
                                                    return <CustomerItem key={index} customer={customer} />
                                                }) :
                                                    <PageWaiting status="empty" message="Você ainda não tem nenhum cliente registrado." />
                                            }
                                        </>
                                }
                            </Row>
                        </Container>
                    </> :
                        <PageWaiting status="warning" message="Acesso negado!" />
                }
            </>
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