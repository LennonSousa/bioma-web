import { useEffect, useState } from 'react';
import Link from 'next/link';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import { Button, Col, Container, Form, Image, Modal, Row, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaCloudDownloadAlt, FaHandsHelping } from 'react-icons/fa';
import Cookies from 'js-cookie';
import FileSaver from 'file-saver';

import api from '../../../../api/api';
import { CustomerAttachment } from '../../../../components/CustomerAttachments';
import { AlertMessage, statusModal } from '../../../../components/Interfaces/AlertMessage';

import styles from '../../../../styles/index.module.css';

const validationSchema = Yup.object().shape({
    email: Yup.string().email('E-mail inválido!').required('Obrigatório!'),
    terms: Yup.boolean().isTrue('Obrigatório aceitar os termos.'),
});

export default function ShareAuth({ share, token }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [attachment, setAttachment] = useState<CustomerAttachment>();
    const [authToken, setAuthToken] = useState<String>();

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");
    const [textMessage, setTextMessage] = useState('aguarde...');
    const [downloadingAttachment, setDownloadingAttachment] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    useEffect(() => {
        Cookies.remove('user');
        Cookies.remove('token');
    }, []);

    async function handleDownloadAttachment() {
        if (attachment && authToken) {
            setDownloadingAttachment(true);

            try {
                const res = await api.get(`shares/customers/${attachment.id}`,
                    {
                        responseType: "blob",
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });

                const fileName = attachment.name.replace('.', '');

                FileSaver.saveAs(res.data, fileName);
            }
            catch (err) {
                console.log("Error to get attachment");
                console.log(err);
            }

            setDownloadingAttachment(false);
        }
    }

    return (
        <>
            <NextSeo
                title="Acessar arquivo"
                description="Acessar arquivo da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Acessar arquivo',
                    description: 'Acessar arquivo da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Acessar arquivo | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                <div className={styles.pageContainer}>
                    <Container>
                        <Row className="justify-content-center align-items-center">
                            <Col sm={12} className={`${styles.formContainer} col-11`}>
                                <Row className="justify-content-center align-items-center">
                                    <Col md={6} className="mt-1 mb-4">
                                        <Row className="justify-content-center align-items-center">
                                            <Col className="col-5" sm={8}>
                                                <Image fluid src="/assets/images/logo-bioma.svg" alt="Bioma consultoria." />
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col md={4} className="mt-1 mb-1">
                                        <Formik
                                            initialValues={{
                                                email: '',
                                                terms: false,
                                            }}
                                            onSubmit={async values => {
                                                setTypeMessage("waiting");
                                                setTextMessage('aguarde...');
                                                setMessageShow(true);

                                                try {
                                                    const res = await api.put(`shares/customers/${share}`, {
                                                        email: values.email,
                                                        token,
                                                    });

                                                    if (res.status === 200) {
                                                        const { attachment, token } = res.data;

                                                        setAttachment(attachment);
                                                        setAuthToken(token);

                                                        setTypeMessage("success");
                                                        setTextMessage('sucesso!');
                                                        handleShowModal();
                                                        return;
                                                    }

                                                    setTypeMessage("error");
                                                    setTextMessage('e-mail incorreto ou compartilhamento expirado!');

                                                    setTimeout(() => {
                                                        setMessageShow(false);
                                                    }, 5000);
                                                }
                                                catch {
                                                    setTypeMessage("error");
                                                    setTextMessage('e-mail incorreto ou compartilhamento expirado!');

                                                    setTimeout(() => {
                                                        setMessageShow(false);
                                                    }, 4000);
                                                }
                                            }}
                                            validationSchema={validationSchema}
                                            validateOnChange={false}
                                        >
                                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                                                <Form onSubmit={handleSubmit}>
                                                    <Row>
                                                        <Col>
                                                            <h3 className="text-success">Olá</h3>

                                                            <h5 className="text-secondary">Insira o seu e-mail para acessar o arquivo.</h5>

                                                            <Form.Group className="mb-4" controlId="formLoginPassword">
                                                                <Form.Label>E-mail</Form.Label>
                                                                <Form.Control type="email"
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    value={values.email}
                                                                    name="email"
                                                                    isInvalid={!!errors.email && touched.email}
                                                                />
                                                                <Form.Control.Feedback type="invalid">{touched.email && errors.email}</Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>

                                                    <Row className="mb-2">
                                                        <Col>
                                                            <Form.Switch
                                                                id="terms"
                                                                label="Aceito os termos e condições."
                                                                checked={values.terms}
                                                                onChange={handleChange}
                                                                name="terms"
                                                                isInvalid={!!errors.terms && touched.terms}
                                                            />
                                                            {touched.terms && <label className="invalid-feedback" style={{ display: 'block' }}>{errors.terms}</label>}
                                                        </Col>
                                                    </Row>

                                                    <Row className="justify-content-end">
                                                        {
                                                            messageShow ? <Col sm={12}><AlertMessage status={typeMessage} message={textMessage} /></Col> :
                                                                <Col style={{ flexGrow: 0 }}>
                                                                    <Button variant="success" type="submit">Acessar</Button>
                                                                </Col>

                                                        }
                                                    </Row>

                                                    <Row className="mt-4">
                                                        <Col>
                                                            <Link href="/terms">
                                                                <a
                                                                    title="Termos de uso e políticas de privacidade."
                                                                    data-title="Termos de uso e políticas de privacidade."
                                                                >
                                                                    <Row>
                                                                        <Col sm={1}>
                                                                            <FaHandsHelping size={14} /> <span>Termos de uso e políticas de privacidade.</span>
                                                                        </Col>
                                                                    </Row>
                                                                </a>
                                                            </Link>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            )}
                                        </Formik>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Modal
                            show={showModal}
                            onHide={handleCloseModal}
                            backdrop="static"
                            keyboard={false}
                        >
                            <Modal.Header>
                                <Modal.Title>Verificação concluída!</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Row className="justify-content-center align-items-center mb-3">
                                    <Col className="col-5" sm={8}>
                                        <Image fluid src="/assets/images/undraw_secure_files_re_6vdh.svg" alt="Arquivo pronto para ser baixado!" />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center align-items-center text-center">
                                    <Col>
                                        <h5 className="text-success">Seu arquivo está pronto!</h5>
                                        <h6 className="text-secondary">Clique no botão abaixo para baixar o arquivo.</h6>
                                    </Col>
                                </Row>
                            </Modal.Body>

                            <Modal.Footer>
                                <Button
                                    variant="outline-success"
                                    className="button-link"
                                    onClick={handleDownloadAttachment}
                                    title="Baixar o anexo."
                                >
                                    {
                                        downloadingAttachment ? <Spinner animation="border" variant="success" size="sm" /> :
                                            <>Baixar arquivo <FaCloudDownloadAlt /></>
                                    }
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Container>
                </div>
            }
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { share, token } = context.query;

    if (!share || !token) { // No share id or token!
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: {
            share,
            token,
        },
    }
}