import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import { Bank } from '../../components/Banks';
import BankListItem from '../../components/BankListItem';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { PageWaiting, PageType } from '../../components/PageWaiting';

export default function Banks() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [banks, setBanks] = useState<Bank[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    useEffect(() => {
        handleItemSideBar('banks');
        handleSelectedMenu('banks-index');

        if (user) {
            if (can(user, "banks", "read:any")) {
                api.get('banks').then(res => {
                    setBanks(res.data);

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get banks, ', err);

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
                    can(user, "banks", "read:any") ? <>
                        <Container>
                            <Row>
                                {
                                    loadingData ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !!banks.length ? banks.map((bank, index) => {
                                                    return <BankListItem key={index} bank={bank} />
                                                }) :
                                                    <PageWaiting status="empty" message="Nenhum banco registrado." />
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