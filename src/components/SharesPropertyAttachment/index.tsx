import { useState } from 'react';
import { Row, Col, ListGroup, Button } from 'react-bootstrap';
import { format, isAfter } from 'date-fns';

import api from '../../api/api';
import { PropertyAttachment } from '../PropertyAttachments';
import { AlertMessage, statusModal } from '../Interfaces/AlertMessage';

export interface SharePropertyAttachment {
    id: string;
    email: string;
    expire_at: Date;
    activated: boolean;
    activated_at: Date;
    created_by: string;
    created_at: Date;
    attachment: PropertyAttachment[];
}

interface SharePropertyAttachmentsProps {
    shareAttachment: SharePropertyAttachment;
    handleListAttachments?: () => Promise<void>;
}

const SharePropertyAttachments: React.FC<SharePropertyAttachmentsProps> = ({ shareAttachment, handleListAttachments }) => {
    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    const [iconDelete, setIconDelete] = useState(true);
    const [iconDeleteConfirm, setIconDeleteConfirm] = useState(false);

    async function deleteProduct() {
        if (iconDelete) {
            setIconDelete(false);
            setIconDeleteConfirm(true);

            return;
        }

        setTypeMessage("waiting");
        setMessageShow(true);

        try {
            await api.delete(`shares/properties/${shareAttachment.id}`);

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

            console.log("Error to delete share property attachment");
            console.log(err);
        }
    }

    return (
        <ListGroup.Item variant="light">
            <Row className="mb-1 align-items-center">
                <Col><span>{shareAttachment.email}</span></Col>

                <Col>
                    <span>
                        {isAfter(new Date(), new Date(shareAttachment.expire_at)) ? `Expirado em: ` : `Expira em: `}{format(new Date(shareAttachment.expire_at), 'dd/MM/yyyy')}
                    </span>
                </Col>
            </Row>

            <Row className="mb-1 align-items-center">
                {
                    shareAttachment.activated && <Col>
                        <span>
                            {`Acessado em: ${format(new Date(shareAttachment.activated_at), 'dd/MM/yyyy')}`}
                        </span>
                    </Col>
                }
            </Row>

            <Row className="mb-1 align-items-center">
                <Col>
                    <span>
                        {`Criado por: ${shareAttachment.created_by}`}
                    </span>
                </Col>

                <Col><span>{`Compartilhado em: ${format(new Date(shareAttachment.created_at), 'dd/MM/yyyy')}`}</span></Col>
            </Row>

            <Row className="justify-content-end">
                <Col className="col-row">
                    {
                        messageShow ? <AlertMessage status={typeMessage} /> :
                            <Button
                                title="Excluir compartilhamento."
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
                    }
                </Col>
            </Row>
        </ListGroup.Item>
    )
}

export default SharePropertyAttachments;