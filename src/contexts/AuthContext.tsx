import { useContext } from 'react';
import { useRouter } from 'next/router';
import { createContext, useState } from 'react';
import Cookies from 'js-cookie';

import api from '../api/api';
import { NotificationsContext } from './NotificationsContext';
import { User } from '../components/Users';

interface AuthContextData {
    user: User | undefined;
    signed: boolean;
    loading: boolean;
    handleAuthenticated(): Promise<void>;
    handleLogin(email: string, password: string, returnTo?: string): Promise<boolean | "error">;
    handleLogout(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
    const router = useRouter();

    const { handleNotifications } = useContext(NotificationsContext);

    const [user, setUser] = useState<User | undefined>(undefined);
    const [signed, setSigned] = useState(false);
    const [loading, setLoading] = useState(true);

    async function handleAuthenticated() {
        try {
            const storagedUser = Cookies.get('user');
            const storagedToken = Cookies.get('token');

            if (!storagedUser || !storagedToken) {
                handleLogout();
                return;
            }

            api.defaults.headers['Authorization'] = `Bearer ${storagedToken}`;

            const res = await api.get(`users/${storagedUser}`);

            const userRes: User = res.data;

            handleNotifications(userRes.notifications);

            setSigned(true);
            setUser(userRes);

            setLoading(false);
        }
        catch {
            handleLogout();
        }
    }

    async function handleLogin(emailLogin: string, password: string, returnTo?: string) {
        try {
            const res = await api.post('users/authenticate', {
                email: emailLogin,
                password
            },
                {
                    validateStatus: function (status) {
                        return status < 500; // Resolve only if the status code is less than 500
                    }
                }
            );

            if (res.status === 201) {
                const { user, token } = res.data;

                const userRes: User = user;

                handleNotifications(userRes.notifications);

                setUser(userRes);

                api.defaults.headers['Authorization'] = `Bearer ${token}`;

                Cookies.set('user', user.id, { expires: 1, secure: true });
                Cookies.set('token', token, { expires: 1, secure: true });

                setSigned(true);
                setLoading(false);

                router.push(`${returnTo ? returnTo : '/dashboard'}`);

                return true;
            }

            return false;
        }
        catch {
            return "error";
        }
    }

    // function setUserGrants(user: User) {
    //     let listGrants: Grants[] = [];

    //     user.roles.forEach(role => {
    //         if (role.view) {
    //             listGrants.push({
    //                 role: user.id,
    //                 resource: role.role,
    //                 action: 'view'
    //             });
    //         }

    //         if (role.view_self) {
    //             listGrants.push({
    //                 role: user.id,
    //                 resource: role.role,
    //                 action: 'view_self'
    //             });
    //         }

    //         if (role.create) {
    //             listGrants.push({
    //                 role: user.id,
    //                 resource: role.role,
    //                 action: 'create'
    //             });
    //         }

    //         if (role.update) {
    //             listGrants.push({
    //                 role: user.id,
    //                 resource: role.role,
    //                 action: 'update'
    //             });

    //         }

    //         if (role.update_self) {
    //             listGrants.push({
    //                 role: user.id,
    //                 resource: role.role,
    //                 action: 'update_self'
    //             });

    //         }

    //         if (role.remove) {
    //             listGrants.push({
    //                 role: user.id,
    //                 resource: role.role,
    //                 action: 'remove'
    //             });
    //         }
    //     });

    //     return listGrants;
    // }

    async function handleLogout() {
        setLoading(true);
        setSigned(false);
        setUser(undefined);

        Cookies.remove('user');
        Cookies.remove('token');

        api.defaults.headers.Authorization = undefined;

        router.replace('/');

        setLoading(false);
    }

    return (
        <AuthContext.Provider value={{ user, signed, loading, handleAuthenticated, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };