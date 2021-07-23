import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { Customer } from '../../../components/Customers';
import { CustomerType } from '../../../components/CustomerTypes'
import ReportsItem, { Data } from '../../../components/Reports';
import { AlertMessage, statusModal } from '../../../components/Interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    item: Yup.string().required('Obrigatório!'),
    sub_item: Yup.string().required('Obrigatório!'),
});

export default function Reports() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);

    const [isFirstView, setIsFirstView] = useState(true);
    const [showResultMessage, setShowResultMessage] = useState(false);

    const tableHeader = [
        "Nome",
        "Celular",
        "Cidade",
        "Estado",
    ]

    const [tableData, setTableData] = useState<Data[]>([]);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    useEffect(() => {
        handleItemSideBar('reports');
        handleSelectedMenu('reports-customers');

        api.get('customers/types').then(res => {
            setCustomerTypes(res.data);
        }).catch(err => {
            console.log('Error to get customers types on reports, ', err);
        });
    }, []);

    return (
        <>
            <NextSeo
                title="Relatórios de clientes"
                description="Relatórios de clientes da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Relatórios de clientes',
                    description: 'Relatórios de clientes da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Relatórios de clientes | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />


            <Container className="content-page">
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
                                    const res = await api.get(
                                        `reports/customers?${values.item === "warnings" ? 'warnings' : 'type'}=${values.sub_item}`
                                    );

                                    const customers: Customer[] = res.data;

                                    const dataRes = customers.map(customer => {
                                        return {
                                            link: `/customers/details/${customer.id}`,
                                            item: [
                                                customer.name,
                                                customer.cellphone,
                                                customer.city,
                                                customer.state,
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
                                                <option value='warnings'>Pendências</option>
                                                <option value='type'>Tipo</option>
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">{touched.item && errors.item}</Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group as={Col} sm={6} controlId="formGridLine">
                                            {
                                                !!values.item && <>
                                                    <Form.Label>{`${values.item === "warnings" ? 'Clientes por pendência' : 'Tipo de cliente'}`}</Form.Label>
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
                                                            values.item === "warnings" && <>
                                                                <option value='true'>Com pendência</option>
                                                                <option value='false'>Sem pendência</option>
                                                            </>
                                                        }

                                                        {
                                                            values.item === "type" && customerTypes.map((type, index) => {
                                                                return <option key={index} value={type.id}>{type.name}</option>
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
        </>
    )
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