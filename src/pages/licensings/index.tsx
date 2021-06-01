import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import { SideBarContext } from '../../context/SideBarContext';
import { Licensing } from '../../components/Licensings';
import LicensingListItem from '../../components/LicensingListItem';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';

export default function Licensings() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const [licensings, setLicensings] = useState<Licensing[]>([]);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-index');

        api.get('licensings').then(res => {
            setLicensings(res.data);
        }).catch(err => {
            console.log('Error to get licensings, ', err);
        })
    }, []);

    return (
        <Container>
            <Row>
                {
                    licensings.map((licensing, index) => {
                        return <LicensingListItem key={index} licensing={licensing} />
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