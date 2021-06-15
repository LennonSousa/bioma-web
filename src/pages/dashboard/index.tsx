import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Col, Container, Row } from 'react-bootstrap';
import { addDays, startOfToday, endOfToday } from 'date-fns';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../context/SideBarContext';
import { AuthContext } from '../../context/authContext';
import { Project } from '../../components/Projects';
import { ProjectStatus } from '../../components/ProjectStatus';
import PieChart from '../../components/Graphs/PieChart';
import PageWaiting from '../../components/PageWaiting';

const startOfDay = startOfToday();
const endOfDay = endOfToday();

export default function Dashboard() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, signed } = useContext(AuthContext);
    const [statusList, setStatusList] = useState<String[]>([]);
    const [amountStatusProjects, setAmountStatusProjects] = useState<Number[]>([]);

    useEffect(() => {
        if (signed) {
            handleItemSideBar('dashboard');
            handleSelectedMenu('dashboard');

            api.get('projects', {
                params: {
                    start: addDays(startOfDay, -30),
                    end: endOfDay
                }
            }).then(res => {
                const projects: Project[] = res.data;

                let tempStatusList: String[] = [];
                let tempAmountStatusList: Number[] = [];

                api.get('projects/status').then(res => {
                    const statusRes: ProjectStatus[] = res.data;

                    statusRes.forEach(status => {
                        const projectsFound = projects.filter(project => { return status.id === project.status.id });

                        if (projectsFound.length > 0) {
                            tempStatusList.push(`${projectsFound[0].status.name} (${projectsFound.length})`);
                            tempAmountStatusList.push(projectsFound.length);
                        }
                    });

                    setStatusList(tempStatusList);

                    setAmountStatusProjects(tempAmountStatusList);
                }).catch(err => {
                    console.log('Error to get projects status, ', err);
                });
            }).catch(err => {
                console.log('Error to get projects, ', err);
            });
        }
    }, [signed]);

    return (
        loading ? <PageWaiting /> :
            <Container className="content-page">
                <Row>
                    <Col sm={6}>
                        <Row className="mb-3">
                            <Col>
                                <h6 className="text-success text-center">Fases dos projetos nos últimos 30 dias</h6>
                            </Col>
                        </Row>
                        <Row className="justify-content-center mb-3">
                            <Col sm={8}>
                                <PieChart
                                    labels={statusList}
                                    label='Projetos'
                                    data={amountStatusProjects}
                                />
                            </Col>
                        </Row>
                    </Col>

                    <Col sm={6}>

                    </Col>
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

    return {
        props: {},
    }
}