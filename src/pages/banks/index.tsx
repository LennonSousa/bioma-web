import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import { Bank } from '../../components/Banks';
import BankListItem from '../../components/BankListItem';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../contexts/SideBarContext';

export default function Banks() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const [banks, setBanks] = useState<Bank[]>([]);

    useEffect(() => {
        handleItemSideBar('banks');
        handleSelectedMenu('banks-index');

        api.get('banks').then(res => {
            setBanks(res.data);
        }).catch(err => {
            console.log('Error to get banks, ', err);
        })
    }, []);

    return (
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