import { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import styles from './styles.module.css';

export let statusModal: 'waiting' | 'success' | 'warning' | 'error';

interface WaitingModalProps {
    status: 'waiting' | 'success' | 'warning' | 'error',
    message?: string;
}

const AlertMessage: React.FC<WaitingModalProps> = ({ status, message = "" }) => {
    const [circleWaiting, setCircleWaiting] = useState(true);
    const [successWaiting, setSuccessWaiting] = useState(false);
    const [warningWaiting, setWarningWaiting] = useState(false);
    const [errorWaiting, setErrorWaiting] = useState(false);
    const [variantColor, setVariantColor] = useState<"info" | "success" | "warning" | "danger">("info");

    useEffect(() => {
        handleAlert(status);
    }, [status, message]);

    function handleAlert(status: 'waiting' | 'success' | 'warning' | 'error') {
        if (status === 'waiting') {
            setVariantColor("info");
            setCircleWaiting(true);
            setSuccessWaiting(false);
            setErrorWaiting(false);
            return;
        }

        if (status === 'success') {
            setVariantColor("success");
            setCircleWaiting(false);
            setSuccessWaiting(true);
            return;
        }

        if (status === 'warning') {
            setVariantColor("warning");
            setCircleWaiting(false);
            setErrorWaiting(false);
            setWarningWaiting(true);
            return;
        }

        if (status === 'error') {
            setVariantColor("danger");
            setCircleWaiting(false);
            setSuccessWaiting(false);
            setErrorWaiting(true);
            return;
        }
    }

    return (
        <Alert className={styles.alertMessage} variant={variantColor}>
            {
                circleWaiting && <><Spinner animation="border" variant="info" size="sm" /> {!!message ? message : "aguarde..."} </>
            }
            {
                successWaiting && <><FaCheckCircle /> {!!message ? message : "sucesso!"}</>
            }
            {
                warningWaiting && <><FaTimesCircle /> {!!message ? message : "aviso!"}</>
            }
            {
                errorWaiting && <><FaTimesCircle /> {!!message ? message : "algo deu errado!"}</>
            }
        </Alert>
    )
}

export { AlertMessage };