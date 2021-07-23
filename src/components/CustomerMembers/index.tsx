import { useState } from 'react';
import { Button, Toast } from 'react-bootstrap';
import { FaUserTie } from 'react-icons/fa';

import api from '../../api/api';
import { Customer } from '../Customers';
import { User } from '../Users';
import { AlertMessage, statusModal } from '../interfaces/AlertMessage';

export interface Member {
    id: string;
    customer?: Customer;
    user: User;
}

interface MemberProps {
    member: Member;
    canRemove?: boolean;
    isNewItem?: boolean;
    handleListMembers?: () => Promise<void>;
    handleDeleteMember?: (userId: string) => void;
}

const Members: React.FC<MemberProps> = ({ member, canRemove = true, isNewItem = false, handleListMembers, handleDeleteMember }) => {
    const [showUserDetails, setShowUserDetails] = useState(false);

    const toggleShowUserDetails = () => setShowUserDetails(!showUserDetails);

    const [messageShow, setMessageShow] = useState(false);
    const [typeMessage, setTypeMessage] = useState<statusModal>("waiting");

    async function deleteMember() {
        if (isNewItem && handleDeleteMember) {
            handleDeleteMember(member.user.id);
            toggleShowUserDetails();

            return;
        }

        setTypeMessage("waiting");
        setMessageShow(true);

        try {
            await api.delete(`members/${member.id}/customer`);

            toggleShowUserDetails();

            if (handleListMembers) handleListMembers();
        }
        catch (err) {
            setTypeMessage("error");
            setMessageShow(true);

            setTimeout(() => {
                setMessageShow(false);
            }, 4000);

            console.log("Error to delete customer member");
            console.log(err);
        }
    }

    return (
        <div className="member-container">
            <Button
                onClick={toggleShowUserDetails}
                className="member-item"
                variant="success"
                title={member.user.name}
            >
                {member.user.name.split(' ', 1)[0]}
            </Button>

            <Toast
                show={showUserDetails}
                onClose={toggleShowUserDetails}
                delay={5000}
                autohide
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 999,
                    width: 'auto',
                    maxWidth: 'fit-content',
                }}
            >
                <Toast.Header>
                    <FaUserTie style={{ marginRight: '.5rem' }} /><strong className="me-auto">{member.user.name}</strong>
                </Toast.Header>
                {
                    canRemove && !member.user.sudo && <Toast.Body>
                        {
                            messageShow ? <AlertMessage status={typeMessage} /> :
                                <Button
                                    variant="light"
                                    type="button"
                                    onClick={deleteMember}
                                    style={{ width: '100%' }}
                                    title="Remover este membro responsável para este cliente."
                                >
                                    Remover
                                </Button>
                        }

                    </Toast.Body>
                }

            </Toast>
        </div>
    )
}

export default Members;