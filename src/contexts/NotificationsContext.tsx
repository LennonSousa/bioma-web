import { useState, createContext } from 'react';

import { Notification } from '../components/Notifications';

interface NotificationsContextData {
    notifications: Notification[];
    handleNotifications(notifications: Notification[]): void;
}

const NotificationsContext = createContext<NotificationsContextData>({} as NotificationsContextData);

const NotificationsProvider: React.FC = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    function handleNotifications(notifications: Notification[]) {
        setNotifications(notifications);
    }

    return (
        <NotificationsContext.Provider value={{ notifications, handleNotifications }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export { NotificationsContext, NotificationsProvider };