import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';
import { AccessControl } from 'accesscontrol';

import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { Project } from '../../components/Projects';
import ProjectListItem from '../../components/ProjectListItem';
import { PageWaiting } from '../../components/PageWaiting';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';

const ac = new AccessControl();

export default function Projects() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [projects, setProjects] = useState<Project[]>([]);

    const [accessVerified, setAccessVerified] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (user) {
            ac.setGrants(user.grants);

            if (ac.hasRole(user.id)) {
                if (ac.can(user.id).readAny('projects').granted) {
                    handleItemSideBar('projects');
                    handleSelectedMenu('projects-index');

                    api.get('projects').then(res => {
                        setProjects(res.data);

                        setLoadingData(false);
                    }).catch(err => {
                        console.log('Error to get projects, ', err);
                    });
                }
            }

            setAccessVerified(true);
        }
    }, [user]);

    return (
        !user || loading || !accessVerified ? <PageWaiting status="waiting" /> :
            <Container>
                <Row>
                    {
                        loadingData ? <PageWaiting status="waiting" /> :
                            <>
                                {
                                    ac.hasRole(user.id) && ac.can(user.id).readAny('projects').granted ? <>
                                        {
                                            !!projects.length ? projects.map((project, index) => {
                                                return <ProjectListItem key={index} project={project} />
                                            }) :
                                                <PageWaiting status="empty" message="Você ainda não tem nenhum projeto registrado." />
                                        }
                                    </> :
                                        <PageWaiting status="warning" message="Acesso negado!" />
                                }
                            </>
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