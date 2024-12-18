import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PDFDocument } from 'pdf-lib';
import { StyleSheet } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Componente dinámico para cargar solo en el cliente
const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
  ssr: false
});

const Document = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.Document), {
  ssr: false
});

const Page = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.Page), {
  ssr: false
});

const Text = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.Text), {
  ssr: false
});

const View = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.View), {
  ssr: false
});

const Image = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.Image), {
  ssr: false
});

type FormData = {
  [key: string]: string | Array<{ codigoCUPS: string; cantidad: string; descripcion: string }>;
};

export default function MedicalAuthorizationForm() {
  const [isClient, setIsClient] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    codigo: '',
    noAutorizacion: '',
    fecha: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    tipoDocumento: '',
    numeroIdentificacion: '',
    fechaNacimiento: '',
    telefono: '',
    direccionResidencia: '',
    servicios: [{ 
      codigoCUPS: '', 
      cantidad: '', 
      descripcion: '' 
    }]
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    
    const { width, height } = page.getSize();
    const fontSize = 12;

    const helveticaFont = await pdfDoc.embedFont('Helvetica');
    page.setFont(helveticaFont);
    page.drawText('AUTORIZACIÓN DE SERVICIOS DE SALUD', {
      x: width / 2 - 100,
      y: height - 50,
      size: 16
    });

    // Añadir más detalles al PDF...
    let yPosition = height - 100;
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        page.drawText(`${key}: ${value}`, {
          x: 50,
          y: yPosition,
          size: fontSize
        });
        yPosition -= 20;
      }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'autorizacion_medica.pdf');
  };

  // Estilos para el componente (sin usar StyleSheet para evitar problemas de renderizado)
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    },
    inputContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
      marginBottom: '20px'
    },
    input: {
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <h1>Formulario de Autorización Médica</h1>
      
      {/* Input de Logo */}
      <input 
        type="file" 
        accept="image/*"
        onChange={handleLogoUpload}
        style={{marginBottom: '20px'}}
      />

      {/* Campos de Formulario */}
      <div style={styles.inputContainer}>
        {Object.keys(formData).map((key) => (
          key !== 'servicios' && (
            <input
              key={key}
              name={key}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={formData[key] as string}
              onChange={handleInputChange}
              style={styles.input}
            />
          )
        ))}
      </div>

      {/* Botones de Acción */}
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <button 
          onClick={generatePDF}
          style={styles.button}
        >
          Generar PDF
        </button>
      </div>

      {/* Vista Previa Condicional */}
      {isClient && (
        <div style={{marginTop: '20px', width: '100%', height: '600px'}}>
          {/* Vista previa opcional */}
        </div>
      )}
    </div>
  );
}