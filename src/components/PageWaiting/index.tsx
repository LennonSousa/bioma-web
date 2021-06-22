import { useState, useEffect } from 'react';
import { Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface PageWaitingProps {
    status: 'waiting' | 'success' | 'warning' | 'error',
    message?: string;
}

const PageWaiting: React.FC<PageWaitingProps> = ({ status, message = "Aguarde, carregando..." }) => {
    const [circleWaiting, setCircleWaiting] = useState(true);
    const [successWaiting, setSuccessWaiting] = useState(false);
    const [warningWaiting, setWarningWaiting] = useState(false);
    const [errorWaiting, setErrorWaiting] = useState(false);

    useEffect(() => {
        handleAlert(status);
    }, [status, message]);

    function handleAlert(status: 'waiting' | 'success' | 'warning' | 'error') {
        if (status === 'waiting') {
            setCircleWaiting(true);
            setSuccessWaiting(false);
            setErrorWaiting(false);
            return;
        }

        if (status === 'success') {
            setCircleWaiting(false);
            setSuccessWaiting(true);
            return;
        }

        if (status === 'warning') {
            setCircleWaiting(false);
            setErrorWaiting(false);
            setWarningWaiting(true);
            return;
        }

        if (status === 'error') {
            setCircleWaiting(false);
            setSuccessWaiting(false);
            setErrorWaiting(true);
            return;
        }
    }

    return <Container className="content-page" style={{ height: '100vh' }}>
        <Row className="justify-content-center align-items-center text-center">
            <Col>
                {
                    circleWaiting && <Spinner animation="border" variant="info" size="sm" />
                }
                {
                    successWaiting && <FaCheckCircle />
                }
                {
                    warningWaiting && <Row className="justify-content-center mt-3 mb-3">
                        <Col sm={3}>
                            <Image src="/assets/images/undraw_access_denied_re_awnf.svg" alt="Sem dados para mostrar." fluid />
                        </Col>
                    </Row>
                }
                {
                    errorWaiting && <FaTimesCircle />
                }
            </Col>
        </Row>
        <Row className="justify-content-center align-items-center text-center">
            <Col>
                <h1>{message}</h1>
            </Col>
        </Row>
    </Container>
}

export { PageWaiting };