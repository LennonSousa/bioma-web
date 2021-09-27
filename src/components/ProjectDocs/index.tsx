import { Row, Col, ListGroup, Form } from 'react-bootstrap';
import { Formik } from 'formik';
import { format } from 'date-fns';

import { Project } from '../Projects';
import { DocsProject } from '../DocsProject';

export interface ProjectDoc {
    id: string;
    path: string;
    received_at: Date;
    checked: boolean;
    project: Project;
    doc: DocsProject;
}

interface ProjectDocsProps {
    doc: ProjectDoc;
    handleChecks: (docId: string) => void;
    handleReceivedAt: (docId: string, value: string) => void;
}

const ProjectDocs: React.FC<ProjectDocsProps> = ({ doc, handleChecks, handleReceivedAt }) => {

    return (
        <ListGroup.Item action as="div" variant="light">
            <Formik
                initialValues={
                    {
                        checked: doc.checked,
                        received_at: format(new Date(doc.received_at), 'yyyy-MM-dd'),
                    }
                }
                onSubmit={() => { }}
                enableReinitialize
            >
                {({ handleChange, values }) => (
                    <Row className="align-items-center">
                        <Col sm={8}>
                            <Form.Check
                                checked={values.checked}
                                onChange={() => { handleChecks(doc.doc.id) }}
                                label={doc.doc.name}
                                id={`formCustomerDocs${doc.doc.id}`}
                            />
                        </Col>

                        <Form.Label column sm={2}>Data do recebimento</Form.Label>
                        <Col sm={2}>
                            <Form.Control
                                type="date"
                                className="form-control"
                                onChange={handleChange}
                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                    handleReceivedAt(doc.doc.id, e.target.value);
                                }}
                                value={values.received_at}
                                name="received_at"
                            />
                        </Col>
                    </Row>
                )}
            </Formik>

        </ListGroup.Item>
    )
}

export default ProjectDocs;