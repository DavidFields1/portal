/**
 * Extrae los datos clave del objeto XML y los mapea a una estructura conocida.
 * Esta función solo extrae, no valida.
 * @param xmlObject - El objeto JSON convertido desde el XML.
 * @returns Un objeto con los datos relevantes para la validación.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapXmlData = (xmlObject: any) => {
	try {
		const comprobante = xmlObject['cfdi:Comprobante'];
		const emisor = comprobante['cfdi:Emisor'];
		const receptor = comprobante['cfdi:Receptor'];
		const timbre = comprobante['cfdi:Complemento']['tfd:TimbreFiscalDigital'];

		return {
			tipoDeComprobante: comprobante._attributes.TipoDeComprobante,
			moneda: comprobante._attributes.Moneda,
			subtotal: parseFloat(comprobante._attributes.SubTotal),
			total: parseFloat(comprobante._attributes.Total),
			fechaTimbrado: timbre._attributes.FechaTimbrado,
			rfcReceptor: receptor._attributes.Rfc,
			rfcEmisor: emisor._attributes.Rfc,
			folio: comprobante._attributes.Folio || '',
			// añadir mas campos
		};
	} catch (error) {
		// Si falta una estructura clave en el XML (ej. no tiene Complemento), lanzará un error.
		console.error('Error al mapear el XML: ', error);
		throw new Error('El archivo XML tiene una estructura inválida o está corrupto.');
	}
};
