import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: false,
});

api.interceptors.response.use(
	(res) => res,
	(error) => {
        // Auth removed: do not redirect on 401
		return Promise.reject(error);
	}
);

export default api;
