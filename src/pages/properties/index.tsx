import { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';

import { Property } from '../../components/Properties';
import PropertyListItem from '../../components/PropertyListItem';

import api from '../../services/api';

export default function Customers() {
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
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