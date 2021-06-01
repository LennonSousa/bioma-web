import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import { Property } from '../../components/Properties';
import PropertyListItem from '../../components/PropertyListItem';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../context/SideBarContext';

export default function Customers() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('properties-index');

        api.get('properties').then(res => {
            setProperties(res.data);
        }).catch(err => {
            console.log('Error to get properties, ', err);
        })
    }, []);

    return (
        <Container>
            <Row>
                {
                    properties.map((property, index) => {
                        return <PropertyListItem key={index} property={property} />
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