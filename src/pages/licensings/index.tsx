import { useContext, useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';

import { SideBarContext } from '../../context/SideBarContext';
import { Project } from '../../components/Projects';
import ProjectListItem from '../../components/ProjectListItem';

import api from '../../services/api';

export default function Customers() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-index');

        api.get('licensings').then(res => {
            setProjects(res.data);
        }).catch(err => {
            console.log('Error to get licensings, ', err);
        })
    }, []);

    return (
        <Container>
            <Row>
                {
                    projects.map((project, index) => {
                        return <ProjectListItem key={index} project={project} />
                    })
                }
            </Row>
        </Container>
    )
}