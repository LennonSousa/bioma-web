import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { Licensing } from '../../components/Licensings';
import LicensingListItem from '../../components/LicensingListItem';
import { PageWaiting } from '../../components/PageWaiting';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';

export default function Licensings() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [licensings, setLicensings] = useState<Licensing[]>([]);

    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-index');

        if (user) {
            if (can(user, "licensings", "read:any")) {
                api.get('licensings').then(res => {
                    setLicensings(res.data);

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get licensings, ', err);
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
                                    can(user, "licensings", "read:any") ? <>
                                        {
                                            !!licensings.length ? licensings.map((licensing, index) => {
                                                return <LicensingListItem key={index} licensing={licensing} />
                                            }) :
                                                <PageWaiting status="empty" message="Você ainda não tem nenhum licenciamento registrado." />
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