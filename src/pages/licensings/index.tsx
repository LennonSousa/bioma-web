import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Col, Container, Row } from 'react-bootstrap';

import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { Licensing } from '../../components/Licensings';
import LicensingListItem from '../../components/LicensingListItem';
import { PageWaiting, PageType } from '../../components/PageWaiting';
import { Paginations } from '../../components/interfaces/Pagination';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';

const limit = 15;

export default function Licensings() {
    const router = useRouter();
    const { customer, property } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [licensings, setLicensings] = useState<Licensing[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [activePage, setActivePage] = useState(1);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-index');

        if (user) {
            if (can(user, "licensings", "read:any")) {
                let query = '';

                if (customer) query = `&customer=${customer}`;

                if (property) query = `&property=${property}`;

                api.get(`licensings?limit=${limit}&page=${activePage}${!!query ? query : ''}`).then(res => {
                    setLicensings(res.data);

                    try {
                        setTotalPages(Number(res.headers['x-total-pages']));
                    }
                    catch { }

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get licensings, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });
            }
        }
    }, [user, customer, property]);

    async function handleActivePage(page: number) {
        setLoadingData(true);
        setActivePage(page);

        try {
            let query = '';

            if (customer) query = `&customer=${customer}`;

            if (property) query = `&property=${property}`;

            const res = await api.get(`licensings?limit=${limit}&page=${activePage}${!!query ? query : ''}`);

            setLicensings(res.data);

            setTotalPages(Number(res.headers['x-total-pages']));
        }
        catch (err) {
            setTypeLoadingMessage("error");
            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
        }

        setLoadingData(false);
    }

    return (
        !user || loading ? <PageWaiting status="waiting" /> :
            <>
                {
                    can(user, "licensings", "read:any") ? <>
                        <Container className="page-container">
                            <Row>
                                {
                                    loadingData ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !!licensings.length ? licensings.map((licensing, index) => {
                                                    return <LicensingListItem key={index} licensing={licensing} />
                                                }) :
                                                    <PageWaiting status="empty" message="Nenhum licenciamento registrado." />
                                            }
                                        </>
                                }
                            </Row>

                            <Row className="row-grow align-items-end">
                                <Col>
                                    {
                                        !!licensings.length && <Row className="justify-content-center align-items-center">
                                            <Col className="col-row">
                                                <Paginations
                                                    pages={totalPages}
                                                    active={activePage}
                                                    handleActivePage={handleActivePage}
                                                />
                                            </Col>
                                        </Row>
                                    }
                                </Col>
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