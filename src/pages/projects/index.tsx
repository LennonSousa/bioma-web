import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import { SideBarContext } from '../../contexts/SideBarContext';
import { Project } from '../../components/Projects';
import ProjectListItem from '../../components/ProjectListItem';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';

export default function Projects() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        handleItemSideBar('projects');
        handleSelectedMenu('projects-index');

        api.get('projects').then(res => {
            setProjects(res.data);
        }).catch(err => {
            console.log('Error to get projects, ', err);
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