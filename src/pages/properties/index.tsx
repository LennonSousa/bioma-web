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
import { PageWaiting, PageType } from '../../components/PageWaiting';

export default function Customers() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [properties, setProperties] = useState<Property[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

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
                    can(user, "properties", "read:any") ? <>
                        <Container>
                            <Row>
                                {
                                    loadingData ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !!properties.length ? properties.map((property, index) => {
                                                    return <PropertyListItem key={index} property={property} />
                                                }) :
                                                    <PageWaiting status="empty" message="Você ainda não tem nenhum imóvel registrado." />
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