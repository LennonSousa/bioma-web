import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { AuthContext } from '../../../contexts/AuthContext';
import { can } from '../../../components/Users';
import { Institution } from '../../../components/Institutions';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { cellphone } from '../../../components/InputMask/masks';
import { statesCities } from '../../../components/StatesCities';
import PageBack from '../../../components/PageBack';
import { PageWaiting, PageType } from '../../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    agency: Yup.string().required('Obrigatório!'),
    address: Yup.string().notRequired().nullable().nullable(),
    city: Yup.string().required('Obrigatório!'),
    state: Yup.string().required('Obrigatório!'),
    sector: Yup.string().required('Obrigatório!'),
    department: Yup.string().notRequired().nullable(),
    phone: Yup.string().notRequired().nullable(),
    cellphone: Yup.string().notRequired().nullable(),
    institution: Yup.string().required('Obrigatório!'),
});

export default function NewBank() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<PageType>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Aguarde, carregando...');

    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");
    const [cities, setCities] = useState<string[]>([]);

    const router = useRouter();

    useEffect(() => {
        handleItemSideBar('banks');
        handleSelectedMenu('banks-new');

        if (user) {
            if (can(user, "banks", "create")) {
                api.get('institutions').then(res => {
                    setInstitutions(res.data);

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error crate institution, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });
            }
        }
    }, [user]);

    return !user || loading ? <PageWaiting status="waiting" /> :
        <>
            {
                can(user, "banks", "create") ? <>
                    {
                        loadingData ? <PageWaiting
                            status={typeLoadingMessage}
                            message={textLoadingMessage}
                        /> :
                            <Container className="content-page">
                                <Formik
                                    initialValues={{
                                        agency: '',
                                        address: '',
                                        city: '',
                                        state: '',
                                        sector: '',
                                        department: '',
                                        phone: '',
                                        cellphone: '',
                                        institution: '',
                                    }}
                                    onSubmit={async values => {
                                        setTypeMessage("waiting");
                                        setMessageShow(true);

                                        try {
                                            const res = await api.post('banks', {
                                                agency: values.agency,
                                                address: values.address,
                                                city: values.city,
                                                state: values.state,
                                                sector: values.sector,
                                                department: values.department,
                                                phone: values.phone,
                                                cellphone: values.cellphone,
                                                institution: values.institution,
                                            });

                                            setTypeMessage("success");

                                            setTimeout(() => {
                                                router.push(`/banks/details/${res.data.id}`);
                                            }, 1500);
                                        }
                                        catch {
                                            setTypeMessage("error");

                                            setTimeout(() => {
                                                setMessageShow(false);
                                            }, 4000);
                                        }
                                    }}
                                    validationSchema={validationSchema}
                                >
                                    {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                                        <Form onSubmit={handleSubmit}>
                                            <Row className="mb-3">
                                                <Col>
                                                    <PageBack href="/banks" subTitle="Voltar para a lista de bancos." />
                                                </Col>
                                            </Row>

                                            <Row className="mb-3">
                                                <Form.Group as={Col} sm={6} controlId="formGridInstitution">
                                                    <Form.Label>Instituição</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.institution}
                                                        name="institution"
                                                        isInvalid={!!errors.institution && touched.institution}
                                                    >
                                                        <option hidden>...</option>
                                                        {
                                                            institutions.map((institution, index) => {
                                                                return <option key={index} value={institution.id}>{institution.name}</option>
                                                            })
                                                        }
                                                    </Form.Control>
                                                    <Form.Control.Feedback type="invalid">{touched.institution && errors.institution}</Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group as={Col} sm={6} controlId="formGridAgency">
                                                    <Form.Label>Agência</Form.Label>
                                                    <Form.Control
                                                        type="Name"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.agency}
                                                        name="agency"
                                                        isInvalid={!!errors.agency && touched.agency}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{touched.agency && errors.agency}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Row>

                                            <Row className="mb-3">
                                                <Form.Group as={Col} sm={3} controlId="formGridPhone">
                                                    <Form.Label>Telefone comercial</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        maxLength={15}
                                                        onChange={(e) => {
                                                            setFieldValue('phone', cellphone(e.target.value));
                                                        }}
                                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                                            setFieldValue('phone', cellphone(e.target.value));
                                                        }}
                                                        value={values.phone}
                                                        name="phone"
                                                        isInvalid={!!errors.phone && touched.phone}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{touched.phone && errors.phone}</Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group as={Col} sm={3} controlId="formGridCellphone">
                                                    <Form.Label>Celular</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        maxLength={15}
                                                        onChange={(e) => {
                                                            setFieldValue('cellphone', cellphone(e.target.value));
                                                        }}
                                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                                            setFieldValue('cellphone', cellphone(e.target.value));
                                                        }}
                                                        value={values.cellphone}
                                                        name="cellphone"
                                                        isInvalid={!!errors.cellphone && touched.cellphone}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{touched.cellphone && errors.cellphone}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Row>

                                            <Row className="mb-2">
                                                <Form.Group as={Col} sm={6} controlId="formGridAddress">
                                                    <Form.Label>Endereço</Form.Label>
                                                    <Form.Control
                                                        type="address"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.address}
                                                        name="address"
                                                        isInvalid={!!errors.address && touched.address}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{touched.address && errors.address}</Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group as={Col} sm={2} controlId="formGridState">
                                                    <Form.Label>Estado</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        onChange={(e) => {
                                                            setFieldValue('state', e.target.value);
                                                            const stateCities = statesCities.estados.find(item => { return item.nome === e.target.value })

                                                            if (stateCities)
                                                                setCities(stateCities.cidades);
                                                        }}
                                                        onBlur={handleBlur}
                                                        value={values.state ? values.state : '...'}
                                                        name="state"
                                                        isInvalid={!!errors.state && touched.state}
                                                    >
                                                        <option hidden>...</option>
                                                        {
                                                            statesCities.estados.map((estado, index) => {
                                                                return <option key={index} value={estado.nome}>{estado.nome}</option>
                                                            })
                                                        }
                                                    </Form.Control>
                                                    <Form.Control.Feedback type="invalid">{touched.state && errors.state}</Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group as={Col} sm={4} controlId="formGridCity">
                                                    <Form.Label>Cidade</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.city ? values.city : '...'}
                                                        name="city"
                                                        isInvalid={!!errors.city && touched.city}
                                                        disabled={!!!values.state}
                                                    >
                                                        <option hidden>...</option>
                                                        {
                                                            !!values.state && cities.map((city, index) => {
                                                                return <option key={index} value={city}>{city}</option>
                                                            })
                                                        }
                                                    </Form.Control>
                                                    <Form.Control.Feedback type="invalid">{touched.city && errors.city}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Row>

                                            <Row className="mb-3">
                                                <Form.Group as={Col} sm={6} controlId="formGridSector">
                                                    <Form.Label>Setor/gerente</Form.Label>
                                                    <Form.Control
                                                        type="Name"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.sector}
                                                        name="sector"
                                                        isInvalid={!!errors.sector && touched.sector}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{touched.sector && errors.sector}</Form.Control.Feedback>
                                                </Form.Group>

                                                <Form.Group as={Col} sm={3} controlId="formGridDepartment">
                                                    <Form.Label>Departamento</Form.Label>
                                                    <Form.Control
                                                        type="Name"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.department}
                                                        name="department"
                                                        isInvalid={!!errors.department && touched.department}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{touched.department && errors.department}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Row>

                                            <Col className="border-top mb-3"></Col>

                                            <Row className="justify-content-end">
                                                {
                                                    messageShow ? <Col sm={3}><AlertMessage status={typeMessage} /></Col> :
                                                        <Col sm={1}>
                                                            <Button variant="success" type="submit">Salvar</Button>
                                                        </Col>

                                                }
                                            </Row>
                                        </Form>
                                    )}
                                </Formik>
                            </Container>
                    }
                </> :
                    <PageWaiting status="warning" message="Acesso negado!" />
            }
        </>
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