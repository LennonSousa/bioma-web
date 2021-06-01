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
import { SideBarContext } from '../../../context/SideBarContext';
import LicensingAgencies, { LicensingAgency } from '../../../components/LicensingAgencies';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    order: Yup.number().required(),
});

export default function Lines() {
    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);
    const [licensingAgencies, setLicensingAgencies] = useState<LicensingAgency[]>([]);

    const [loading, setLoading] = useState(true);
    const [typeLoadingMessage, setTypeLoadingMessage] = useState<typeof statusModal>("waiting");
    const [textLoadingMessage, setTextLoadingMessage] = useState('Carregando...');

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [showModalNewAgency, setShowModalNewAgency] = useState(false);

    const handleCloseModalAgency = () => setShowModalNewAgency(false);
    const handleShowModalNewAgency = () => setShowModalNewAgency(true);

    useEffect(() => {
        handleItemSideBar('licensings');
        handleSelectedMenu('licensings-agencies');

        api.get('licensings/agencies').then(res => {
            setLicensingAgencies(res.data);

            setLoading(false);
        }).catch(err => {
            console.log('Error to get licensings agencies, ', err);

            setTypeLoadingMessage("error");
            setTextLoadingMessage("Não foi possível carregar os dados, verifique a sua internet e tente novamente em alguns minutos.");
        })
    }, []);

    async function handleListAgencies() {
        const res = await api.get('licensings/agencies');

        setLicensingAgencies(res.data);
    }

    function handleOnDragEnd(result: DropResult) {
        if (result.destination) {
            const from = result.source.index;
            const to = result.destination.index;

            const updatedListDocs = produce(licensingAgencies, draft => {
                if (draft) {
                    const dragged = draft[from];

                    draft.splice(from, 1);
                    draft.splice(to, 0, dragged);
                }
            });

            if (updatedListDocs) {
                setLicensingAgencies(updatedListDocs);
                saveOrder(updatedListDocs);
            }
        }
    }

    async function saveOrder(list: LicensingAgency[]) {
        list.forEach(async (doc, index) => {
            try {
                await api.put(`licensings/agencies/${doc.id}`, {
                    name: doc.name,
                    order: index
                });

                handleListAgencies();
            }
            catch (err) {
                console.log('error to save licensings agencies order');
                console.log(err)
            }
        });
    }

    return <Container className="content-page">
        <Row>
            <Col>
                <Button variant="outline-success" onClick={handleShowModalNewAgency}>
                    <FaPlus /> Criar um orgão
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
                            licensingAgencies.length > 0 ? <Col>
                                <DragDropContext onDragEnd={handleOnDragEnd}>
                                    <Droppable droppableId="lines">
                                        {provided => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                <ListGroup>
                                                    {
                                                        licensingAgencies && licensingAgencies.map((agency, index) => {
                                                            return <Draggable key={agency.id} draggableId={agency.id} index={index}>
                                                                {(provided) => (
                                                                    <div
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        ref={provided.innerRef}
                                                                    >
                                                                        <LicensingAgencies
                                                                            agency={agency}
                                                                            listAgencies={licensingAgencies}
                                                                            handleListAgencies={handleListAgencies}
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
                                            <p style={{ color: 'var(--gray)' }}>Você ainda não tem nenhum orgão registrado.</p>
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

        <Modal show={showModalNewAgency} onHide={handleCloseModalAgency}>
            <Modal.Header closeButton>
                <Modal.Title>Criar um orgão</Modal.Title>
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
                        if (licensingAgencies) {
                            await api.post('licensings/agencies', {
                                name: values.name,
                                active: values.active,
                                order: licensingAgencies.length,
                            });

                            await handleListAgencies();

                            setTypeMessage("success");

                            setTimeout(() => {
                                setMessageShow(false);
                                handleCloseModalAgency();
                            }, 1500);
                        }
                    }
                    catch (err) {
                        setTypeMessage("error");

                        setTimeout(() => {
                            setMessageShow(false);
                        }, 4000);

                        console.log('error create licensings agencies.');
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
                                        <Button variant="secondary" onClick={handleCloseModalAgency}>
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