import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Button, Col, Container, Form, Image, ListGroup, Modal, Row } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';

import api from '../../api/api';
import { TokenVerify } from '../../utils/tokenVerify';
import { SideBarContext } from '../../context/SideBarContext';
import Users, { User } from '../../components/Users';
import { AlertMessage, statusModal } from '../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
});

export default function Institutions() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const [users, setUsers] = useState<User[]>([]);

    const [loading, setLoading] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<typeof statusModal>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Carregando...');

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [showModalNewInstitution, setShowModalNewInstitution] = useState(false);

    const handleCloseModalInstitution = () => setShowModalNewInstitution(false);
    const handleShowModalNewInstitution = () => setShowModalNewInstitution(true);

    useEffect(() => {
        handleItemSideBar('users');
        handleSelectedMenu('users-index');

        api.get('users').then(res => {
            setUsers(res.data);

            setLoading(false);
        }).catch(err => {
            console.log('Error to get users, ', err);

            setTypeLoadingMessage("error");
            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
        })
    }, []);

    async function handleListUsers() {
        const res = await api.get('users');

        setUsers(res.data);
    }

    return <Container className="content-page">
        <Row>
            <Col>
                <Button variant="outline-success" onClick={handleShowModalNewInstitution}>
                    <FaPlus /> Criar um usuário
                </Button>
            </Col>
        </Row>

        <article className="mt-3">
            {
                loading ? <Col>
                    <Row>
                        <Col>
                            <AlertMessage status={typeLoadingMessage} message={textLoadingMessage} />
                        </Col>
                    </Row>

                    {
                        typeLoadingMessage === "error" && <Row className="justify-content-center mt-3 mb-3">
                            <Col sm={3}>
                                <Image src="/assets/images/undraw_server_down_s4lk.svg" alt="Erro de conexão." fluid />
                            </Col>
                        </Row>
                    }
                </Col> :
                    <Row>
                        {
                            users.length > 0 ? <Col>
                                <ListGroup>
                                    {
                                        users && users.map((user, index) => {
                                            return <Users
                                                key={index}
                                                user={user}
                                                handleListUsers={handleListUsers}
                                            />
                                        })
                                    }
                                </ListGroup>
                            </Col> :
                                <Col>
                                    <Row>
                                        <Col className="text-center">
                                            <p style={{ color: 'var(--gray)' }}>Você ainda não tem nenhuma institutição registrada.</p>
                                        </Col>
                                    </Row>

                                    <Row className="justify-content-center mt-3 mb-3">
                                        <Col sm={3}>
                                            <Image src="/assets/images/undraw_not_found.svg" alt="Sem dados para mostrar." fluid />
                                        </Col>
                                    </Row>
                                </Col>
                        }
                    </Row>
            }
        </article>

        <Modal show={showModalNewInstitution} onHide={handleCloseModalInstitution}>
            <Modal.Header closeButton>
                <Modal.Title>Criar uma instituição</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={
                    {
                        name: '',
                    }
                }
                onSubmit={async values => {
                    setTypeMessage("waiting");
                    setMessageShow(true);

                    try {
                        if (users) {
                            await api.post('users', {
                                name: values.name,
                            });

                            await handleListUsers();

                            setTypeMessage("success");

                            setTimeout(() => {
                                setMessageShow(false);
                                handleCloseModalInstitution();
                            }, 1500);
                        }
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
                        <Modal.Body>
                            <Form.Group controlId="lineFormGridName">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control type="text"
                                    placeholder="Nome"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.name}
                                    name="name"
                                    isInvalid={!!errors.name && touched.name}
                                />
                                <Form.Control.Feedback type="invalid">{touched.name && errors.name}</Form.Control.Feedback>
                                <Form.Text className="text-muted text-right">{`${values.name.length}/50 caracteres.`}</Form.Text>
                            </Form.Group>

                        </Modal.Body>
                        <Modal.Footer>
                            {
                                messageShow ? <AlertMessage status={typeMessage} /> :
                                    <>
                                        <Button variant="secondary" onClick={handleCloseModalInstitution}>
                                            Cancelar
                                        </Button>
                                        <Button variant="success" type="submit">Salvar</Button>
                                    </>

                            }
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    </Container>
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