import axios from 'axios';

const axiosInstance = axios.create({
<<<<<<< HEAD
	baseURL: 'http://13.216.21.166/api',
=======
	baseURL: 'http://localhost:8383/reciboo-api',
>>>>>>> 2310bbe771c3a141cfc1d054a551bb1482da7f45
});

axiosInstance.interceptors.request.use(
	(config) => {
		const localUser = localStorage.getItem('user') || '';

		if (localUser) {
			const parsedUser = JSON.parse(localUser);
			config.headers.Authorization = `Bearer ${parsedUser.accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

export default axiosInstance;
