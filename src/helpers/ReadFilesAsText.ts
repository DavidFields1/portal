/**
 * Lee un objeto File y lo convierte a una cadena de texto.
 * @param file - El archivo XML a leer.
 * @returns Una promesa que resuelve con el contenido del archivo como texto.
 */
export const readFileAsText = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsText(file, 'UTF-8');
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});
};
