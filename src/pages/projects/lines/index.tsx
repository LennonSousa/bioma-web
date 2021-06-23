import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button, Col, Container, Form, Image, ListGroup, Modal, Row } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import produce from 'immer';
import { AccessControl } from 'accesscontrol';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { PageWaiting } from '../../../components/PageWaiting';
import ProjectLines, { ProjectLine } from '../../../components/ProjectLines';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    order: Yup.number().required(),
});

const ac = new AccessControl();

export default function Lines() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const { loading, user } = useContext(AuthContext);

    const [projectLines, setProjectLines] = useState<ProjectLine[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<typeof statusModal>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Carregando...');
    const [accessVerified, setAccessVerified] = useState(false);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [showModalNewLine, setShowModalNewLine] = useState(false);

    const handleCloseModalLine = () => setShowModalNewLine(false);
    const handleShowModalNewLine = () => setShowModalNewLine(true);

    useEffect(() => {
        if (user) {
            ac.setGrants(user.grants);

            if (ac.hasRole(user.id) && ac.can(user.id).updateAny('projects').granted) {
                handleItemSideBar('projects');
                handleSelectedMenu('projects-lines');

                api.get('projects/lines').then(res => {
                    setProjectLines(res.data);

                    setLoadingData(false);
                }).catch(err => {
                    console.log('Error to get project lines, ', err);

                    setTypeLoadingMessage("error");
                    setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
                });
            }

            setAccessVerified(true);
        }
    }, [user]);

    async function handleListLines() {
        const res = await api.get('projects/lines');

        setProjectLines(res.data);
    }

    function handleOnDragEnd(result: DropResult) {
        if (result.destination) {
            const from = result.source.index;
            const to = result.destination.index;

            const updatedListDocs = produce(projectLines, draft => {
                if (draft) {
                    const dragged = draft[from];

                    draft.splice(from, 1);
                    draft.splice(to, 0, dragged);
                }
            });

            if (updatedListDocs) {
                setProjectLines(updatedListDocs);
                saveOrder(updatedListDocs);
            }
        }
    }

    async function saveOrder(list: ProjectLine[]) {
        list.forEach(async (doc, index) => {
            try {
                await api.put(`projects/lines/${doc.id}`, {
                    name: doc.name,
                    order: index
                });

                handleListLines();
            }
            catch (err) {
                console.log('error to save lines order');
                console.log(err)
            }
        });
    }

    return !user || loading || !accessVerified ? <PageWaiting status="waiting" /> :
        <Container className="content-page">
            <>
                {
                    ac.hasRole(user.id) && ac.can(user.id).updateAny('projects').granted ? <>
                        <Row>
                            <Col>
                                <Button variant="outline-success" onClick={handleShowModalNewLine}>
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
                                            !!projectLines.length ? <Col>
                                                <DragDropContext onDragEnd={handleOnDragEnd}>
                                                    <Droppable droppableId="lines">
                                                        {provided => (
                                                            <div
                                                                {...provided.droppableProps}
                                                                ref={provided.innerRef}
                                                            >
                                                                <ListGroup>
                                                                    {
                                                                        projectLines && projectLines.map((line, index) => {
                                                                            return <Draggable key={line.id} draggableId={line.id} index={index}>
                                                                                {(provided) => (
                                                                                    <div
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                        ref={provided.innerRef}
                                                                                    >
                                                                                        <ProjectLines
                                                                                            line={line}
                                                                                            listLines={projectLines}
                                                                                            handleListLines={handleListLines}
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
                                                            <p style={{ color: 'var(--gray)' }}>Você ainda não tem nenhuma linha de crédito registrada.</p>
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

                        <Modal show={showModalNewLine} onHide={handleCloseModalLine}>
                            <Modal.Header closeButton>
                                <Modal.Title>Criar um item</Modal.Title>
                            </Modal.Header>
                            <Formik
                                initialValues={
                                    {
                                        name: '',
                                        active: true,
                                        order: 0,
                                    }
                                }
                                onSubmit={async values => {
                                    setTypeMessage("waiting");
                                    setMessageShow(true);

                                    try {
                                        if (projectLines) {
                                            await api.post('projects/lines', {
                                                name: values.name,
                                                active: values.active,
                                                order: projectLines.length,
                                            });

                                            await handleListLines();

                                            setTypeMessage("success");

                                            setTimeout(() => {
                                                setMessageShow(false);
                                                handleCloseModalLine();
                                            }, 1500);
                                        }
                                    }
                                    catch (err) {
                                        setTypeMessage("error");

                                        setTimeout(() => {
                                            setMessageShow(false);
                                        }, 4000);

                                        console.log('error create project line.');
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
                                                        <Button variant="secondary" onClick={handleCloseModalLine}>
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
                    </> :
                        <PageWaiting status="warning" message="Acesso negado!" />
                }
            </>
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