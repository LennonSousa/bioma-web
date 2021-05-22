import { ChangeEvent, useEffect, useState } from 'react';
import { Row, Col, ListGroup, Modal, Form, Button } from 'react-bootstrap';
import { FaHourglassHalf, FaHourglassEnd, FaPencilAlt, FaCloudDownloadAlt } from 'react-icons/fa';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import { format, formatDistanceToNow, isBefore } from 'date-fns';
import br from 'date-fns/locale/pt-BR';

import api from '../../services/api';
import { Customer } from '../Customers';
import { AlertMessage, statusModal } from '../interfaces/AlertMessage';

export interface CustomerAttachment {
    id: string;
    name: string;
    path: string;
    received_at: Date;
    expire: boolean;
    expire_at: Date;
    renewal: number;
    customer: Customer;
}

interface CustomerAttachmentsProps {
    attachment: CustomerAttachment;
    canEdit?: boolean;
    handleListAttachments(): Promise<void>;
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    received_at: Yup.date().required('Obrigatório!'),
    expire: Yup.boolean().notRequired(),
    expire_at: Yup.date().required('Obrigatório!'),
    renewal: Yup.string().notRequired(),
});

const CustomerAttachments: React.FC<CustomerAttachmentsProps> = ({ attachment, canEdit = true, handleListAttachments }) => {
    const [showModalEditDoc, setShowModalEditDoc] = useState(false);

    const handleCloseModalEditDoc = () => { setShowModalEditDoc(false); setIconDeleteConfirm(false); setIconDelete(true); }
    const handleShowModalEditDoc = () => setShowModalEditDoc(true);

    const [attachmentExpired, setAttachmentExpired] = useState(false);
    const [attachmentExpireTime, setAttachmentExpireTime] = useState('');

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    const [iconDelete, setIconDelete] = useState(true);
    const [iconDeleteConfirm, setIconDeleteConfirm] = useState(false);

    useEffect(() => {
        if (attachment.expire) {
            if (attachment.expire_at && isBefore(new Date(attachment.expire_at), new Date()))
                setAttachmentExpired(true);

            setAttachmentExpireTime(formatDistanceToNow(new Date(attachment.expire_at), { addSuffix: true, locale: br }));
        }
    }, [attachment.expire, attachment.expire_at, attachmentExpired]);

    async function handleDownloadAttachment() {
        try {
        }
        catch (err) {
            console.log("Error to pause category");
            console.log(err);
        }
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
            await api.delete(`customers/attachments/${attachment.id}`);

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
        <>
            <ListGroup.Item variant={attachmentExpired ? "warning" : "light"}>
                <Row className="align-items-center">
                    <Col><span>{attachment.name}</span></Col>

                    <Col sm={3}>
                        {
                            attachment.expire && (
                                attachmentExpired ? <><FaHourglassEnd /> Expirado {attachmentExpireTime}</> :
                                    <><FaHourglassHalf /> Expira {attachmentExpireTime}</>
                            )
                        }
                    </Col>

                    <Col sm={3} className="text-right">
                        {attachment.expire && `${attachment.renewal} ${Number(attachment.renewal) === 1 ? `dia` : `dias`} para renovar`}
                    </Col>

                    <Col sm={1} className="text-right">
                        <Button variant="outline-success" className="button-link" onClick={handleDownloadAttachment}><FaCloudDownloadAlt /></Button>
                    </Col>

                    {
                        canEdit && <Col sm={2} className="text-right">
                            <Button
                                variant="outline-success"
                                className="button-link"
                                onClick={handleShowModalEditDoc}
                            >
                                <FaPencilAlt /> Editar
                            </Button>
                        </Col>
                    }
                </Row>
            </ListGroup.Item>

            <Modal show={showModalEditDoc} onHide={handleCloseModalEditDoc}>
                <Modal.Header closeButton>
                    <Modal.Title>Edtiar anexo</Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={
                        {
                            name: attachment.name,
                            received_at: format(new Date(attachment.received_at), 'yyyy-MM-dd'),
                            expire: attachment.expire,
                            expire_at: format(new Date(attachment.expire_at), 'yyyy-MM-dd'),
                            renewal: attachment.renewal,
                        }
                    }
                    onSubmit={async values => {
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        try {
                            await api.put(`customers/attachments/${attachment.id}`, {
                                name: values.name,
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
                            }, 1000);
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
                    {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                        <Form onSubmit={handleSubmit}>
                            <Modal.Body>
                                <Row className="align-items-end mb-3">
                                    <Form.Group as={Col} sm={10} controlId="formGridName">
                                        <Form.Label>Nome do anexo</Form.Label>
                                        <Form.Control type="text"
                                            placeholder="Nome"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.name}
                                            name="name"
                                            isInvalid={!!errors.name && touched.name}
                                        />
                                        <Form.Control.Feedback type="invalid">{touched.name && errors.name}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group as={Col} sm={2} controlId="formGridReceivedAt">
                                        <Button
                                            variant="outline-success"
                                            className="button-link"
                                            onClick={handleDownloadAttachment}
                                        >
                                            <FaCloudDownloadAlt />
                                        </Button>
                                    </Form.Group>
                                </Row>

                                <Form.Group as={Row} controlId="formGridReceivedAt">
                                    <Form.Label column sm={7}>Data do recebimento</Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            type="date"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.received_at}
                                            name="received_at"
                                            isInvalid={!!errors.received_at && touched.received_at}
                                        />
                                        <Form.Control.Feedback type="invalid">{touched.received_at && errors.received_at}</Form.Control.Feedback>
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formGridExpire">
                                    <Form.Switch
                                        label="Expira?"
                                        checked={values.expire}
                                        onChange={() => { setFieldValue('expire', !values.expire) }}
                                    />
                                </Form.Group>

                                {
                                    values.expire && <Row className="mb-3">
                                        <Form.Group as={Col} sm={6} controlId="formGridExpireAt">
                                            <Form.Label>Data de expiração</Form.Label>
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

                                        <Form.Group as={Col} sm={6} controlId="formGridName">
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
                                }
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
        </>
    )
}

export default CustomerAttachments;