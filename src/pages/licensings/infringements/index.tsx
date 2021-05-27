import { useContext, useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button, Col, Container, Form, Image, ListGroup, Modal, Row } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import produce from 'immer';

import api from '../../../api/api';
import { SideBarContext } from '../../../context/SideBarContext';
import LicensingInfringements, { LicensingInfringement } from '../../../components/LicensingInfringements';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    order: Yup.number().required(),
});

export default function Types() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const [infringements, setInfringements] = useState<LicensingInfringement[]>([]);

    const [loading, setLoading] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<typeof statusModal>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Carregando...');

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [showModalNewInfringement, setShowModalNewInfringement] = useState(false);

    const handleCloseModalInfringement = () => setShowModalNewInfringement(false);
    const handleShowModalNewInfringement = () => setShowModalNewInfringement(true);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-infringements');

        api.get('licensings/infringements').then(res => {
            setInfringements(res.data);

            setLoading(false);
        }).catch(err => {
            console.log('Error to get licensings infringements, ', err);

            setTypeLoadingMessage("error");
            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
        })
    }, []);

    async function handleListInfringements() {
        const res = await api.get('licensings/infringements');

        setInfringements(res.data);
    }

    function handleOnDragEnd(result: DropResult) {
        if (result.destination) {
            const from = result.source.index;
            const to = result.destination.index;

            const updatedListDocs = produce(infringements, draft => {
                if (draft) {
                    const dragged = draft[from];

                    draft.splice(from, 1);
                    draft.splice(to, 0, dragged);
                }
            });

            if (updatedListDocs) {
                setInfringements(updatedListDocs);
                saveOrder(updatedListDocs);
            }
        }
    }

    async function saveOrder(list: LicensingInfringement[]) {
        list.forEach(async (doc, index) => {
            try {
                await api.put(`licensings/infringements/${doc.id}`, {
                    name: doc.name,
                    order: index
                });

                handleListInfringements();
            }
            catch (err) {
                console.log('error to save licensings infringements order');
                console.log(err)
            }
        });
    }

    return <Container className="content-page">
        <Row>
            <Col>
                <Button variant="outline-success" onClick={handleShowModalNewInfringement}>
                    <FaPlus /> Criar uma infração
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
                            infringements.length > 0 ? <Col>
                                <DragDropContext onDragEnd={handleOnDragEnd}>
                                    <Droppable droppableId="lines">
                                        {provided => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                <ListGroup>
                                                    {
                                                        infringements && infringements.map((infringement, index) => {
                                                            return <Draggable key={infringement.id} draggableId={infringement.id} index={index}>
                                                                {(provided) => (
                                                                    <div
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        ref={provided.innerRef}
                                                                    >
                                                                        <LicensingInfringements
                                                                            infringement={infringement}
                                                                            listInfringements={infringements}
                                                                            handleListInfringements={handleListInfringements}
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
                                            <p style={{ color: 'var(--gray)' }}>Você ainda não tem nenhuma infração registrado.</p>
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

        <Modal show={showModalNewInfringement} onHide={handleCloseModalInfringement}>
            <Modal.Header closeButton>
                <Modal.Title>Criar uma infração</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={
                    {
                        name: '',
                        order: 0,
                    }
                }
                onSubmit={async values => {
                    setTypeMessage("waiting");
                    setMessageShow(true);

                    try {
                        if (infringements) {
                            await api.post('licensings/infringements', {
                                name: values.name,
                                order: infringements.length,
                            });

                            await handleListInfringements();

                            setTypeMessage("success");

                            setTimeout(() => {
                                setMessageShow(false);
                                handleCloseModalInfringement();
                            }, 1000);
                        }
                    }
                    catch (err) {
                        setTypeMessage("error");

                        setTimeout(() => {
                            setMessageShow(false);
                        }, 4000);

                        console.log('error create licensings infringements.');
                        console.log(err);
                    }

                }}
                validationSchema={validationSchema}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Group controlId="typeFormGridName">
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
                                        <Button variant="secondary" onClick={handleCloseModalInfringement}>
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