import { useState } from 'react';
import { Row, Col, ListGroup, Modal, Form, Button } from 'react-bootstrap';
import { FaPencilAlt, FaBars } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';

import api from '../../services/api';
import { Licensing } from '../Licensings';
import { AlertMessage, statusModal } from '../interfaces/AlertMessage';

export interface LicensingAuthorization {
    id: string;
    department: string;
    activity: string,
    sub_activity: string,
    order: number;
    licensings: Licensing[];
}

interface LicensingAuthorizationProps {
    authorization: LicensingAuthorization;
    listAuthorizations: LicensingAuthorization[];
    handleListAuthorizations(): Promise<void>;
}

const validationSchema = Yup.object().shape({
    department: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    activity: Yup.string().notRequired().nullable(),
    sub_activity: Yup.string().notRequired().nullable(),
    order: Yup.number().required(),
});

const LicensingAuthorizations: React.FC<LicensingAuthorizationProps> = ({ authorization, listAuthorizations, handleListAuthorizations }) => {
    const [showModalEditAuthorization, setShowModalEditAuthorization] = useState(false);

    const handleCloseModalEditAuthorization = () => {
        setShowModalEditAuthorization(false);
        setIconDeleteConfirm(false);
        setIconDelete(true);
    }
    const handleShowModalEditAuthorization = () => setShowModalEditAuthorization(true);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

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
            await api.delete(`licensings/authorizations/${authorization.id}`);

            const list = listAuthorizations.filter(item => { return item.id !== authorization.id });

            list.forEach(async (authorization, index) => {
                try {
                    await api.put(`licensings/authorizations/${authorization.id}`, {
                        department: authorization.department,
                        order: index
                    });
                }
                catch (err) {
                    console.log('error to save authorizations order after deleting.');
                    console.log(err)
                }
            });

            handleCloseModalEditAuthorization();

            handleListAuthorizations();
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

                <Col><span>{authorization.department}</span></Col>

                <Col className="text-end">
                    <Button variant="outline-success" className="button-link" onClick={handleShowModalEditAuthorization}><FaPencilAlt /> Editar</Button>
                </Col>
            </Row>

            <Modal show={showModalEditAuthorization} onHide={handleCloseModalEditAuthorization}>
                <Modal.Header closeButton>
                    <Modal.Title>Edtiar autorização</Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={
                        {
                            department: authorization.department,
                            activity: authorization.activity,
                            sub_activity: authorization.sub_activity,
                            order: authorization.order,
                        }
                    }
                    onSubmit={async values => {
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        try {
                            if (listAuthorizations) {
                                await api.put(`licensings/authorizations/${authorization.id}`, {
                                    department: values.department,
                                    activity: values.activity,
                                    sub_activity: values.sub_activity,
                                    order: authorization.order
                                });

                                await handleListAuthorizations();

                                setTypeMessage("success");

                                setTimeout(() => {
                                    setMessageShow(false);
                                    handleCloseModalEditAuthorization();
                                }, 2000);
                            }
                        }
                        catch (err) {
                            console.log('error edit authorizations.');
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
                                            <Button variant="secondary" onClick={handleCloseModalEditAuthorization}>Cancelar</Button>
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

export default LicensingAuthorizations;