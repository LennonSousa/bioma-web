import { useContext } from 'react';
import { useRouter } from 'next/router';
import { createContext, useState } from 'react';
import Cookies from 'js-cookie';
import { AccessControl } from 'accesscontrol';

import api from '../api/api';
import { NotificationsContext } from './NotificationsContext';
import { User } from '../components/Users';

interface AuthContextData {
    user: User | null;
    signed: boolean;
    loading: boolean;
    handleAuthenticated(): Promise<void>;
    handleLogin(email: string, password: string): Promise<boolean | "error">;
    handleLogout(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
    const router = useRouter();

    const { handleNotifications } = useContext(NotificationsContext);

    const [user, setUser] = useState<User | null>(null);
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

            setUserGrants(user);
            setUser(userRes);
            setSigned(true);

            setLoading(false);
        }
        catch {
            handleLogout();
        }
    }

    async function handleLogin(emailLogin: string, password: string) {
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

                setUserGrants(user);

                setUser(user);

                api.defaults.headers['Authorization'] = `Bearer ${token}`;

                Cookies.set('user', user.id, { expires: 1 });
                Cookies.set('token', token, { expires: 1 });

                setSigned(true);
                setLoading(false);

                router.push('/dashboard');

                return true;
            }

            return false;
        }
        catch {
            return "error";
        }
    }

    function setUserGrants(user: User) {
        const ac = new AccessControl();

        user.roles.forEach(role => {
            if (role.view) {
                ac.grant(user.id).readAny(role.role);
            }

            if (role.view_self) {
                ac.grant(user.id).readOwn(role.role);
            }

            if (role.create) {
                ac.grant(user.id).create(role.role);
            }

            if (role.update) {
                ac.grant(user.id).updateAny(role.role);
            }

            if (role.update_self) {
                ac.grant(user.id).updateOwn(role.role);
            }

            if (role.remove) {
                ac.grant(user.id).delete(role.role);
            }
        });

        ac.lock();
    }

    async function handleLogout() {
        setLoading(true);
        setSigned(false);
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