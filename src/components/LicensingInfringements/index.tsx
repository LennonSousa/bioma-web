import { useState } from 'react';
import { Row, Col, ListGroup, Modal, Form, Button } from 'react-bootstrap';
import { FaPencilAlt, FaBars } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';

import api from '../../api/api';
import { Licensing } from '../Licensings';
import { AlertMessage, statusModal } from '../Interfaces/AlertMessage';

export interface LicensingInfringement {
    id: string;
    name: string;
    order: number;
    licensings: Licensing[];
}

interface DocsPropertyProps {
    infringement: LicensingInfringement;
    listInfringements: LicensingInfringement[];
    handleListInfringements(): Promise<void>;
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    order: Yup.number().required(),
});

const LicensingInfringements: React.FC<DocsPropertyProps> = ({ infringement, listInfringements, handleListInfringements }) => {
    const [showModalEditInfringement, setShowModalEditInfringement] = useState(false);

    const handleCloseModalEditInfringement = () => {
        setShowModalEditInfringement(false);
        setIconDeleteConfirm(false);
        setIconDelete(true);
    }
    const handleShowModalEditInfringement = () => setShowModalEditInfringement(true);

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
            await api.delete(`licensings/infringements/${infringement.id}`);

            const list = listInfringements.filter(item => { return item.id !== infringement.id });

            list.forEach(async (infringement, index) => {
                try {
                    await api.put(`licensings/infringements/${infringement.id}`, {
                        name: infringement.name,
                        order: index
                    });
                }
                catch (err) {
                    console.log('error to save infringements order after deleting.');
                    console.log(err)
                }
            });

            handleCloseModalEditInfringement();

            handleListInfringements();
        }
        catch (err) {
            setIconDeleteConfirm(false);
            setIconDelete(true);

            setTypeMessage("error");

            setTimeout(() => {
                setMessageShow(false);
            }, 4000);

            console.log("Error to delete infringements");
            console.log(err);
        }
    }

    return (
        <ListGroup.Item variant="light">
            <Row className="align-items-center">
                <Col sm={1}>
                    <FaBars />
                </Col>

                <Col><span>{infringement.name}</span></Col>

                <Col className="text-end">
                    <Button variant="outline-success" className="button-link" onClick={handleShowModalEditInfringement}><FaPencilAlt /> Editar</Button>
                </Col>
            </Row>

            <Modal show={showModalEditInfringement} onHide={handleCloseModalEditInfringement}>
                <Modal.Header closeButton>
                    <Modal.Title>Edtiar infração</Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={
                        {
                            name: infringement.name,
                            order: infringement.order,
                        }
                    }
                    onSubmit={async values => {
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        try {
                            if (listInfringements) {
                                await api.put(`licensings/infringements/${infringement.id}`, {
                                    name: values.name,
                                    order: infringement.order
                                });

                                await handleListInfringements();

                                setTypeMessage("success");

                                setTimeout(() => {
                                    setMessageShow(false);
                                    handleCloseModalEditInfringement();
                                }, 1000);
                            }
                        }
                        catch (err) {
                            console.log('error edit infringements.');
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
                                            <Button variant="secondary" onClick={handleCloseModalEditInfringement}>Cancelar</Button>
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

export default LicensingInfringements;