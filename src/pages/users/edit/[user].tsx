import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaKey } from 'react-icons/fa';

import api from '../../../api/api';
import { cellphone } from '../../../components/InputMask/masks';
import { TokenVerify } from '../../../utils/tokenVerify';
import { SideBarContext } from '../../../contexts/SideBarContext';
import { User, UserRole } from '../../../components/Users';
import PageBack from '../../../components/PageBack';
import { AlertMessage, statusModal } from '../../../components/interfaces/AlertMessage';

interface TranslateRoles {
    role: string,
    translated: string;
}

const translatedRoles: TranslateRoles[] = [
    {
        role: 'customers',
        translated: 'Clientes',
    },
    {
        role: 'institutions',
        translated: 'Instituições',
    },
    {
        role: 'licensings',
        translated: 'Licenciamentos',
    },
    {
        role: 'properties',
        translated: 'Imóveis',
    },
    {
        role: 'projects',
        translated: 'Projetos',
    },
    {
        role: 'banks',
        translated: 'Bancos',
    },
    {
        role: 'users',
        translated: 'Usuários',
    },
];

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Obrigatório!'),
    phone: Yup.string().required('Obrigatório!'),
});

export default function UserEdit() {
    const router = useRouter();
    const { user } = router.query;

    const { handleItemSideBar, handleSelectedMenu } = useContext(SideBarContext);

    const [userData, setUserData] = useState<User>();
    const [usersRoles, setUsersRoles] = useState<UserRole[]>([]);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<typeof statusModal>("waiting");

    useEffect(() => {
        handleItemSideBar('users');
        handleSelectedMenu('users-new');

        api.get(`users/${user}`).then(res => {
            const userRes: User = res.data;

            setUsersRoles(userRes.roles);

            setUserData(userRes);
        }).catch(err => {
            console.log('Error get user to edit, ', err);
        });
    }, []);

    function handleChecks(event: ChangeEvent<HTMLInputElement>) {
        const roleId = event.target.value.split("@", 1)[0];
        const grant = event.target.value.split("@", 2)[1];

        const updatedUsersRoles = usersRoles.map(role => {
            if (role.id === roleId) {
                if (grant === 'all') {
                    return {
                        ...role,
                        view: true,
                        view_self: true,
                        create: true,
                        update: true,
                        update_self: true,
                        remove: true,
                    }
                }

                if (grant === 'view') {
                    if (role.view) {
                        const updatedRole = handleRole(role, ['create', 'update', 'remove'], false);

                        return { ...updatedRole, view: !updatedRole.view };
                    }

                    return { ...role, view: !role.view };
                }
                if (grant === 'view_self') return { ...role, view_self: !role.view_self };
                if (grant === 'create') return { ...role, create: !role.create };
                if (grant === 'update') {
                    if (role.update) {
                        const updatedRole = handleRole(role, ['remove'], false);

                        return { ...updatedRole, update: !updatedRole.update };
                    }

                    return { ...role, update: !role.update };
                }
                if (grant === 'update_self') return { ...role, update_self: !role.update_self };
                if (grant === 'remove') return { ...role, remove: !role.remove };

                return { ...role, [grant]: true }
            }

            return role;
        });

        setUsersRoles(updatedUsersRoles);
    }

    function handleRole(role: UserRole, grants: string[], checked: boolean) {
        let updatedRole = role;

        grants.forEach(grant => {
            if (grant === 'view') updatedRole = { ...updatedRole, view: checked };
            if (grant === 'view_self') updatedRole = { ...updatedRole, view_self: checked };
            if (grant === 'create') updatedRole = { ...updatedRole, create: checked };
            if (grant === 'update') updatedRole = { ...updatedRole, update: checked };
            if (grant === 'update_self') updatedRole = { ...updatedRole, update_self: checked };
            if (grant === 'remove') updatedRole = { ...updatedRole, remove: checked };
        });

        return updatedRole;
    }

    return <Container className="content-page">
        {
            userData && <Formik
                initialValues={{
                    name: userData.name,
                    phone: userData.phone,
                }}
                onSubmit={async values => {
                    setTypeMessage("waiting");
                    setMessageShow(true);

                    try {
                        await api.put(`users/${userData.id}`, {
                            name: values.name,
                            phone: values.phone,
                        });

                        usersRoles.forEach(async role => {
                            await api.put(`users/roles/${role.id}`, {
                                role: role.role,
                                view: role.view,
                                view_self: role.view_self,
                                create: role.create,
                                update: role.update,
                                update_self: role.update_self,
                                remove: role.remove,
                            });
                        });

                        setTypeMessage("success");

                        setTimeout(() => {
                            router.push(`/users/details/${userData.id}`);
                        }, 1500);
                    }
                    catch {
                        setTypeMessage("error");

                        setTimeout(() => {
                            setMessageShow(false);
                        }, 4000);
                    }
                }}
                validationSchema={validationSchema}
            >
                {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched }) => (
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col>
                                <PageBack href="/users" subTitle="Voltar para os detalhes do usuário." />
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} sm={6} controlId="formGridName">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    type="name"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.name}
                                    name="name"
                                    isInvalid={!!errors.name && touched.name}
                                />
                                <Form.Control.Feedback type="invalid">{touched.name && errors.name}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="formLoginPhone">
                                <Form.Label>Telefone</Form.Label>
                                <Form.Control
                                    type="text"
                                    maxLength={15}
                                    onChange={(e) => {
                                        setFieldValue('phone', cellphone(e.target.value));
                                    }}
                                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                        setFieldValue('phone', cellphone(e.target.value));
                                    }}
                                    value={values.phone}
                                    name="phone"
                                    isInvalid={!!errors.phone && touched.phone}
                                />
                                <Form.Control.Feedback type="invalid">{touched.phone && errors.phone}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row>
                            <Col>
                                <h6 className="text-success">Permissões <FaKey /></h6>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <ListGroup className="mb-3">
                                    {
                                        usersRoles.map((role, index) => {
                                            const translatedRole = translatedRoles.find(item => { return item.role === role.role });

                                            return <ListGroup.Item key={index} as="div" variant="light">
                                                <Row>
                                                    <Col>
                                                        <h6 className="text-success">{translatedRole ? translatedRole.translated : role.role} </h6>
                                                    </Col>

                                                    <Col>
                                                        <Form.Check
                                                            checked={role.view}
                                                            type="checkbox"
                                                            label="Visualizar"
                                                            name="type"
                                                            id={`formUserRoles${role.id}View`}
                                                            value={`${role.id}@view`}
                                                            onChange={handleChecks}
                                                        />
                                                    </Col>

                                                    <Col>
                                                        <Form.Check
                                                            checked={role.create}
                                                            type="checkbox"
                                                            label="Criar"
                                                            name="type"
                                                            id={`formUserRoles${role.id}Create`}
                                                            value={`${role.id}@create`}
                                                            onChange={handleChecks}
                                                            disabled={!role.view}
                                                        />
                                                    </Col>

                                                    <Col>
                                                        <Form.Check
                                                            checked={role.update}
                                                            type="checkbox"
                                                            label="Editar"
                                                            name="type"
                                                            id={`formUserRoles${role.id}Update`}
                                                            value={`${role.id}@update`}
                                                            onChange={handleChecks}
                                                            disabled={!role.view}
                                                        />
                                                    </Col>

                                                    {
                                                        role.id === 'users' && <Col>
                                                            <Form.Check
                                                                checked={role.update_self}
                                                                type="checkbox"
                                                                label="Editar próprio"
                                                                name="type"
                                                                id={`formUserRoles${role.id}UpdateSelf`}
                                                                value={`${role.id}@update_self`}
                                                                onChange={handleChecks}
                                                            />
                                                        </Col>
                                                    }

                                                    <Col>
                                                        <Form.Check
                                                            checked={role.remove}
                                                            type="checkbox"
                                                            label="Excluir"
                                                            name="type"
                                                            id={`formUserRoles${role.id}Remove`}
                                                            value={`${role.id}@remove`}
                                                            onChange={handleChecks}
                                                            disabled={!role.update}
                                                        />
                                                    </Col>

                                                    <Col>
                                                        <Form.Check
                                                            checked={
                                                                role.view &&
                                                                    role.view_self &&
                                                                    role.create &&
                                                                    role.update &&
                                                                    role.update_self &&
                                                                    role.remove ? true : false
                                                            }
                                                            type="checkbox"
                                                            label="Tudo"
                                                            name="type"
                                                            id={`formUserRoles${role.id}All`}
                                                            value={`${role.id}@all`}
                                                            onChange={handleChecks}
                                                        />
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        })
                                    }
                                </ListGroup>
                            </Col>
                        </Row>

                        <Col className="border-top mb-3"></Col>

                        <Row className="justify-content-end">
                            {
                                messageShow ? <Col sm={3}><AlertMessage status={typeMessage} /></Col> :
                                    <Col sm={2}>
                                        <Button variant="success" type="submit">Salvar</Button>
                                    </Col>

                            }
                        </Row>
                    </Form>
                )}
            </Formik>
        }
    </Container >
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { token } = context.req.cookies;

    const tokenVerified = await TokenVerify(token);

    if (tokenVerified === "not-authorized") { // Not authenticated, token invalid!
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    if (tokenVerified === "error") { // Server error!
        return {
            redirect: {
                destination: '/500',
                permanent: false,
            },
        }
    }

    return {
        props: {},
    }
}