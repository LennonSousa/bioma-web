import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button, Col, Container, Form, Image, ListGroup, Modal, Row } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import produce from 'immer';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { can } from '../../../components/Users';
import LicensingAuthorizations, { LicensingAuthorization } from '../../../components/LicensingAuthorizations';
import { PageWaiting } from '../../../components/PageWaiting';
import { AlertMessage, statusModal } from '../../../components/Interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    department: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    activity: Yup.string().notRequired().nullable(),
    sub_activity: Yup.string().notRequired().nullable(),
    order: Yup.number().required(),
});

export default function Lines() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [authorizations, setAuthorizations] = useState<LicensingAuthorization[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<statusModal>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Carregando...');

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    const [showModalNewAuthorization, setShowModalNewAuthorization] = useState(false);

    const handleCloseModalAuthorization = () => setShowModalNewAuthorization(false);
    const handleShowModalNewAuthorization = () => setShowModalNewAuthorization(true);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-authorizations');

        if (user) {
            if (can(user, "licensings", "update:any")) {
                api.get('licensings/authorizations').then(res => {
                    setAuthorizations(res.data);

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get customers, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });
            }
        }
    }, []);

    async function handleListAuthorizations() {
        const res = await api.get('licensings/authorizations');

        setAuthorizations(res.data);
    }

    function handleOnDragEnd(result: DropResult) {
        if (result.destination) {
            const from = result.source.index;
            const to = result.destination.index;

            const updatedListDocs = produce(authorizations, draft => {
                if (draft) {
                    const dragged = draft[from];

                    draft.splice(from, 1);
                    draft.splice(to, 0, dragged);
                }
            });

            if (updatedListDocs) {
                setAuthorizations(updatedListDocs);
                saveOrder(updatedListDocs);
            }
        }
    }

    async function saveOrder(list: LicensingAuthorization[]) {
        list.forEach(async (doc, index) => {
            try {
                await api.put(`licensings/authorizations/${doc.id}`, {
                    department: doc.department,
                    order: index
                });

                handleListAuthorizations();
            }
            catch (err) {
                console.log('error to save licensings authorizations order');
                console.log(err)
            }
        });
    }

    return (
        <>
            <NextSeo
                title="Autorizações de licenciamentos"
                description="Autorizações de licenciamentos da plataforma de gerenciamento da Bioma consultoria."
                openGraph={{
                    url: 'https://app.biomaconsultoria.com',
                    title: 'Autorizações de licenciamentos',
                    description: 'Autorizações de licenciamentos da plataforma de gerenciamento da Bioma consultoria.',
                    images: [
                        {
                            url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg',
                            alt: 'Autorizações de licenciamentos | Plataforma Bioma',
                        },
                        { url: 'https://app.biomaconsultoria.com/assets/images/logo-bioma.jpg' },
                    ],
                }}
            />

            {
                !user || loading ? <PageWaiting status="waiting" /> :
                    <>
                        {
                            <Container className="content-page">
                                <Row>
                                    <Col>
                                        <Button variant="outline-success" onClick={handleShowModalNewAuthorization}>
                                            <FaPlus /> Criar um item
                                        </Button>
                                    </Col>
                                </Row>

                                <article className="mt-3">
                                    {
                                        loadingData ? <Col>
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
                                                    !!authorizations.length ? <Col>
                                                        <DragDropContext onDragEnd={handleOnDragEnd}>
                                                            <Droppable droppableId="lines">
                                                                {provided => (
                                                                    <div
                                                                        {...provided.droppableProps}
                                                                        ref={provided.innerRef}
                                                                    >
                                                                        <ListGroup>
                                                                            {
                                                                                authorizations && authorizations.map((authorization, index) => {
                                                                                    return <Draggable key={authorization.id} draggableId={authorization.id} index={index}>
                                                                                        {(provided) => (
                                                                                            <div
                                                                                                {...provided.draggableProps}
                                                                                                {...provided.dragHandleProps}
                                                                                                ref={provided.innerRef}
                                                                                            >
                                                                                                <LicensingAuthorizations
                                                                                                    authorization={authorization}
                                                                                                    listAuthorizations={authorizations}
                                                                                                    handleListAuthorizations={handleListAuthorizations}
                                                                                                />
                                                                                            </div>
                                                                                        )}

                                                                                    </Draggable>
                                                                                })
                                                                            }
                                                                        </ListGroup>
                                                                        {provided.placeholder}
                                                                    </div>
                                                                )}
                                                            </Droppable>
                                                        </DragDropContext>
                                                    </Col> :
                                                        <Col>
                                                            <Row>
                                                                <Col className="text-center">
                                                                    <p style={{ color: 'var(--gray)' }}>Nenhuma autorização registrada.</p>
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

                                <Modal show={showModalNewAuthorization} onHide={handleCloseModalAuthorization}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Criar uma autorização</Modal.Title>
                                    </Modal.Header>
                                    <Formik
                                        initialValues={
                                            {
                                                department: '',
                                                activity: '',
                                                sub_activity: '',
                                                order: 0,
                                            }
                                        }
                                        onSubmit={async values => {
                                            setTypeMessage("waiting");
                                            setMessageShow(true);

                                            try {
                                                if (authorizations) {
                                                    await api.post('licensings/authorizations', {
                                                        department: values.department,
                                                        activity: values.activity,
                                                        sub_activity: values.sub_activity,
                                                        order: authorizations.length,
                                                    });

                                                    await handleListAuthorizations();

                                                    setTypeMessage("success");

                                                    setTimeout(() => {
                                                        setMessageShow(false);
                                                        handleCloseModalAuthorization();
                                                    }, 1500);
                                                }
                                            }
                                            catch (err) {
                                                setTypeMessage("error");

                                                setTimeout(() => {
                                                    setMessageShow(false);
                                                }, 4000);

                                                console.log('error create licensings authorizations.');
                                                console.log(err);
                                            }

                                        }}
                                        validationSchema={validationSchema}
                                    >
                                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                                            <Form onSubmit={handleSubmit}>
                                                <Modal.Body>
                                                    <Form.Group controlId="lineFormGridName">
                                                        <Form.Label>Departamento</Form.Label>
                                                        <Form.Control type="text"
                                                            placeholder="Nome"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values.department}
                                                            name="department"
                                                            isInvalid={!!errors.department && touched.department}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{touched.department && errors.department}</Form.Control.Feedback>
                                                        <Form.Text className="text-muted text-right">{`${values.department.length}/50 caracteres.`}</Form.Text>
                                                    </Form.Group>

                                                    <Form.Group controlId="lineFormGridActivity">
                                                        <Form.Label>Atividade</Form.Label>
                                                        <Form.Control type="text"
                                                            placeholder="Nome"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values.activity}
                                                            name="activity"
                                                            isInvalid={!!errors.activity && touched.activity}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{touched.activity && errors.activity}</Form.Control.Feedback>
                                                        <Form.Text className="text-muted text-right">{`${values.activity.length}/50 caracteres.`}</Form.Text>
                                                    </Form.Group>

                                                    <Form.Group controlId="lineFormGridSubActivity">
                                                        <Form.Label>Sub-atividade</Form.Label>
                                                        <Form.Control type="text"
                                                            placeholder="Nome"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values.sub_activity}
                                                            name="sub_activity"
                                                            isInvalid={!!errors.sub_activity && touched.sub_activity}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{touched.sub_activity && errors.sub_activity}</Form.Control.Feedback>
                                                        <Form.Text className="text-muted text-right">{`${values.sub_activity.length}/50 caracteres.`}</Form.Text>
                                                    </Form.Group>

                                                </Modal.Body>
                                                <Modal.Footer>
                                                    {
                                                        messageShow ? <AlertMessage status={typeMessage} /> :
                                                            <>
                                                                <Button variant="secondary" onClick={handleCloseModalAuthorization}>
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
                    </>
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