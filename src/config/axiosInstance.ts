import axios from 'axios'

const axiosInstance = axios.create({
	baseURL: 'http://13.216.21.166/reciboo-api',
})

axiosInstance.interceptors.request.use(
	(config) => {
		const localUser = localStorage.getItem('user') || ''

		if (localUser) {
			const parsedUser = JSON.parse(localUser)
			config.headers.Authorization = `Bearer ${parsedUser.accessToken}`
		}
		return config
	},
	(error) => Promise.reject(error),
)

export default axiosInstance
