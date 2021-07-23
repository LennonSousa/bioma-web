import { useState } from 'react';
import { Row, Col, ListGroup, Modal, Form, Button } from 'react-bootstrap';
import { FaPencilAlt, FaBars } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';

import api from '../../api/api';
import { Project } from '../Projects';
import { AlertMessage, statusModal } from '../interfaces/AlertMessage';

export interface ProjectLine {
    id: string;
    name: string;
    order: number;
    projects: Project[];
}

interface DocsPropertyProps {
    line: ProjectLine;
    listLines: ProjectLine[];
    handleListLines(): Promise<void>;
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    order: Yup.number().required(),
});

const ProjectLines: React.FC<DocsPropertyProps> = ({ line, listLines, handleListLines }) => {
    const [showModalEditLine, setShowModalEditLine] = useState(false);

    const handleCloseModalEditLine = () => { setShowModalEditLine(false); setIconDeleteConfirm(false); setIconDelete(true); }
    const handleShowModalEditLine = () => setShowModalEditLine(true);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    const [iconDelete, setIconDelete] = useState(true);
    const [iconDeleteConfirm, setIconDeleteConfirm] = useState(false);

    async function deleteLine() {
        if (iconDelete) {
            setIconDelete(false);
            setIconDeleteConfirm(true);

            return;
        }

        setTypeMessage("waiting");
        setMessageShow(true);

        try {
            await api.delete(`projects/lines/${line.id}`);

            const list = listLines.filter(item => { return item.id !== line.id });

            list.forEach(async (line, index) => {
                try {
                    await api.put(`projects/lines/${line.id}`, {
                        name: line.name,
                        order: index
                    });
                }
                catch (err) {
                    console.log('error to save lines order after deleting.');
                    console.log(err)
                }
            });

            handleCloseModalEditLine();

            handleListLines();
        }
        catch (err) {
            setIconDeleteConfirm(false);
            setIconDelete(true);

            setTypeMessage("error");

            setTimeout(() => {
                setMessageShow(false);
            }, 4000);

            console.log("Error to delete line");
            console.log(err);
        }
    }

    return (
        <ListGroup.Item variant="light">
            <Row className="align-items-center">
                <Col sm={1}>
                    <FaBars />
                </Col>

                <Col><span>{line.name}</span></Col>

                <Col className="text-end">
                    <Button variant="outline-success" className="button-link" onClick={handleShowModalEditLine}><FaPencilAlt /> Editar</Button>
                </Col>
            </Row>

            <Modal show={showModalEditLine} onHide={handleCloseModalEditLine}>
                <Modal.Header closeButton>
                    <Modal.Title>Edtiar item</Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={
                        {
                            name: line.name,
                            order: line.order,
                        }
                    }
                    onSubmit={async values => {
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        try {
                            if (listLines) {
                                await api.put(`projects/lines/${line.id}`, {
                                    name: values.name,
                                    order: line.order
                                });

                                await handleListLines();

                                setTypeMessage("success");

                                setTimeout(() => {
                                    setMessageShow(false);
                                    handleCloseModalEditLine();
                                }, 2000);
                            }
                        }
                        catch (err) {
                            console.log('error edit line.');
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
                                            <Button variant="secondary" onClick={handleCloseModalEditLine}>Cancelar</Button>
                                            <Button
                                                title="Excluir item"
                                                variant={iconDelete ? "outline-danger" : "outline-warning"}
                                                onClick={deleteLine}
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
        </ListGroup.Item>
    )
}

export default ProjectLines;