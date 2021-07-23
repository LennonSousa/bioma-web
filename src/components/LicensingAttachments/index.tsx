import { useEffect, useState } from 'react';
import { Accordion, AccordionButton, Card, Row, Col, ListGroup, Modal, Form, Button, Spinner, Table } from 'react-bootstrap';
import { FaHourglassHalf, FaHourglassEnd, FaPencilAlt, FaCloudDownloadAlt, FaFingerprint } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format, differenceInDays, formatDistanceToNow, isBefore, subDays } from 'date-fns';
import br from 'date-fns/locale/pt-BR';
import FileSaver from 'file-saver';

import api from '../../api/api';
import { Licensing } from '../Licensings';
import { LogLicensingAttachment } from '../LogsLicensingAttachment';
import { AlertMessage, statusModal } from '../Interfaces/AlertMessage';

export interface LicensingAttachment {
    id: string;
    name: string;
    path: string;
    received_at: Date;
    expire: boolean;
    expire_at: Date;
    schedule: boolean;
    schedule_at: Date;
    licensing: Licensing;
    logs: LogLicensingAttachment[];
}

interface LicensingAttachmentsProps {
    attachment: LicensingAttachment;
    canEdit?: boolean;
    handleListAttachments?: () => Promise<void>;
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!').max(50, 'Deve conter no máximo 50 caracteres!'),
    received_at: Yup.date().required('Obrigatório!'),
    expire: Yup.boolean().notRequired(),
    expire_at: Yup.date().required('Obrigatório!'),
    schedule: Yup.boolean().notRequired(),
    schedule_at: Yup.number().required('Obrigatório!'),
});

const LicensingAttachments: React.FC<LicensingAttachmentsProps> = ({ attachment, canEdit = true, handleListAttachments }) => {
    const [showModalEditDoc, setShowModalEditDoc] = useState(false);

    const handleCloseModalEditDoc = () => { setShowModalEditDoc(false); setIconDeleteConfirm(false); setIconDelete(true); }
    const handleShowModalEditDoc = () => setShowModalEditDoc(true);

    const [attachmentExpired, setAttachmentExpired] = useState(false);
    const [attachmentExpireTime, setAttachmentExpireTime] = useState('');

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");
    const [downloadingAttachment, setDownloadingAttachment] = useState(false);

    const [iconDelete, setIconDelete] = useState(true);
    const [iconDeleteConfirm, setIconDeleteConfirm] = useState(false);

    useEffect(() => {
        if (attachment.expire) {
            setAttachmentExpired(isBefore(new Date(attachment.expire_at), new Date()));

            setAttachmentExpireTime(formatDistanceToNow(new Date(attachment.expire_at), { addSuffix: true, locale: br }));
        }
    }, [attachment.expire, attachment.expire_at]);

    async function handleDownloadAttachment() {
        setDownloadingAttachment(true);

        try {
            const res = await api.get(`licensings/attachments/${attachment.id}`,
                { responseType: "blob" }
            );

            const fileName = `${attachment.licensing.id.replace('.', '')} - ${attachment.name.replace('.', '')}`;

            FileSaver.saveAs(res.data, fileName);
        }
        catch (err) {
            console.log("Error to get attachment");
            console.log(err);
        }

        setDownloadingAttachment(false);
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
            await api.delete(`licensings/attachments/${attachment.id}`);

            handleCloseModalEditDoc();

            if (handleListAttachments) handleListAttachments();
        }
        catch (err) {
            setIconDeleteConfirm(false);
            setIconDelete(true);

            setTypeMessage("error");
            setMessageShow(true);

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

                    <Col sm={1} className="text-right">
                        <Button
                            variant="outline-success"
                            className="button-link"
                            onClick={handleDownloadAttachment}
                            title="Baixar o anexo."
                        >
                            {downloadingAttachment ? <Spinner animation="border" variant="success" size="sm" /> : <FaCloudDownloadAlt />}
                        </Button>
                    </Col>

                    {
                        canEdit && <Col sm={2} className="text-right">
                            <Button
                                variant="outline-success"
                                className="button-link"
                                onClick={handleShowModalEditDoc}
                                title="Editar o anexo."
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
                            schedule: attachment.schedule,
                            schedule_at: differenceInDays(new Date(attachment.expire_at), new Date(attachment.schedule_at)),
                        }
                    }
                    onSubmit={async values => {
                        setTypeMessage("waiting");
                        setMessageShow(true);

                        const scheduleAt = format(subDays(new Date(`${values.expire_at} 12:00:00`), values.schedule_at), 'yyyy-MM-dd');

                        try {
                            await api.put(`licensings/attachments/${attachment.id}`, {
                                name: values.name,
                                received_at: `${values.received_at} 12:00:00`,
                                expire: values.expire,
                                expire_at: `${values.expire_at} 12:00:00`,
                                schedule: values.schedule,
                                schedule_at: `${scheduleAt} 12:00:00`,
                            });

                            if (handleListAttachments) await handleListAttachments();

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
                                            title="Baixar o anexo."
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
                                    values.expire && <>
                                        <Row className="mb-3">
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
                                        </Row>

                                        <Form.Group className="mb-3" controlId="formGridSchedule">
                                            <Form.Switch
                                                label="Notificar"
                                                checked={values.schedule}
                                                onChange={() => { setFieldValue('schedule', !values.schedule) }}
                                            />
                                        </Form.Group>

                                        {
                                            values.schedule && <Row className="mb-3">
                                                <Form.Group as={Col} sm={3} controlId="formGridScheduleAt">
                                                    <Form.Label>Dias antes</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.schedule_at}
                                                        name="schedule_at"
                                                        isInvalid={!!errors.schedule_at && touched.schedule_at}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{touched.schedule_at && errors.schedule_at}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Row>
                                        }
                                    </>
                                }

                                <Accordion>
                                    <Card>
                                        <Card.Header>
                                            <AccordionButton as={Card.Header} variant="link" eventKey="0">
                                                <h6 className="text-success">Acessos <FaFingerprint /></h6>
                                            </AccordionButton>
                                        </Card.Header>
                                        <Accordion.Collapse eventKey="0">
                                            <Card.Body>
                                                <Table striped hover size="sm" responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>Data</th>
                                                            <th>Usuário</th>
                                                            <th>Acesso</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            attachment.logs.map(log => {
                                                                let action = 'Criação';

                                                                if (log.action === 'view') action = 'Download';
                                                                else if (log.action === 'update') action = 'Edição';

                                                                return <tr key={log.id}>
                                                                    <td>{format(new Date(log.accessed_at), 'dd/MM/yyyy HH:mm')}</td>
                                                                    <td>{log.user}</td>
                                                                    <td>{action}</td>
                                                                </tr>
                                                            })
                                                        }
                                                    </tbody>
                                                </Table>
                                            </Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                </Accordion>

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

export default LicensingAttachments;