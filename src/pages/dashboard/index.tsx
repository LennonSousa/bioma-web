import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Col, Container, Row } from 'react-bootstrap';
import { addDays, startOfToday, endOfToday } from 'date-fns';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { Project } from '../../components/Projects';
import { ProjectStatus } from '../../components/ProjectStatus';
import { Licensing } from '../../components/Licensings';
import { LicensingStatus } from '../../components/LicensingStatus';
import PieChart from '../../components/Graphs/PieChart';
import { PageWaiting } from '../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../components/interfaces/AlertMessage';

const startOfDay = startOfToday();
const endOfDay = endOfToday();

export default function Dashboard() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, signed, user } = useContext(AuthContext);

    const [statusList, setStatusList] = useState<String[]>([]);
    const [amountStatusProjects, setAmountStatusProjects] = useState<Number[]>([]);

    const [licensingsStatusList, setLicensingsStatusList] = useState<String[]>([]);
    const [amountStatusLicensings, setAmountStatusLicensings] = useState<Number[]>([]);

    const [loadingProjectsData, setLoadingProjectsData] = useState(true);
    const [typeProjectMessage, setTypeProjectMessage] = useState<statusModal>("waiting");
    const [textProjectMessage, setTextProjectMessage] = useState('Carregando...');

    const [loadingLicensingsData, setLoadingLicensingsData] = useState(true);
    const [typeLicensingMessage, setTypeLicensingMessage] = useState<statusModal>("waiting");
    const [textLicensingMessage, setTextLicensingMessage] = useState('Carregando...');

    useEffect(() => {
        if (signed && user) {
            handleItemSideBar('dashboard');
            handleSelectedMenu('dashboard');

            if (can(user, "projects", "read:any")) {
                handleProjectsMonth();
            }

            if (can(user, "licensings", "read:any")) {
                handleLicensingsMonth();
            }
        }
    }, [signed, user]);

    async function handleProjectsMonth() {
        try {
            const res = await api.get('projects', {
                params: {
                    start: addDays(startOfDay, -30),
                    end: endOfDay
                }
            });

            const projects: Project[] = res.data;

            let tempStatusList: String[] = [];
            let tempAmountStatusList: Number[] = [];

            const statusRes = await api.get('projects/status')
            const statusList: ProjectStatus[] = statusRes.data;

            statusList.forEach(status => {
                const projectsFound = projects.filter(project => { return status.id === project.status.id });

                if (!!projectsFound.length) {
                    tempStatusList.push(`${projectsFound[0].status.name} (${projectsFound.length})`);
                    tempAmountStatusList.push(projectsFound.length);
                }
            });

            setStatusList(tempStatusList);

            setAmountStatusProjects(tempAmountStatusList);

            setLoadingProjectsData(false);
        }
        catch (err) {
            console.log('Error to get projects, ', err);

            setTypeProjectMessage("error");
            setTextProjectMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
            setLoadingProjectsData(false);
        }
    }

    async function handleLicensingsMonth() {
        try {
            const res = await api.get('licensings', {
                params: {
                    start: addDays(startOfDay, -30),
                    end: endOfDay
                }
            });

            const licensings: Licensing[] = res.data;

            let tempStatusList: String[] = [];
            let tempAmountStatusList: Number[] = [];

            const statusRes = await api.get('licensings/status')
            const statusList: LicensingStatus[] = statusRes.data;

            statusList.forEach(status => {
                const licensingsFound = licensings.filter(licensing => { return status.id === licensing.status.id });

                if (!!licensingsFound.length) {
                    tempStatusList.push(`${licensingsFound[0].status.name} (${licensingsFound.length})`);
                    tempAmountStatusList.push(licensingsFound.length);
                }
            });

            setLicensingsStatusList(tempStatusList);

            setAmountStatusLicensings(tempAmountStatusList);

            setLoadingLicensingsData(false);
        }
        catch (err) {
            console.log('Error to get licensings, ', err);

            setTypeLicensingMessage("error");
            setTextLicensingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
        }
    }

    return (
        !user || loading ? <PageWaiting status="waiting" /> :
            <section>
                <Container className="content-page mb-4">
                    <Row className="justify-content-center align-items-center">
                        {
                            can(user, "projects", "read:any") && <Col sm={5}>
                                {
                                    loadingProjectsData ? <Row>
                                        <Col>
                                            <AlertMessage status={typeProjectMessage} message={textProjectMessage} />
                                        </Col>
                                    </Row> :
                                        <>
                                            <Row className="mb-3">
                                                <Col>
                                                    <h6 className="text-success text-center">Fases dos projetos nos últimos 30 dias</h6>
                                                </Col>
                                            </Row>
                                            <Row className="justify-content-center align-items-center mb-3">
                                                {
                                                    !!amountStatusProjects.length ? <Col>
                                                        <PieChart
                                                            labels={statusList}
                                                            label='Projetos'
                                                            data={amountStatusProjects}
                                                        />
                                                    </Col> : <Col className="text-center">
                                                        <span className="text-secondary">Nenhum projeto no período.</span>
                                                    </Col>
                                                }
                                            </Row>
                                        </>
                                }
                            </Col>
                        }

                        {
                            can(user, "licensings", "read:any") && <Col sm={5}>
                                {
                                    loadingLicensingsData ? <Row>
                                        <Col>
                                            <AlertMessage status={typeLicensingMessage} message={textLicensingMessage} />
                                        </Col>
                                    </Row> :
                                        <>
                                            <Row className="mb-3">
                                                <Col>
                                                    <h6 className="text-success text-center">Fases dos licenciamentos nos últimos 30 dias</h6>
                                                </Col>
                                            </Row>
                                            <Row className="justify-content-center align-items-center mb-3">
                                                {
                                                    !!amountStatusLicensings.length ? <Col>
                                                        <PieChart
                                                            labels={licensingsStatusList}
                                                            label='Licenciamentos'
                                                            data={amountStatusLicensings}
                                                        />
                                                    </Col> : <Col className="text-center">
                                                        <span className="text-secondary">Nenhum licenciamento no período.</span>
                                                    </Col>
                                                }
                                            </Row>
                                        </>
                                }
                            </Col>
                        }
                    </Row>
                </Container>

                <Container>
                    <Row>
                        <Col className="content-page" sm={4}>
                            <Row>

                            </Row>
                        </Col>
                    </Row>
                </Container>
            </section>
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