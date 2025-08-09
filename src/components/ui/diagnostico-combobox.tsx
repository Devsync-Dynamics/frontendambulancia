"use client"

import * as React from "react"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandInput,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {Check, ChevronsUpDown, Loader2, Plus} from "lucide-react"
import {cn} from "@/lib/utils"
import {getDiagnosticos} from "@/services/Diagnostico.service";

type Diagnostico = {
    codigo: string
    nombre: string // descripcion legible
    descripcion?: string // codigo ICD-10
}


type DiagnosticoComboboxProps = {
    name?: string
    label?: string
    placeholder?: string
    value?: string
    required?: boolean
    description?: string
    className?: string
    onChange?: (value: string, selected?: Diagnostico | null) => void
}

// Debounce pequeño para no golpear el backend en cada tecla
function useDebouncedValue<T>(value: T, delay = 300) {
    const [debounced, setDebounced] = React.useState(value)
    React.useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

export function DiagnosticoCombobox({
                                        name = "diagnostico",
                                        label = "Diagnóstico *",
                                        placeholder = "Buscar o ingresar diagnóstico",
                                        value = "",
                                        required = true,
                                        description,
                                        className,
                                        onChange,
                                    }: DiagnosticoComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const debouncedQuery = useDebouncedValue(query, 300)
    const [loading, setLoading] = React.useState(false)
    const [items, setItems] = React.useState<Diagnostico[]>([])
    const [selected, setSelected] = React.useState<Diagnostico | null>(value ? {codigo: "custom", nombre: value} : null)

    // Mantener sincronizado si cambia value externo
    React.useEffect(() => {
        setSelected(value ? {codigo: "custom", nombre: value} : null)
    }, [value])

    const selectedValue = selected?.nombre ?? ""

    // Buscar cuando está abierto o cambia el query
    React.useEffect(() => {
        let ignore = false

        async function run() {
            setLoading(true)
            const data = await getDiagnosticos(debouncedQuery, 1, 10)
            if (!ignore) setItems(data)
            setLoading(false)
        }

        if (open) run()
        return () => {
            ignore = true
        }
    }, [debouncedQuery, open])


    function handleSelect(item: Diagnostico | null) {
        setSelected(item)
        onChange?.(item?.codigo ?? "", item)
        setOpen(false)
    }

    function handleCreateCustom() {
        if (!query.trim()) return
        const custom: Diagnostico = {codigo: "custom", nombre: query.trim()}
        handleSelect(custom)
    }

    const hasExactMatch = !!items.find((it) => it.nombre.toLocaleLowerCase() === (query || "").toLocaleLowerCase())

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={name}>{label}</Label>
            {/* Input oculto solo útil si usas <form action=...>, no afecta tu flujo con axios */}
            <input type="hidden" name={name} value={selectedValue}/>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={name}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full justify-between medical-input-focus", !selectedValue && "text-muted-foreground")}
                    >
                        <span className="truncate">{selectedValue || placeholder}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                        <div className="flex items-center gap-2 p-2">
                            <CommandInput
                                value={query}
                                onValueChange={setQuery}
                                placeholder={placeholder}
                                aria-label="Buscar diagnóstico"
                            />
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                        </div>
                        <CommandList>
                            {!loading && items.length === 0 ? (
                                <CommandEmpty>No se encontraron resultados</CommandEmpty>
                            ) : (
                                <>
                                    <CommandGroup heading="Resultados">
                                        {items.map((item) => {
                                            const isSelected = selected?.nombre.toLocaleLowerCase() === item.nombre.toLocaleLowerCase()
                                            console.log("item",item)
                                            return (

                                                <CommandItem key={item.codigo} value={item.codigo}
                                                             onSelect={() => handleSelect(item)}>
                                                    <Check
                                                        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}/>
                                                    <span className="truncate">
                                                        {item.codigo ? `${item.codigo} - ${item.nombre}` : ''}
                          </span>
                                                </CommandItem>
                                            )
                                        })}
                                    </CommandGroup>
                                </>
                            )}
                            <CommandSeparator/>
                            {/*<CommandGroup>*/}
                            {/*    <CommandItem disabled={!query.trim() || hasExactMatch} onSelect={handleCreateCustom}>*/}
                            {/*        <Plus className="mr-2 h-4 w-4" />*/}
                            {/*        {query.trim() ? `Crear "${query.trim()}"` : "Escribe para crear un diagnóstico"}*/}
                            {/*    </CommandItem>*/}
                            {/*</CommandGroup>*/}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {description ? (
                <p id={`${name}-description`} className="text-sm text-muted-foreground">
                    {description}
                </p>
            ) : null}

            {required && <span className="sr-only">{"Campo requerido"}</span>}
        </div>
    )
}
