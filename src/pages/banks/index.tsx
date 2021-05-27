import { useContext, useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';

import { Bank } from '../../components/Banks';
import BankListItem from '../../components/BankListItem';

import api from '../../api/api';
import { SideBarContext } from '../../context/SideBarContext';

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