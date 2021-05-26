import { useContext, useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';

import { SideBarContext } from '../../context/SideBarContext';
import { Licensing } from '../../components/Licensings';
import LicensingListItem from '../../components/LicensingListItem';

import api from '../../services/api';

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