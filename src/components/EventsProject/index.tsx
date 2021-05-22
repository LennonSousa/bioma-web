import { useState } from 'react';
import { Button, Col, Form, ListGroup, Modal, Row } from 'react-bootstrap';
import { FaCheck, FaClock, FaPencilAlt } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';

import api from '../../services/api';
import { Project } from '../Projects';
import { AlertMessage, statusModal } from '../interfaces/AlertMessage';

export interface EventProject {
    id: string;
    description: string;
    done: boolean;
    created_by: string;
    created_at: Date;
    updated_by: string;
    updated_at: Date;
    finished_at: Date;
    project: Project;
}

interface EventsProjectProps {
    event: EventProject;
    handleListEvents(): Promise<void>;
    canEdit?: boolean;
}

const validationSchema = Yup.object().shape({
    description: Yup.string().required('Obrigatório!'),
    done: Yup.boolean().required('Obrigatório!'),
    finished_at: Yup.date().notRequired(),
});

const EventsProject: React.FC<EventsProjectProps> = ({ event, handleListEvents, canEdit = true }) => {
    const [showModalEditEvent, setShowModalEditEvent] = useState(false);

    const handleCloseModalEditEvent = () => {
        setShowModalEditEvent(false);
        setIconDeleteConfirm(false);
        setIconDelete(true);
    }

    const handleShowModalEditStatus = () => setShowModalEditEvent(true);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [iconDelete, setIconDelete] = useState(true);
    const [iconDeleteConfirm, setIconDeleteConfirm] = useState(false);

    async function deleteStatus() {
        if (iconDelete) {
            setIconDelete(false);
            setIconDeleteConfirm(true);

            return;
        }

        setTypeMessage("waiting");
        setMessageShow(true);

        try {
            await api.delete(`events/project/${event.id}`);

            handleCloseModalEditEvent();

            handleListEvents();
        }
        catch (err) {
            setIconDeleteConfirm(false);
            setIconDelete(true);

            setTypeMessage("error");

            setTimeout(() => {
                setMessageShow(false);
            }, 4000);

            console.log("Error to delete event");
            console.log(err);
        }
    }

    function handleEdit() {
        canEdit && handleShowModalEditStatus();
    }

    return (
        <>
            <ListGroup.Item
                variant={event.done ? 'success' : 'light'}
                action={canEdit}
                onClick={handleEdit}
            >
                <Row className="align-items-center">
                    <Col sm={5}>
                        <span className="text-wrap">{event.description}</span>
                    </Col>

                    <Col className="text-center">
                        <span>
                            {format(new Date(event.created_at), 'dd/MM/yyyy')}
                        </span>
                    </Col>

                    <Col className="text-center">
                        <span>
                            {event.done && <FaCheck />}
                        </span>
                    </Col>

                    <Col className="text-center">
                        <span>
                            {event.done && format(new Date(event.finished_at), 'dd/MM/yyyy')}
                        </span>
                    </Col>
                </Row>
            </ListGroup.Item>

            <Modal show={showModalEditEvent} onHide={() => handleCloseModalEditEvent()}>
                <Modal.Header closeButton>
                    <Modal.Title>Edtiar evento</Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={
                        {
                            description: event.description,
                            done: event.done,
                            finished_at: format(new Date(event.finished_at), 'yyyy-MM-dd'),
                        }
                    }
                    onSubmit={async values => {
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        try {
                            await api.put(`events/project/${event.id}`, {
                                description: values.description,
                                done: values.done,
                                finished_at: values.finished_at,
                            });

                            await handleListEvents();

                            setTypeMessage("success");

                            setTimeout(() => {
                                setMessageShow(false);
                                handleCloseModalEditEvent();
                            }, 1000);
                        }
                        catch (err) {
                            console.log('error edit event.');
                            console.log(err);

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
                            <Modal.Body>
                                <Row className="mb-3">
                                    <Form.Group controlId="eventFormGridDescription">
                                        <Form.Label>Descrição</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            style={{ resize: 'none' }}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.description}
                                            name="description"
                                            isInvalid={!!errors.description && touched.description}
                                        />
                                        <Form.Control.Feedback type="invalid">{touched.description && errors.description}</Form.Control.Feedback>
                                        <span>{errors.description}</span>
                                        <span>{errors.done}</span>
                                        <span>{errors.finished_at}</span>
                                    </Form.Group>
                                </Row>

                                <Row className="mb-3">
                                    <Button
                                        variant={values.done ? 'success' : 'secondary'}
                                        type="button"
                                        onClick={() => {
                                            setFieldValue('done', !values.done);
                                            setFieldValue('finished_at', new Date());
                                        }}
                                    >
                                        {
                                            values.done ? <span><FaCheck /> concluído</span> :
                                                <span><FaClock /> marcar como concluído</span>
                                        }
                                    </Button>
                                </Row>

                            </Modal.Body>
                            <Modal.Footer>
                                {
                                    messageShow ? <AlertMessage status={typeMessage} /> :
                                        <>
                                            <Button variant="secondary" onClick={() => handleCloseModalEditEvent()}>Cancelar</Button>
                                            <Button
                                                title="Excluir item"
                                                variant={iconDelete ? "outline-danger" : "outline-warning"}
                                                onClick={deleteStatus}
                                            >
                                                {
                                                    iconDelete && "Excluir"
                                                }

                                                {
                                                    iconDeleteConfirm && "Confirmar"
                                                }
                                            </Button>
                                            <Button variant="success" type="submit">Salvar</Button>
                                        </>

                                }
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    )
}

export default EventsProject;