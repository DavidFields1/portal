/**
 * Extrae los datos clave del objeto XML de un CFDI 4.0 y los mapea a una estructura conocida.
 * Esta función solo extrae, no valida.
 * @param xmlObject - El objeto JSON convertido desde el XML.
 * @returns Un objeto con los datos relevantes para la validación.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapXmlData = (xmlObject: any) => {
	try {
		const comprobante = xmlObject['cfdi:Comprobante'];
		if (!comprobante) {
			throw new Error('El nodo raíz "cfdi:Comprobante" no fue encontrado.');
		}

		const emisor = comprobante['cfdi:Emisor'];
		const receptor = comprobante['cfdi:Receptor'];
		const impuestos = comprobante['cfdi:Impuestos']; // Puede no existir
		const complemento = comprobante['cfdi:Complemento'];
		const timbre = complemento?.['tfd:TimbreFiscalDigital'];

		if (!emisor || !receptor || !timbre) {
			throw new Error('Faltan nodos esenciales como Emisor, Receptor o TimbreFiscalDigital.');
		}

		// El nodo de conceptos puede ser un objeto si es uno solo, o un array si son varios.
		// Lo normalizamos a un array para procesarlo siempre igual.
		let conceptosArray = [];
		const conceptosNode = comprobante['cfdi:Conceptos']?.['cfdi:Concepto'];
		if (conceptosNode) {
			conceptosArray = Array.isArray(conceptosNode) ? conceptosNode : [conceptosNode];
		}

		return {
			// Datos del Timbre Fiscal Digital (Complemento)
			uuid: timbre._attributes.UUID,
			fecha_timbrado: timbre._attributes.FechaTimbrado,
			sello_sat: timbre._attributes.SelloSAT,
			no_certificado_sat: timbre._attributes.NoCertificadoSAT,

			// Datos principales del Comprobante
			moneda: comprobante._attributes.Moneda,
			total: parseFloat(comprobante._attributes.Total ?? '0'),
			subtotal: parseFloat(comprobante._attributes.SubTotal ?? '0'),
			fecha_expedicion: comprobante._attributes.Fecha,
			metodo_pago: comprobante._attributes.MetodoPago ?? '',
			forma_pago: comprobante._attributes.FormaPago ?? '',
			sello: comprobante._attributes.Sello,
			no_certificado: comprobante._attributes.NoCertificado,
			certificado: comprobante._attributes.Certificado,
			tipo_comprobante: comprobante._attributes.TipoDeComprobante,
			serie: comprobante._attributes.Serie ?? '',
			folio: comprobante._attributes.Folio ?? '',
			lugar_expedicion: comprobante._attributes.LugarExpedicion, // Similar a domicilio_fiscal del emisor

			// Datos del Emisor
			razonsocial_emisor: emisor._attributes.Nombre,
			rfc_emisor: emisor._attributes.Rfc,
			regimen_fiscal_emisor: emisor._attributes.RegimenFiscal,

			// Datos del Receptor
			razonsocial_receptor: receptor._attributes.Nombre,
			rfc_receptor: receptor._attributes.Rfc,
			domicilio_fiscal_receptor: receptor._attributes.DomicilioFiscalReceptor,
			regimen_fiscal_receptor: receptor._attributes.RegimenFiscalReceptor,
			uso_cfdi: receptor._attributes.UsoCFDI,

			// Datos de Impuestos (Totales)
			total_impuestos_trasladados: parseFloat(
				impuestos?._attributes.TotalImpuestosTrasladados ?? '0',
			),
			total_impuestos_retenidos: parseFloat(
				impuestos?._attributes.TotalImpuestosRetenidos ?? '0',
			),

			// Mapeo de Conceptos
			conceptos: conceptosArray.map(
				(concepto: { _attributes: { [key: string]: string } }) => ({
					clave_prod_serv: concepto._attributes.ClaveProdServ,
					cantidad: parseFloat(concepto._attributes.Cantidad ?? '0'),
					clave_unidad: concepto._attributes.ClaveUnidad,
					unidad: concepto._attributes.Unidad ?? '',
					descripcion: concepto._attributes.Descripcion,
					valor_unitario: parseFloat(concepto._attributes.ValorUnitario ?? '0'),
					importe: parseFloat(concepto._attributes.Importe ?? '0'),
					// Campos que no están en el XML de concepto estándar pero que tu objeto requiere
					id_concepto: 0,
					uuid_factura: timbre._attributes.UUID, // Se puede asociar el UUID aquí
					estatus: 'string', // Valor por defecto
					fecha_creacion: new Date().toISOString(),
					fecha_modificacion: new Date().toISOString(),
				}),
			),

			// // Campos de tu objeto que NO están en un CFDI estándar.
			// // Deberás llenarlos desde otra fuente de datos (ej. tu base de datos o sistema).
			// id_factura: 0,
			// fecha_creacion: new Date().toISOString(),
			// estatus: 'string', // Por ejemplo 'VALIDA' o 'PENDIENTE'
			// file_path: 'string',
			// tipo_factura: 'string', // Podrías derivarlo de TipoDeComprobante ('I' -> Ingreso)
			// documento_contable: 'string',
			// ejercicio_fiscal: 'string',
			// sociedad: 'string',
			// id_proveedor_sap: 'string',
		};
	} catch (error) {
		// Si falta una estructura clave en el XML, lanzará un error.
		console.error('Error al mapear el XML: ', error);
		throw new Error('El archivo XML tiene una estructura inválida o está corrupto.');
	}
};
