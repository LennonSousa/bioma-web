import { useState } from 'react';
import { Button, Col, Form, ListGroup, Modal, Row } from 'react-bootstrap';
import { FaCheck, FaClock } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';

import api from '../../api/api';
import { Licensing } from '../Licensings';
import { AlertMessage, statusModal } from '../Interfaces/AlertMessage';

export interface EventLicensing {
    id: string;
    description: string;
    done: boolean;
    created_by: string;
    created_at: Date;
    updated_by: string;
    updated_at: Date;
    finished_at: Date;
    licensing: Licensing;
}

interface EventsLicensingProps {
    event: EventLicensing;
    handleListEvents?: () => Promise<void>;
    canEdit?: boolean;
}

const validationSchema = Yup.object().shape({
    description: Yup.string().required('Obrigatório!'),
});

const EventsLicensing: React.FC<EventsLicensingProps> = ({ event, handleListEvents, canEdit = true }) => {
    const [showModalEditEvent, setShowModalEditEvent] = useState(false);

    const handleCloseModalEditEvent = () => {
        setShowModalEditEvent(false);
        setIconDeleteConfirm(false);
        setIconDelete(true);
    }

    const handleShowModalEditStatus = () => setShowModalEditEvent(true);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

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
            await api.delete(`events/licensing/${event.id}`);

            handleCloseModalEditEvent();

            if (handleListEvents) handleListEvents();
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
                variant="light"
                action={canEdit}
                onClick={handleEdit}
            >
                <Row className="align-items-center">
                    <Col sm={10}>
                        <span className="text-wrap">{event.description}</span>
                    </Col>

                    <Col className="text-center">
                        <span>
                            {format(new Date(event.created_at), 'dd/MM/yyyy')}
                        </span>
                    </Col>
                </Row>
            </ListGroup.Item>

            <Modal show={showModalEditEvent} size="lg" onHide={handleCloseModalEditEvent}>
                <Modal.Header closeButton>
                    <Modal.Title>Edtiar evento</Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={
                        {
                            description: event.description,
                        }
                    }
                    onSubmit={async values => {
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        try {
                            await api.put(`events/licensing/${event.id}`, {
                                description: values.description,
                            });

                            if (handleListEvents) await handleListEvents();

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
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <Form onSubmit={handleSubmit}>
                            <Modal.Body>
                                <Form.Group controlId="eventFormGridDescription">
                                    <Form.Label>Descrição</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={6}
                                        style={{ resize: 'none' }}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.description}
                                        name="description"
                                        isInvalid={!!errors.description && touched.description}
                                    />
                                    <Form.Control.Feedback type="invalid">{touched.description && errors.description}</Form.Control.Feedback>
                                </Form.Group>

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

export default EventsLicensing;