import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button, Col, Container, Form, Image, ListGroup, Modal, Row } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import produce from 'immer';

import api from '../../../services/api';
import ProjectStatusItem, { ProjectStatus } from '../../../components/ProjectStatus';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    order: Yup.number().required(),
});

export default function Status() {
    const [projectStatus, setProjectStatus] = useState<ProjectStatus[]>([]);

    const [loading, setLoading] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<typeof statusModal>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Carregando...');

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [showModalNewLine, setShowModalNewLine] = useState(false);

    const handleCloseModalLine = () => setShowModalNewLine(false);
    const handleShowModalNewLine = () => setShowModalNewLine(true);

    useEffect(() => {
        api.get('projects/status').then(res => {
            setProjectStatus(res.data);

            setLoading(false);
        }).catch(err => {
            console.log('Error to get project status, ', err);

            setTypeLoadingMessage("error");
            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
        })
    }, []);

    async function handleListStatus() {
        const res = await api.get('projects/status');

        setProjectStatus(res.data);
    }

    function handleOnDragEnd(result: DropResult) {
        if (result.destination) {
            const from = result.source.index;
            const to = result.destination.index;

            const updatedListDocs = produce(projectStatus, draft => {
                if (draft) {
                    const dragged = draft[from];

                    draft.splice(from, 1);
                    draft.splice(to, 0, dragged);
                }
            });

            if (updatedListDocs) {
                setProjectStatus(updatedListDocs);
                saveOrder(updatedListDocs);
            }
        }
    }

    async function saveOrder(list: ProjectStatus[]) {
        list.forEach(async (doc, index) => {
            try {
                await api.put(`projects/status/${doc.id}`, {
                    name: doc.name,
                    order: index
                });

                handleListStatus();
            }
            catch (err) {
                console.log('error to save status order');
                console.log(err)
            }
        });
    }

    return <Container className="content-page">
        <Row>
            <Col>
                <Button variant="outline-success" onClick={handleShowModalNewLine}>
                    <FaPlus /> Criar um item
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
                            projectStatus.length > 0 ? <Col>
                                <DragDropContext onDragEnd={handleOnDragEnd}>
                                    <Droppable droppableId="status">
                                        {provided => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                <ListGroup>
                                                    {
                                                        projectStatus && projectStatus.map((status, index) => {
                                                            return <Draggable key={status.id} draggableId={status.id} index={index}>
                                                                {(provided) => (
                                                                    <div
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        ref={provided.innerRef}
                                                                    >
                                                                        <ProjectStatusItem
                                                                            status={status}
                                                                            listStatus={projectStatus}
                                                                            handleListStatus={handleListStatus}
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
                                            <p style={{ color: 'var(--gray)' }}>Você ainda não tem nenhuma fase registrada.</p>
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
                        if (projectStatus) {
                            await api.post('projects/status', {
                                name: values.name,
                                active: values.active,
                                order: projectStatus.length,
                            });

                            await handleListStatus();

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
                                <Form.Label>Nome do documento</Form.Label>
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
    </Container>
}