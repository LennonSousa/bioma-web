import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaPencilAlt } from 'react-icons/fa'

import { Bank } from '../Banks';

import styles from './styles.module.css';

interface BankItemProps {
    bank: Bank;
}

const BankItem: React.FC<BankItemProps> = ({ bank }) => {
    const router = useRouter();

    function goToEdit() {
        router.push(`/banks/edit/${bank.id}`);
    }

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <Col sm={4}>
            <div className={styles.itemContainer}>
                <Row className="align-items-center">
                    <Col sm={10}>
                        <Link href={`/banks/details/${bank.id}`}>
                            <a>
                                <h5 className={styles.itemText}>{bank.institution.name}</h5>
                            </a>
                        </Link>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <span
                            className={`form-control-plaintext text-secondary ${styles.itemText}`}
                        >
                            {!!bank.sector ? bank.sector : <br />}
                        </span>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <span
                            className={`form-control-plaintext text-secondary ${styles.itemText}`}
                        >
                            {`${bank.agency} ${!!bank.address ? ` - ${bank.address}` : ''}`}
                        </span>
                    </Col>
                </Row>

                <Row>
                    <ButtonGroup size="sm" className="col-12">
                        <Button
                            variant="success"
                            title="Lista todos os projetos desse banco."
                            onClick={() => handleRoute(`/projects?bank=${bank.id}`)}
                        >
                            <FaFileAlt />
                        </Button>
                        <Button
                            variant="success"
                            title="Editar banco."
                            onClick={goToEdit}
                        >
                            <FaPencilAlt />
                        </Button>
                    </ButtonGroup>
                </Row>
            </div>
        </Col >
    )
}

export default BankItem;