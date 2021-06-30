import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { Licensing } from '../../../components/Licensings';
import { Bank } from '../../../components/Banks';
import { LicensingStatus } from '../../../components/LicensingStatus';
import ReportsItem from '../../../components/Reports';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    item: Yup.string().required('Obrigatório!'),
    sub_item: Yup.string().required('Obrigatório!'),
});

export default function Reports() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [banks, setBanks] = useState<Bank[]>([]);
    const [licensingsStatus, setLicensingStatus] = useState<LicensingStatus[]>([]);

    const [isFirstView, setIsFirstView] = useState(true);
    const [showResultMessage, setShowResultMessage] = useState(false);

    const [tableHeader, setTableHeader] = useState([
        "Cliente",
        "Licença/autorização",
        "Orgão",
        "Validade",
        "Documento emitido",
        "Atualização",
    ]);

    const [tableData, setTableData] = useState([]);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    useEffect(() => {
        handleItemSideBar('reports');
        handleSelectedMenu('reports-licensings');

        api.get('/banks').then(res => {
            setBanks(res.data);
        }).catch(err => {
            console.log('Error to get banks on reports, ', err);
        });

        api.get('/licensings/status').then(res => {
            setLicensingStatus(res.data);
        }).catch(err => {
            console.log('Error to get licensings status on reports, ', err);
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
                            let dataRes = [];

                            if (values.item === 'status') {
                                const res = await api.get(`reports/licensings?status=${values.sub_item}`);

                                const licensings: Licensing[] = res.data;

                                if (values.sub_item === 'all') {
                                    setTableHeader(
                                        [
                                            "Cliente",
                                            "Licença/autorização",
                                            "Orgão",
                                            "Validade",
                                            "Documento emitido",
                                            "Criação",
                                            "Atualização",
                                        ]
                                    );

                                    dataRes = licensings.map(licensing => {
                                        return {
                                            link: `/licensings/details/${licensing.id}`,
                                            item: [
                                                licensing.customer.name,
                                                licensing.authorization.department,
                                                licensing.agency.name,
                                                licensing.expire ? format(new Date(licensing.expire), 'dd/MM/yyyy') : '',
                                                licensing.status.name,
                                                format(new Date(licensing.created_at), 'dd/MM/yyyy'),
                                                format(new Date(licensing.updated_at), 'dd/MM/yyyy'),
                                            ]
                                        }
                                    });
                                }
                                else {
                                    setTableHeader(
                                        [
                                            "Cliente",
                                            "Licença/autorização",
                                            "Orgão",
                                            "Validade",
                                            "Criação",
                                            "Atualização",
                                        ]
                                    );

                                    dataRes = licensings.map(licensing => {
                                        return {
                                            link: `/licensings/details/${licensing.id}`,
                                            item: [
                                                licensing.customer.name,
                                                licensing.authorization.department,
                                                licensing.agency.name,
                                                licensing.expire ? format(new Date(licensing.expire), 'dd/MM/yyyy') : '', ,
                                                format(new Date(licensing.created_at), 'dd/MM/yyyy'),
                                                format(new Date(licensing.updated_at), 'dd/MM/yyyy'),
                                            ]
                                        }
                                    });
                                }
                            }

                            if (values.item === 'infringements') {
                                const res = await api.get(`reports/licensings?infringements=${values.sub_item}`);

                                const licensings: Licensing[] = res.data;

                                if (values.sub_item === 'with') {
                                    setTableHeader(
                                        [
                                            "Cliente",
                                            "Licença/autorização",
                                            "Orgão",
                                            "Infração",
                                            "Criação",
                                            "Atualização",
                                        ]
                                    );

                                    dataRes = licensings.map(licensing => {
                                        return {
                                            link: `/licensings/details/${licensing.id}`,
                                            item: [
                                                licensing.customer.name,
                                                licensing.authorization.department,
                                                licensing.agency.name,
                                                licensing.infringement.name,
                                                format(new Date(licensing.created_at), 'dd/MM/yyyy'),
                                                format(new Date(licensing.updated_at), 'dd/MM/yyyy'),
                                            ]
                                        }
                                    });
                                }
                                else {
                                    setTableHeader(
                                        [
                                            "Cliente",
                                            "Licença/autorização",
                                            "Orgão",
                                            "Criação",
                                            "Atualização",
                                        ]
                                    );

                                    dataRes = licensings.map(licensing => {
                                        return {
                                            link: `/licensings/details/${licensing.id}`,
                                            item: [
                                                licensing.customer.name,
                                                licensing.authorization.department,
                                                licensing.agency.name,
                                                format(new Date(licensing.created_at), 'dd/MM/yyyy'),
                                                format(new Date(licensing.updated_at), 'dd/MM/yyyy'),
                                            ]
                                        }
                                    });
                                }
                            }

                            if (dataRes.length < 1) setShowResultMessage(true);

                            setTableData(dataRes);

                            setMessageShow(false);
                        }
                        catch (err) {
                            setTypeMessage("error");

                            setTimeout(() => {
                                setMessageShow(false);
                            }, 4000);

                            console.log('error get licensings reports.');
                            console.log(err);
                        }

                    }}
                    validationSchema={validationSchema}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched }) => (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3 align-items-end">
                                <Form.Group as={Col} sm={4} controlId="formGridType">
                                    <Form.Label>Filtro</Form.Label>
                                    <Form.Control
                                        as="select"
                                        onChange={e => {
                                            setFieldValue('item', e.target.value);
                                            setFieldValue('sub_item', '');
                                        }}
                                        onBlur={handleBlur}
                                        value={values.item}
                                        name="item"
                                        isInvalid={!!errors.item && touched.item}
                                    >
                                        <option hidden>...</option>
                                        <option value='status'>Situação</option>
                                        <option value='infringements'>Infração</option>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{touched.item && errors.item}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col} sm={6} controlId="formGridLine">
                                    {
                                        !!values.item && <>
                                            <Form.Label>{`${values.item === "status" ? 'Licenciamentos por situação' : 'Licenciamentos por infração'}`}</Form.Label>
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
                                                    values.item === "status" && <option value="all">Todas</option>
                                                }

                                                {
                                                    values.item === "status" && licensingsStatus.map((status, index) => {
                                                        return <option key={index} value={status.id}>{status.name}</option>
                                                    })
                                                }

                                                {
                                                    values.item === "infringements" && <>
                                                        <option value='true'>Com infração</option>
                                                        <option value='false'>Sem infração</option>
                                                    </>
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
    </Container >
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