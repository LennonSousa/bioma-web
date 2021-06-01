import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../context/SideBarContext';
import { AuthContext } from '../../context/authContext';
import { Bank } from '../../components/Banks';
import BankListItem from '../../components/BankListItem';
import PageWaiting from '../../components/PageWaiting';

export default function Banks() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, signed } = useContext(AuthContext);
    const [banks, setBanks] = useState<Bank[]>([]);

    useEffect(() => {
        if (signed) {
            handleItemSideBar('dashboard');
            handleSelectedMenu('dashboard');

            api.get('banks').then(res => {
                setBanks(res.data);
            }).catch(err => {
                console.log('Error to get banks, ', err);
            });
        }
    }, [signed]);

    return (
        loading ? <PageWaiting /> :
            <Container>
                <Row>
                    {
                        banks.map((bank, index) => {
                            return <BankListItem key={index} bank={bank} />
                        })
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

    return {
        props: {},
    }
}