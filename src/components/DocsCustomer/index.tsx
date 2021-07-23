import { useState } from 'react';
import { Row, Col, ListGroup, Modal, Form, Button, Spinner } from 'react-bootstrap';
import { FaPause, FaPlay, FaPencilAlt, FaBars } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';

import api from '../../api/api';
import { AlertMessage, statusModal } from '../Interface/AlertMessage';

export interface DocsCustomer {
    id: string;
    name: string;
    active: boolean;
    order: number;
}

interface DocsCustomerProps {
    doc: DocsCustomer;
    listDocs: DocsCustomer[];
    handleListDocs(): Promise<void>;
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    active: Yup.boolean(),
    order: Yup.number().required(),
});

const DocsCustomer: React.FC<DocsCustomerProps> = ({ doc, listDocs, handleListDocs }) => {
    const [showModalEditDoc, setShowModalEditDoc] = useState(false);

    const handleCloseModalEditDoc = () => { setShowModalEditDoc(false); setIconDeleteConfirm(false); setIconDelete(true); }
    const handleShowModalEditDoc = () => setShowModalEditDoc(true);

    const [categoryPausing, setCategoryPausing] = useState(false);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    const [iconDelete, setIconDelete] = useState(true);
    const [iconDeleteConfirm, setIconDeleteConfirm] = useState(false);

    const togglePauseCategory = async () => {
        setCategoryPausing(true);

        try {
            await api.put(`docs/customer/${doc.id}`, {
                name: doc.name,
                active: !doc.active,
                order: doc.order,
            });

            await handleListDocs();
        }
        catch (err) {
            console.log("Error to pause category");
            console.log(err);
        }

        setCategoryPausing(false);
    }

    async function deleteProduct() {
        if (iconDelete) {
            setIconDelete(false);
            setIconDeleteConfirm(true);

            return;
        }

        setTypeMessage("waiting");
        setMessageShow(true);

        try {
            await api.delete(`docs/customer/${doc.id}`);

            const list = listDocs.filter(item => { return item.id !== doc.id });

            list.forEach(async (doc, index) => {
                try {
                    await api.put(`docs/customer/${doc.id}`, {
                        name: doc.name,
                        active: doc.active,
                        order: index
                    });
                }
                catch (err) {
                    console.log('error to save docs order after deleting.');
                    console.log(err)
                }
            });

            handleCloseModalEditDoc();

            handleListDocs();
        }
        catch (err) {
            setIconDeleteConfirm(false);
            setIconDelete(true);

            setTypeMessage("error");

            setTimeout(() => {
                setMessageShow(false);
            }, 1000);

            console.log("Error to delete product");
            console.log(err);
        }
    }

    return (
        <ListGroup.Item variant={doc.active ? "light" : "danger"}>
            <Row className="align-items-center">
                <Col sm={1}>
                    <FaBars />
                </Col>

                <Col><span>{doc.name}</span></Col>

                <Col className="text-end">
                    <Button
                        variant="outline-success"
                        className="button-link"
                        onClick={togglePauseCategory}>
                        {
                            categoryPausing ? <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            /> : doc.active ? (<><FaPause /> Pausar</>) : (<><FaPlay /> Pausado</>)
                        }
                    </Button>
                </Col>

                <Col className="text-end">
                    <Button variant="outline-success" className="button-link" onClick={handleShowModalEditDoc}><FaPencilAlt /> Editar</Button>
                </Col>
            </Row>

            <Modal show={showModalEditDoc} onHide={handleCloseModalEditDoc}>
                <Modal.Header closeButton>
                    <Modal.Title>Edtiar documento</Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={
                        {
                            name: doc.name,
                            active: doc.active,
                            order: doc.order,
                        }
                    }
                    onSubmit={async values => {
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        try {
                            if (listDocs) {
                                await api.put(`docs/customer/${doc.id}`, {
                                    name: values.name,
                                    active: doc.active,
                                    order: doc.order
                                });

                                await handleListDocs();

                                setTypeMessage("success");

                                setTimeout(() => {
                                    setMessageShow(false);
                                    handleCloseModalEditDoc();
                                }, 2000);
                            }
                        }
                        catch (err) {
                            console.log('error create category.');
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
                                            <Button variant="secondary" onClick={handleCloseModalEditDoc}>Cancelar</Button>
                                            <Button
                                                title="Delete product"
                                                variant={iconDelete ? "outline-danger" : "outline-warning"}
                                                onClick={deleteProduct}
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

export default DocsCustomer;