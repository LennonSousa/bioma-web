import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { Property } from '../../components/Properties';
import PropertyListItem from '../../components/PropertyListItem';
import { SideBarContext } from '../../contexts/SideBarContext';
import { PageWaiting } from '../../components/PageWaiting';

export default function Customers() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [properties, setProperties] = useState<Property[]>([]);

    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('properties-index');

        if (user) {
            if (can(user, "properties", "read:any")) {
                api.get('properties').then(res => {
                    setProperties(res.data);

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get properties, ', err);
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
                                    can(user, "properties", "read:any") ? <>
                                        {
                                            !!properties.length ? properties.map((property, index) => {
                                                return <PropertyListItem key={index} property={property} />
                                            }) :
                                                <PageWaiting status="empty" message="Você ainda não tem nenhum imóvel registrado." />
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