'use client'

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Settings } from 'lucide-react'
import { SignatureField } from "@/components/signature-field"
import GeneralLayout from "@/components/GeneralLayout"

interface FirmaConfiguracion {
    firmaMedico?: string
    nombreMedico?: string
    registroMedico?: string
}

export default function ConfiguracionFirma() {
    const [loading, setLoading] = useState(false)
    const [firmaData, setFirmaData] = useState<FirmaConfiguracion>({
        firmaMedico: "",
        nombreMedico: "",
        registroMedico: "",
    })

    const updateFirmaData = (field: keyof FirmaConfiguracion, value: any) => {
        setFirmaData((prev) => ({ ...prev, [field]: value }))
    }

    const handleGuardarFirma = async () => {
        setLoading(true)
        
        try {
            // Aquí puedes agregar la lógica para guardar la configuración
            // Por ejemplo, enviarla a un servicio o localStorage
            console.log('Guardando configuración de firma:', firmaData)
            
            // Simular guardado
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            alert('Configuración de firma guardada correctamente')
        } catch (error) {
            console.error('Error al guardar:', error)
            alert('Error al guardar la configuración')
        } finally {
            setLoading(false)
        }
    }

    const limpiarFirma = () => {
        setFirmaData({
            firmaMedico: "",
            nombreMedico: "",
            registroMedico: "",
        })
    }

    return (
        <GeneralLayout>
            <div className="min-h-screen medical-bg-gradient">
                <div className="container mx-auto p-6 space-y-6">
                    <div className="flex items-center gap-4 animate-slide-in-up">
                        <div className="flex items-center gap-3">
                            <div className="medical-icon-wrapper">
                                <Settings className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold medical-text-gradient">Configuración de Firma</h1>
                                <p className="text-muted-foreground">Configure su firma para los formularios APH</p>
                            </div>
                        </div>
                    </div>

                    <Card className="medical-section animate-fade-in">
                        <CardHeader>
                            <CardTitle className="text-medical-primary">Configuración de Firma Médica</CardTitle>
                            <CardDescription>
                                Guarde su firma para que pueda ser utilizada automáticamente en los formularios de APH
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <SignatureField
                                        label="Firma del Médico/Paramédico"
                                        onChange={(signature) => {
                                            console.log('=== onChange FIRMA MÉDICO ===')
                                            console.log('Signature recibida:', signature ? 'SÍ' : 'NO')
                                            console.log('Estado ANTES de updateFirmaData:', firmaData.firmaMedico ? 'PRESENTE' : 'AUSENTE')
                                            
                                            updateFirmaData("firmaMedico", signature)
                                            
                                            setTimeout(() => {
                                                console.log('Estado DESPUÉS de updateFirmaData:', firmaData.firmaMedico ? 'PRESENTE' : 'AUSENTE')
                                            }, 0)
                                        }}
                                        placeholder="Dibuje su firma aquí"
                                        value={firmaData.firmaMedico}
                                    />

                                  
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="font-medium text-blue-900 mb-2">Información</h4>
                                        <p className="text-sm text-blue-700">
                                            Al guardar su firma aquí, esta será utilizada automáticamente en todos los 
                                            formularios APH que cree, ahorrándole tiempo en el proceso de documentación.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                        <h4 className="font-medium text-amber-900 mb-2">Nota Importante</h4>
                                        <p className="text-sm text-amber-700">
                                            Su firma se almacenará de forma segura y solo será visible en los 
                                            formularios que usted genere.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={limpiarFirma}
                                    className="medical-button-secondary"
                                >
                                    Limpiar Todo
                                </Button>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            console.log('=== ESTADO COMPLETO DE CONFIGURACIÓN ===')
                                            console.log('firmaData completo:', firmaData)
                                            console.log('firmaMedico:', firmaData.firmaMedico ? 'PRESENTE' : 'AUSENTE')
                                        }}
                                    >
                                        Ver Estado
                                    </Button>

                                    <Button
                                        onClick={handleGuardarFirma}
                                        disabled={loading || !firmaData.firmaMedico}
                                        className="medical-button-primary"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {loading ? "Guardando..." : "Guardar Configuración"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vista previa de la configuración guardada */}
                    {firmaData.firmaMedico && (
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Vista Previa</CardTitle>
                                <CardDescription>
                                    Así aparecerá su firma en los formularios APH
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Firma Configurada</Label>
                                        <div className="border rounded-lg p-4 bg-white min-h-[120px] flex items-center justify-center">
                                            {firmaData.firmaMedico ? (
                                                <img 
                                                    src={firmaData.firmaMedico} 
                                                    alt="Firma médico" 
                                                    className="max-h-16 object-contain"
                                                />
                                            ) : (
                                                <span className="text-gray-400">Sin firma</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Información del Profesional</Label>
                                        <div className="space-y-1 text-sm">
                                            <p><strong>Nombre:</strong> {firmaData.nombreMedico || "No especificado"}</p>
                                            <p><strong>Registro:</strong> {firmaData.registroMedico || "No especificado"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </GeneralLayout>
    )
}