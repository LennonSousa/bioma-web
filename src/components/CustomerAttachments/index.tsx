import { ChangeEvent, useEffect, useState } from 'react';
import { Row, Col, ListGroup, Modal, Form, Button, Spinner } from 'react-bootstrap';
import { FaHourglassHalf, FaHourglassEnd, FaPencilAlt, FaCloudDownloadAlt, FaPlus } from 'react-icons/fa';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import br from 'date-fns/locale/pt-BR';

import api from '../../services/api';
import { Customer } from '../Customers';
import { AlertMessage, statusModal } from '../interfaces/AlertMessage';

import styles from './styles.module.css';

export interface CustomerAttachment {
    id: string;
    name: string;
    path: string;
    received_at: Date;
    expire: boolean;
    expire_at: Date;
    renewal: string;
    customer: Customer;
}

interface CustomerAttachmentsProps {
    attachment: CustomerAttachment;
    handleListAttachments(): Promise<void>;
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    path: Yup.string().required('Obrigatório!'),
    received_at: Yup.date().required('Obrigatório!'),
    expire: Yup.boolean().notRequired(),
    expire_at: Yup.date().required('Obrigatório!'),
    renewal: Yup.string().notRequired(),
    customer: Yup.string().required('Obrigatório!'),
});

const CustomerAttachments: React.FC<CustomerAttachmentsProps> = ({ attachment, handleListAttachments }) => {
    const [showModalEditDoc, setShowModalEditDoc] = useState(false);

    const handleCloseModalEditDoc = () => { setShowModalEditDoc(false); setIconDeleteConfirm(false); setIconDelete(true); }
    const handleShowModalEditDoc = () => setShowModalEditDoc(true);

    const [attachmentExpired, setAttachmentExpired] = useState(false);
    const [attachmentExpireTime, setAttachmentExpireTime] = useState('');

    const [fileToSave, setFileToSave] = useState<File>();
    const [filePreview, setFilePreview] = useState('');

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [iconDelete, setIconDelete] = useState(true);
    const [iconDeleteConfirm, setIconDeleteConfirm] = useState(false);

    useEffect(() => {
        if (attachment.expire && attachment.expire_at && isAfter(attachment.expire_at, new Date())) {
            setAttachmentExpired(true);
            setAttachmentExpireTime(formatDistanceToNow(attachment.expire_at, { addSuffix: true, locale: br }))
        }
    }, []);

    async function handleDownloadAttachment() {
        try {
        }
        catch (err) {
            console.log("Error to pause category");
            console.log(err);
        }
    }

    function handleImages(event: ChangeEvent<HTMLInputElement>) {
        const image = event.target.files[0];

        setFileToSave(image);

        const imagesToPreview = image.name;

        setFilePreview(imagesToPreview);
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
            await api.delete(`docs/customer/${attachment.id}`);

            handleCloseModalEditDoc();

            handleListAttachments();
        }
        catch (err) {
            setIconDeleteConfirm(false);
            setIconDelete(true);

            setTypeMessage("error");

            setTimeout(() => {
                setMessageShow(false);
            }, 4000);

            console.log("Error to delete product");
            console.log(err);
        }
    }

    return (
        <ListGroup.Item variant={attachmentExpired ? "warning" : "light"}>
            <Row>
                <Col><span>{attachment.name}</span></Col>

                <Col sm={3}>
                    {
                        attachmentExpired ? <>Expirado {attachmentExpireTime} <FaHourglassEnd /></> :
                            <>Expira {attachmentExpireTime} <FaHourglassHalf /> </>
                    }
                </Col>

                <Col sm={1} className="text-right">
                    <Button variant="outline-danger" className="button-link" onClick={handleDownloadAttachment}><FaCloudDownloadAlt /></Button>
                </Col>

                <Col sm={2} className="text-right">
                    <Button variant="outline-danger" className="button-link" onClick={handleShowModalEditDoc}><FaPencilAlt /> Editar</Button>
                </Col>
            </Row>

            <Modal show={showModalEditDoc} onHide={handleCloseModalEditDoc}>
                <Modal.Header closeButton>
                    <Modal.Title>Edtiar anexo</Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={
                        {
                            name: attachment.name,
                            path: attachment.path,
                            received_at: format(attachment.received_at, 'yyyy-MM-dd'),
                            expire: attachment.expire,
                            expire_at: format(attachment.expire_at, 'yyyy-MM-dd'),
                            renewal: attachment.renewal,
                        }
                    }
                    onSubmit={async values => {
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        try {
                            await api.put(`docs/customer/${attachment.id}`, {
                                name: values.name,
                                path: values.path,
                                received_at: values.received_at,
                                expire: values.expire,
                                expire_at: values.expire_at,
                                renewal: values.renewal,
                            });

                            await handleListAttachments();

                            setTypeMessage("success");

                            setTimeout(() => {
                                setMessageShow(false);
                                handleCloseModalEditDoc();
                            }, 2000);
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
                                <Form.Group controlId="attachmentFormGridName">
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

                                <Row className="mb-3">
                                    <label htmlFor="fileAttachement" className={styles.productImageButton}>
                                        <Row>
                                            <Col>
                                                <FaPlus />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col>
                                                Anexo
                                        </Col>
                                        </Row>
                                        <input
                                            type="file" accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf"
                                            onChange={handleImages}
                                            id="fileAttachement"
                                        />
                                    </label>
                                    <label>{filePreview}</label>
                                </Row>

                                <Row className="mb-3">
                                    <Form.Group as={Col} sm={4} controlId="formGridReceivedAt">
                                        <Form.Label>Data do recebimento</Form.Label>
                                        <Form.Control
                                            type="date"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.received_at}
                                            name="received_at"
                                            isInvalid={!!errors.received_at && touched.received_at}
                                        />
                                        <Form.Control.Feedback type="invalid">{touched.received_at && errors.received_at}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group as={Col} sm={4} controlId="formGridExpire">
                                        <label>
                                            <Field type="checkbox" name="expire" /> Expira?
                                        </label>
                                    </Form.Group>

                                    {
                                        values.expire && <Form.Group as={Col} sm={4} controlId="formGridExpireAt">
                                            <Form.Label>Nascimento</Form.Label>
                                            <Form.Control
                                                type="date"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.expire_at}
                                                name="expire_at"
                                                isInvalid={!!errors.expire_at && touched.expire_at}
                                            />
                                            <Form.Control.Feedback type="invalid">{touched.expire_at && errors.expire_at}</Form.Control.Feedback>
                                        </Form.Group>
                                    }
                                </Row>

                                <Row className="mb-3">
                                    <Form.Group as={Col} sm={2} controlId="formGridName">
                                        <Form.Label>Dias para renovar</Form.Label>
                                        <Form.Control
                                            type="number"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={Number(values.renewal)}
                                            name="renewal"
                                            isInvalid={!!errors.renewal && touched.renewal}
                                        />
                                        <Form.Control.Feedback type="invalid">{touched.name && errors.name}</Form.Control.Feedback>
                                    </Form.Group>
                                </Row>
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

export default CustomerAttachments;