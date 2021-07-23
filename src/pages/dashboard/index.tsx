import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import { Col, Container, Row } from 'react-bootstrap';
import { addDays, startOfToday, endOfToday } from 'date-fns';
import { FaFileAlt } from 'react-icons/fa';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../contexts/SideBarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { can } from '../../components/Users';
import { Customer } from '../../components/Customers';
import { Project } from '../../components/Projects';
import { Property } from '../../components/Properties';
import { ProjectStatus } from '../../components/ProjectStatus';
import { Licensing } from '../../components/Licensings';
import { LicensingStatus } from '../../components/LicensingStatus';
import PieChart from '../../components/Graphs/PieChart';
import { PageWaiting } from '../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../components/Interface/AlertMessage';

import styles from './styles.module.css';

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

    const [amountCustomerWarnings, setAmountCustomerWarnings] = useState(0);
    const [amountPropertyWarnings, setAmountPropertyWarnings] = useState(0);
    const [amountProjectWarnings, setAmountProjectWarnings] = useState(0);

    useEffect(() => {
        if (signed && user) {
            handleItemSideBar('dashboard');
            handleSelectedMenu('dashboard');

            if (can(user, "customers", "read:any")) {
                handleCustomersWarnings();
            }

            if (can(user, "projects", "read:any")) {
                handleProjectsMonth();

                handleProjectsWarnings();
            }

            if (can(user, "properties", "read:any")) {
                handlePropertiesWarnings();
            }

            if (can(user, "licensings", "read:any")) {
                handleLicensingsMonth();
            }
        }
    }, [signed, user]);

    async function handleCustomersWarnings() {
        try {
            const res = await api.get('reports/customers?warnings=true');

            const customers: Customer[] = res.data;

            const warnings = customers.filter(customer => { return customer.warnings });

            setAmountCustomerWarnings(warnings.length);
        }
        catch (err) {
            console.log('Error to get customers warnings, ', err);
        }
    }

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

            const warnings = projects.filter(project => { return project.warnings });

            setAmountProjectWarnings(warnings.length);

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

    async function handleProjectsWarnings() {
        try {
            const res = await api.get('reports/projects?warnings=true');

            const projects: Project[] = res.data;

            const warnings = projects.filter(project => { return project.warnings });

            setAmountProjectWarnings(warnings.length);
        }
        catch (err) {
            console.log('Error to get projects warnings, ', err);
        }
    }

    async function handlePropertiesWarnings() {
        try {
            const res = await api.get('reports/properties?warnings=true');

            const properties: Property[] = res.data;

            const warnings = properties.filter(property => { return property.warnings });

            setAmountPropertyWarnings(warnings.length);
        }
        catch (err) {
            console.log('Error to get properties warnings, ', err);
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
        <>
            <NextSeo
                title="Início"
                description="Início da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Início',
                    description: 'Início da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Início | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
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
                            <Row className={styles.rowWarnings}>
                                {
                                    can(user, "customers", "read:any") && <Col className="content-page" sm={3}>
                                        <Row>
                                            <Col sm={9}>
                                                <Row>
                                                    <Col>
                                                        <h3 className={styles.customersText}>{amountCustomerWarnings}</h3>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col>
                                                        <span>{amountCustomerWarnings === 1 ?
                                                            'cliente com pendência' : 'clientes com pendências'}</span>
                                                    </Col>
                                                </Row>
                                            </Col>

                                            <Col className={styles.containerWarnings}>
                                                <div className={`${styles.containerIconAmount} ${styles.customersBackground}`}>
                                                    <FaFileAlt />
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                }

                                {
                                    can(user, "projects", "read:any") && <Col className="content-page" sm={3}>
                                        <Row>
                                            <Col sm={9}>
                                                <Row>
                                                    <Col>
                                                        <h3 className={styles.projectsText}>{amountProjectWarnings}</h3>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col>
                                                        <span>{amountProjectWarnings === 1 ?
                                                            'projeto com pendência' : 'projetos com pendências'}</span>
                                                    </Col>
                                                </Row>
                                            </Col>

                                            <Col className={styles.containerWarnings}>
                                                <div className={`${styles.containerIconAmount} ${styles.projectsBackground}`}>
                                                    <FaFileAlt />
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                }

                                {
                                    can(user, "properties", "read:any") && <Col className="content-page" sm={3}>
                                        <Row>
                                            <Col sm={9}>
                                                <Row>
                                                    <Col>
                                                        <h3 className={styles.propertiesText}>{amountPropertyWarnings}</h3>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col>
                                                        <span>{amountPropertyWarnings === 1 ?
                                                            'imóvel com pendência' : 'imóveis com pendências'}</span>
                                                    </Col>
                                                </Row>
                                            </Col>

                                            <Col className={styles.containerWarnings}>
                                                <div className={`${styles.containerIconAmount} ${styles.propertiesBackground}`}>
                                                    <FaFileAlt />
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                }
                            </Row>
                        </Container>
                    </section>
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

    return {
        props: {},
    }
}