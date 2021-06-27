import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Container, Row } from 'react-bootstrap';

import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { Project } from '../../components/Projects';
import ProjectListItem from '../../components/ProjectListItem';
import { PageWaiting, PageType } from '../../components/PageWaiting';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';

export default function Projects() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [projects, setProjects] = useState<Project[]>([]);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        handleItemSideBar('projects');
        handleSelectedMenu('projects-index');

        if (user) {
            if (can(user, "projects", "read:any")) {
                api.get('projects').then(res => {
                    setProjects(res.data);

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get projects, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                    setLoadingData(false);
                });
            }
        }
    }, [user]);

    return (
        !user || loading ? <PageWaiting status="waiting" /> :
            <>
                {
                    can(user, "projects", "read:any") ? <>
                        <Container>
                            <Row>

                                {
                                    loadingData ? <PageWaiting
                                        status={typeLoadingMessage}
                                        message={textLoadingMessage}
                                    /> :
                                        <>
                                            {
                                                !!projects.length ? projects.map((project, index) => {
                                                    return <ProjectListItem key={index} project={project} />
                                                }) :
                                                    <PageWaiting status="empty" message="Você ainda não tem nenhum projeto registrado." />
                                            }
                                        </>

                                }
                            </Row>
                        </Container>
                    </> :
                        <PageWaiting status="warning" message="Acesso negado!" />
                }
            </>
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