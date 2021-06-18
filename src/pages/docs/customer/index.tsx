import { useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button, Col, Container, Form, Image, ListGroup, Modal, Row } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import produce from 'immer';

import api from '../../../api/api';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import DocCustomer, { DocsCustomer } from '../../../components/DocsCustomer';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    active: Yup.boolean(),
    order: Yup.number().required(),
});

export default function NewCustomer() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [docsCustomer, setDocsCustomer] = useState<DocsCustomer[]>([]);
    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [showModalNewDoc, setShowModalNewDoc] = useState(false);

    const handleCloseModalNewDoc = () => setShowModalNewDoc(false);
    const handleShowModalNewDoc = () => setShowModalNewDoc(true);

    useEffect(() => {
        handleItemSideBar('customers');
        handleSelectedMenu('customers-docs');

        api.get('docs/customer').then(res => {
            setDocsCustomer(res.data);
        }).catch(err => {
            console.log('Error to get docs customer, ', err);
        })
    }, []);

    async function handleListDocs() {
        const res = await api.get('docs/customer');

        setDocsCustomer(res.data);
    }

    function handleOnDragEnd(result: DropResult) {
        if (result.destination) {
            const from = result.source.index;
            const to = result.destination.index;

            const updatedListDocs = produce(docsCustomer, draft => {
                if (draft) {
                    const dragged = draft[from];

                    draft.splice(from, 1);
                    draft.splice(to, 0, dragged);
                }
            });

            if (updatedListDocs) {
                setDocsCustomer(updatedListDocs);
                saveOrder(updatedListDocs);
            }
        }
    }

    async function saveOrder(list: DocsCustomer[]) {
        list.forEach(async (doc, index) => {
            try {
                await api.put(`docs/customer/${doc.id}`, {
                    name: doc.name,
                    active: doc.active,
                    order: index
                });

                handleListDocs();
            }
            catch (err) {
                console.log('error to save docs customer order');
                console.log(err)
            }
        });
    }

    return <Container className="content-page">
        <Row>
            <Col>
                <Button variant="outline-success" onClick={handleShowModalNewDoc}>
                    <FaPlus /> Criar um documento
                </Button>
            </Col>
        </Row>

        <article className="mt-3">
            <Row>
                {docsCustomer.length > 0 ? <Col>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="docs">
                            {provided => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    <ListGroup>
                                        {
                                            docsCustomer && docsCustomer.map((doc, index) => {
                                                return <Draggable key={doc.id} draggableId={doc.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            ref={provided.innerRef}
                                                        >
                                                            <DocCustomer doc={doc} listDocs={docsCustomer} handleListDocs={handleListDocs} />
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
                                <p style={{ color: 'var(--gray)' }}>Você ainda não tem nenhum documento registrado.</p>
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
        </article>

        <Modal show={showModalNewDoc} onHide={handleCloseModalNewDoc}>
            <Modal.Header closeButton>
                <Modal.Title>Criar um documento</Modal.Title>
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
                        if (docsCustomer) {
                            await api.post('docs/customer', {
                                name: values.name,
                                active: values.active,
                                order: docsCustomer.length,
                            });

                            await handleListDocs();

                            setTypeMessage("success");

                            setTimeout(() => {
                                setMessageShow(false);
                                handleCloseModalNewDoc();
                            }, 1000);
                        }
                    }
                    catch (err) {
                        setTypeMessage("error");

                        setTimeout(() => {
                            setMessageShow(false);
                        }, 4000);

                        console.log('error create doc customer.');
                        console.log(err);
                    }

                }}
                validationSchema={validationSchema}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Group controlId="categoryFormGridName">
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
                                        <Button variant="secondary" onClick={handleCloseModalNewDoc}>
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