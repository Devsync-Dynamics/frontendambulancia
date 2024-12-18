import React, { useState, useRef } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';

// Estilos de PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 50,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
    borderBottom: '1px solid #000',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  input: {
    border: '1px solid #000',
    padding: 5,
    flex: 1,
  }
});

export default function MedicalAuthorizationForm() {
  const [formData, setFormData] = useState({
    // Sección de Autorización
    codigo: '',
    noAutorizacion: '',
    fecha: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),

    // Datos del Paciente
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    tipoDocumento: '',
    numeroIdentificacion: '',
    fechaNacimiento: '',
    nacionalidad: '',
    telefono: '',
    direccionResidencia: '',
    municipio: '',
    departamento: '',
    email: '',

    // Datos del Prestador
    nombrePrestador: '',
    nitPrestador: '',
    direccionPrestador: '',

    // Servicios
    servicios: [
      { 
        codigoCUPS: '', 
        cantidad: '', 
        descripcion: '' 
      }
    ]
  });

  const [logo, setLogo] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const PDFPreview = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logo && <Image src={logo} style={styles.logo} />}
          <Text style={styles.title}>AUTORIZACIÓN DE SERVICIOS DE SALUD</Text>
        </View>

        {/* Sección de Datos de Autorización */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Código: {formData.codigo}</Text>
            <Text>No. Autorización: {formData.noAutorizacion}</Text>
          </View>
          <View style={styles.row}>
            <Text>Fecha: {formData.fecha}</Text>
            <Text>Hora: {formData.hora}</Text>
          </View>
        </View>

        {/* Sección de Datos del Paciente */}
        <View style={styles.section}>
          <Text style={{fontWeight: 'bold', marginBottom: 5}}>DATOS DEL PACIENTE</Text>
          <View style={styles.row}>
            <View style={styles.input}><Text>1er Nombre: {formData.primerNombre}</Text></View>
            <View style={styles.input}><Text>2do Nombre: {formData.segundoNombre}</Text></View>
          </View>
          <View style={styles.row}>
            <View style={styles.input}><Text>1er Apellido: {formData.primerApellido}</Text></View>
            <View style={styles.input}><Text>2do Apellido: {formData.segundoApellido}</Text></View>
          </View>
          {/* Continuar con más campos del paciente */}
        </View>

        {/* Sección de Servicios */}
        <View style={styles.section}>
          <Text style={{fontWeight: 'bold', marginBottom: 5}}>SERVICIOS AUTORIZADOS</Text>
          {formData.servicios.map((servicio, index) => (
            <View key={index} style={styles.row}>
              <Text>Código CUPS: {servicio.codigoCUPS}</Text>
              <Text>Cantidad: {servicio.cantidad}</Text>
              <Text>Descripción: {servicio.descripcion}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulario de Entrada */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Formulario de Autorización</h2>
          
          {/* Input de Logo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Cargar Logo de la Institución
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleLogoUpload}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Campos de Autorización */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              name="codigo"
              placeholder="Código"
              value={formData.codigo}
              onChange={handleInputChange}
              className="input"
            />
            <input
              name="noAutorizacion"
              placeholder="No. Autorización"
              value={formData.noAutorizacion}
              onChange={handleInputChange}
              className="input"
            />
          </div>

          {/* Campos de Paciente */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              name="primerNombre"
              placeholder="Primer Nombre"
              value={formData.primerNombre}
              onChange={handleInputChange}
              className="input"
            />
            <input
              name="segundoNombre"
              placeholder="Segundo Nombre"
              value={formData.segundoNombre}
              onChange={handleInputChange}
              className="input"
            />
            <input
              name="primerApellido"
              placeholder="Primer Apellido"
              value={formData.primerApellido}
              onChange={handleInputChange}
              className="input"
            />
            <input
              name="segundoApellido"
              placeholder="Segundo Apellido"
              value={formData.segundoApellido}
              onChange={handleInputChange}
              className="input"
            />
            {/* Más campos según sea necesario */}
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-between">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => {/* Lógica de guardado */}}
            >
              Guardar
            </button>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => {/* Lógica de envío */}}
            >
              Enviar
            </button>
          </div>
        </div>

        {/* Vista Previa de PDF */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Vista Previa de PDF</h2>
          <PDFViewer width="100%" height="600px">
            <PDFPreview />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}