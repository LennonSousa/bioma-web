import { useContext, useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';

import { Property } from '../../components/Properties';
import PropertyListItem from '../../components/PropertyListItem';

import api from '../../services/api';
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