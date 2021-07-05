import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { Project } from '../../../components/Projects';
import { Bank } from '../../../components/Banks';
import ReportsItem from '../../../components/Reports';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    item: Yup.string().required('Obrigatório!'),
    sub_item: Yup.string().required('Obrigatório!'),
});

export default function Reports() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [isFirstView, setIsFirstView] = useState(true);
    const [showResultMessage, setShowResultMessage] = useState(false);

    const [banks, setBanks] = useState<Bank[]>([]);

    const tableHeader = [
        "Cliente",
        "CPF/CNPJ",
        "Gerente",
        "Valor",
        "Criação",
        "Fase",
        "Atualização",
    ]

    const [tableData, setTableData] = useState([]);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    useEffect(() => {
        handleItemSideBar('reports');
        handleSelectedMenu('reports-banks');

        api.get('/banks').then(res => {
            setBanks(res.data);
        }).catch(err => {
            console.log('Error to get banks on reports, ', err);
        });
    }, []);

    return <Container className="content-page">
        <Row className="mb-3">
            <Col>
                <Row>
                    <Col>
                        <h6 className="text-success">Selecione os itens para gerar o relatório.</h6>
                    </Col>
                </Row>
            </Col>
        </Row>

        <Row className="mb-3">
            <Col>
                <Formik
                    initialValues={
                        {
                            item: '',
                            sub_item: '',
                        }
                    }
                    onSubmit={async values => {
                        setShowResultMessage(false);
                        setIsFirstView(false);
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        try {
                            const res = await api.get(`reports/banks?institution=${values.sub_item}`);

                            const projects: Project[] = res.data;

                            const dataRes = projects.map(project => {
                                return {
                                    link: `/projects/details/${project.id}`,
                                    item: [
                                        project.customer.name,
                                        project.customer.document,
                                        project.bank.sector,
                                        `R$ ${Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(project.value)}`,
                                        format(new Date(project.created_at), 'dd/MM/yyyy'),
                                        project.status.name,
                                        format(new Date(project.updated_at), 'dd/MM/yyyy'),
                                    ]
                                }
                            });

                            if (dataRes.length < 1) setShowResultMessage(true);

                            setTableData(dataRes);

                            setMessageShow(false);
                        }
                        catch (err) {
                            setTypeMessage("error");

                            setTimeout(() => {
                                setMessageShow(false);
                            }, 4000);

                            console.log('error create institution.');
                            console.log(err);
                        }

                    }}
                    validationSchema={validationSchema}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3 align-items-end">
                                <Form.Group as={Col} sm={4} controlId="formGridType">
                                    <Form.Label>Filtro</Form.Label>
                                    <Form.Control
                                        as="select"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.item}
                                        name="item"
                                        isInvalid={!!errors.item && touched.item}
                                    >
                                        <option hidden>...</option>
                                        <option value='warnings'>Projetos</option>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{touched.item && errors.item}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col} sm={6} controlId="formGridLine">
                                    {
                                        !!values.item && <>
                                            <Form.Label>Projetos por instituição</Form.Label>
                                            <Form.Control
                                                as="select"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.sub_item}
                                                name="sub_item"
                                                isInvalid={!!errors.sub_item && touched.sub_item}
                                            >
                                                <option hidden>...</option>
                                                {
                                                    banks.map((bank, index) => {
                                                        return <option key={index} value={bank.institution.id}>{bank.institution.name}</option>
                                                    })
                                                }
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">{touched.sub_item && errors.sub_item}</Form.Control.Feedback>
                                        </>
                                    }
                                </Form.Group>

                                <Form.Group as={Col} sm={2} controlId="formGridButton">
                                    {
                                        messageShow ? <AlertMessage status={typeMessage} /> :
                                            <Button variant="outline-success" type="submit">Consultar</Button>
                                    }
                                </Form.Group>
                            </Row>
                        </Form>
                    )}
                </Formik>
            </Col>
        </Row>

        <Row className="mb-3">
            <Col>
                {
                    isFirstView ? <AlertMessage status="success" message="Configure os items acima para fazer a pesquisa." /> :
                        showResultMessage ? <AlertMessage status="warning" message="A pesquisa não retornou nenhum resultado." /> :
                            <ReportsItem header={tableHeader} data={tableData} />

                }
            </Col>
        </Row>
    </Container>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { token } = context.req.cookies;

    const tokenVerified = await TokenVerify(token);

    if (tokenVerified === "not-authorized") { // Not authenticated, token invalid!
        return {
            redirect: {
                destination: `/?returnto=${context.req.url}`,
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