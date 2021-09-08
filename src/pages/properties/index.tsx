import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Col, Container, Row } from 'react-bootstrap';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { Property } from '../../components/Properties';
import PropertyListItem from '../../components/PropertyListItem';
import { SideBarContext } from '../../contexts/SideBarContext';
import { PageWaiting, PageType } from '../../components/PageWaiting';
import { Paginations } from '../../components/Interfaces/Pagination';

import { Member } from '../../components/PropertyMembers';

const limit = 15;

export default function Properties() {
    const router = useRouter();
    const { customer } = router.query;
    const userId = router.query['user'];

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [properties, setProperties] = useState<Property[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [activePage, setActivePage] = useState(1);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('properties-index');

        if (user) {
            if (can(user, "properties", "view")) {
                let query = '';

                if (customer) query = `&customer=${customer}`;

                let requestUrl = `properties?limit=${limit}&page=${activePage}${!!query ? query : ''}`;

                if (userId) requestUrl = `members/properties/user/${userId}?limit=${limit}&page=${activePage}${!!query ? query : ''}`;

                api.get(requestUrl).then(res => {
                    if (userId) {
                        const members: Member[] = res.data;

                        let list: Property[] = [];

                        members.forEach(member => {
                            if (member.property) list.push(member.property);
                        });

                        setProperties(list);
                    }
                    else
                        setProperties(res.data);

                    try {
                        setTotalPages(Number(res.headers['x-total-pages']));
                    }
                    catch { }

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get properties, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });
            }
        }
    }, [user, customer, userId]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleActivePage(page: number) {
        setLoadingData(true);
        setActivePage(page);

        try {
            let query = '';

            if (customer) query = `&customer=${customer}`;

            let requestUrl = `properties?limit=${limit}&page=${page}${!!query ? query : ''}`;

            if (userId) requestUrl = `members/properties/user/${userId}?limit=${limit}&page=${page}${!!query ? query : ''}`;

            const res = await api.get(requestUrl);

            if (userId) {
                const members: Member[] = res.data;

                let list: Property[] = [];

                members.forEach(member => {
                    if (member.property) list.push(member.property);
                });

                setProperties(list);
            }
            else
                setProperties(res.data);

            setTotalPages(Number(res.headers['x-total-pages']));
        }
        catch (err) {
            setTypeLoadingMessage("error");
            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
        }

        setLoadingData(false);
    }

    return (
        <>
            <NextSeo
                title="Lista de imóveis"
                description="Lista de imóveis da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Lista de imóveis',
                    description: 'Lista de imóveis da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Lista de imóveis | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "properties", "view") ? <>
                                <Container className="page-container">
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
                                                            <PageWaiting status="empty" message="Nenhum imóvel registrado." />
                                                    }
                                                </>
                                        }
                                    </Row>

                                    <Row className="row-grow align-items-end">
                                        <Col>
                                            {
                                                !!properties.length && <Row className="justify-content-center align-items-center">
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
                destination: `/?returnto=${context.req.url}`,
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