import { Col, Container, Row, Spinner } from 'react-bootstrap';

export default function PageWaiting() {
    return <Container className="content-page">
        <Row style={{ height: '100vh' }
        } className="justify-content-center align-items-center text-center">
            <Col>
                <h1>Aguarde, carregando...</h1>
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />
            </Col>
        </Row>
    </Container>
}