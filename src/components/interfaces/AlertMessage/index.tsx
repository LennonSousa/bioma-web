import { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import styles from './styles.module.css';

export let statusModal: 'waiting' | 'success' | 'error';

interface WaitingModalProps {
    status: 'waiting' | 'success' | 'error',
    message?: string;
}

const AlertMessage: React.FC<WaitingModalProps> = ({ status, message = "" }) => {
    const [circleWaiting, setCircleWaiting] = useState(true);
    const [successWaiting, setSuccessWaiting] = useState(false);
    const [errorWaiting, setErrorWaiting] = useState(false);
    const [variantColor, setVariantColor] = useState<"info" | "success" | "danger">("info");

    useEffect(() => {
        handleAlert(status);
    }, [status, message]);

    function handleAlert(status: 'waiting' | 'success' | 'error') {
        if (status === 'waiting') {
            setVariantColor("info");
            setCircleWaiting(true);
            setSuccessWaiting(false);
            setErrorWaiting(false);
        }
        else if (status === 'success') {
            setVariantColor("success");
            setCircleWaiting(false);
            setSuccessWaiting(true);
        }
        else if (status === 'error') {
            setVariantColor("danger");
            setCircleWaiting(false);
            setErrorWaiting(true);
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
                errorWaiting && <><FaTimesCircle /> {!!message ? message : "algo deu errado!"}</>
            }
        </Alert>
    )
}

export { AlertMessage };