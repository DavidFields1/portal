import * as xmljs from 'xml-js';

/**
 * Convierte una cadena de texto XML a un objeto JSON.
 * @param xmlString - La cadena de texto XML.
 * @returns El objeto JSON resultante.
 */
export const convertXMLtoJSON = (xmlString: string) => {
	return xmljs.xml2js(xmlString, { compact: true });
};
