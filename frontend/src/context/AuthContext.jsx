import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);

    // Restore persisted session on first render
    useEffect(() => {
        try {
            const t = localStorage.getItem('fb_token');
            const u = localStorage.getItem('fb_user');
            if (t && u) {
                setToken(t);
                setUser(JSON.parse(u));
            }
        } catch (_) {
            /* ignore */
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const axios = (await import('axios')).default;
        const { data } = await axios.post('/api/auth/login', { email, password });
        const { token: jwt, user: u } = data;
        localStorage.setItem('fb_token', jwt);
        localStorage.setItem('fb_user', JSON.stringify(u));
        setToken(jwt);
        setUser(u);
        return u;
    }, []);

    const register = useCallback(async (role, formData) => {
        const axios = (await import('axios')).default;
        const { data } = await axios.post(
            `/api/auth/register/${role.toLowerCase()}`,
            formData,
            { headers: { Authorization: `Bearer ${localStorage.getItem('fb_token') || ''}` } }
        );
        const { token: jwt, user: u } = data;
        localStorage.setItem('fb_token', jwt);
        localStorage.setItem('fb_user', JSON.stringify(u));
        setToken(jwt);
        setUser(u);
        return u;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('fb_token');
        localStorage.removeItem('fb_user');
        setToken(null);
        setUser(null);
    }, []);

    const updateUser = useCallback((patch) => {
        setUser((prev) => {
            const merged = { ...(prev || {}), ...(patch || {}) };
            localStorage.setItem('fb_user', JSON.stringify(merged));
            return merged;
        });
    }, []);

    // Used by demo/offline login to set both user + token at once
    const mockLogin = useCallback((userData, fakeToken) => {
        setUser(userData);
        setToken(fakeToken);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: Boolean(token && user),
                role: user ? user.role : null,
                isAdmin: user ? user.role === 'ADMIN' : false,
                isDonor: user ? user.role === 'DONOR' : false,
                isBeneficiary: user ? user.role === 'BENEFICIARY' : false,
                login,
                register,
                logout,
                updateUser,
                mockLogin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
