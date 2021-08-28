import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { AuthContext } from '../../contexts/AuthContext';
import { SideBarContext } from '../../contexts/SideBarContext';
import { can } from '../../components/Users';
import { Customer } from '../../components/Customers';
import CustomerItem from '../../components/CustomerListItem';
import { PageWaiting, PageType } from '../../components/PageWaiting';
import { Paginations } from '../../components/Interfaces/Pagination';
import SearchCustomers from '../../components/Interfaces/SearchCustomers';

import { Member } from '../../components/CustomerMembers';

const limit = 15;

export default function Customers() {
    const router = useRouter();
    const userId = router.query['user'];

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [activePage, setActivePage] = useState(1);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    const [showSearchModal, setShowSearchModal] = useState(false);

    const handleCloseSearchModal = () => setShowSearchModal(false);
    const handleShowSearchModal = () => setShowSearchModal(true);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('customers-index');

        if (user) {
            if (can(user, "customers", "read:any")) {
                let requestUrl = `customers?limit=${limit}&page=${activePage}`;

                if (userId) requestUrl = `members/customers/user/${userId}?limit=${limit}&page=${activePage}`;

                api.get(requestUrl).then(res => {
                    if (userId) {
                        const members: Member[] = res.data;

                        let list: Customer[] = [];

                        members.forEach(member => {
                            if (member.customer) list.push(member.customer);
                        });

                        setCustomers(list);
                    }
                    else
                        setCustomers(res.data);

                    try {
                        setTotalPages(Number(res.headers['x-total-pages']));
                    }
                    catch { }

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get customers, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });
            }
        }
    }, [user, userId]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleActivePage(page: number) {
        setLoadingData(true);
        setActivePage(page);

        try {
            let requestUrl = `customers?limit=${limit}&page=${page}`;

            if (userId) requestUrl = `members/customers/user/${userId}?limit=${limit}&page=${activePage}`;

            const res = await api.get(requestUrl);

            if (userId) {
                const members: Member[] = res.data;

                let list: Customer[] = [];

                members.forEach(member => {
                    if (member.customer) list.push(member.customer);
                });

                setCustomers(list);
            }
            else
                setCustomers(res.data);

            setTotalPages(Number(res.headers['x-total-pages']));
        }
        catch (err) {
            setTypeLoadingMessage("error");
            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
        }

        setLoadingData(false);
    }

    function handleCustomer(customer: Customer) {
        handleRoute(`/customers/details/${customer.id}`);
    }

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <>
            <NextSeo
                title="Lista de clientes"
                description="Lista de clientes da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Lista de clientes',
                    description: 'Lista de clientes da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Lista de clientes | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            can(user, "customers", "read:any") ? <>
                                <Container className="page-container">
                                    <Row>
                                        {
                                            loadingData ? <PageWaiting
                                                status={typeLoadingMessage}
                                                message={textLoadingMessage}
                                            /> :
                                                <Col>
                                                    {
                                                        !!customers.length && <Row className="mt-3">
                                                            <Col className="col-row">
                                                                <Button
                                                                    variant="success"
                                                                    title="Procurar um cliente."
                                                                    onClick={handleShowSearchModal}
                                                                >
                                                                    <FaSearch />
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    }
                                                    <Row>
                                                        {
                                                            !!customers.length ? customers.map((customer, index) => {
                                                                return <CustomerItem key={index} customer={customer} />
                                                            }) :
                                                                <PageWaiting status="empty" message="Nenhum cliente registrado." />
                                                        }
                                                    </Row>
                                                </Col>
                                        }
                                    </Row>

                                    <Row className="row-grow align-items-end">
                                        <Col>
                                            {
                                                !!customers.length && <Row className="justify-content-center align-items-center">
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

                                    <SearchCustomers
                                        show={showSearchModal}
                                        handleCustomer={handleCustomer}
                                        handleCloseSearchModal={handleCloseSearchModal}
                                    />
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