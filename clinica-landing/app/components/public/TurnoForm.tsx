'use client';

import { useState, useEffect } from 'react';

function generateCode() {
  return 'T-' + Math.random().toString(36).slice(2, 9).toUpperCase();
}

export default function TurnoForm() {
  const [specialty, setSpecialty] = useState('');
  const [professional, setProfessional] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [obra, setObra] = useState('');
  const [reason, setReason] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [searchDni, setSearchDni] = useState('');
  const [dniResult, setDniResult] = useState<string | null>(null);

  // Debounce search demo
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchDni.length >= 6) {
        // Demo: simulate found or not
        setDniResult(Math.random() > 0.6 ? 'Paciente existente' : null);
      } else {
        setDniResult(null);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [searchDni]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // For prototype: generate code and show confirmation
    const newCode = generateCode();
    setCode(newCode);

    // In production: call server action to persist, send email, etc.
    console.log('Turno creado (demo):', { specialty, professional, date, time, name, dni, email, phone, obra, reason, newCode });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Especialidad</label>
          <select value={specialty} onChange={e=>setSpecialty(e.target.value)} className="w-full p-2 border rounded mt-1">
            <option value="">Seleccionar</option>
            <option value="pediatria">Pediatría</option>
            <option value="gineco">Ginecología</option>
            <option value="trauma">Traumatología</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Profesional</label>
          <select value={professional} onChange={e=>setProfessional(e.target.value)} className="w-full p-2 border rounded mt-1">
            <option value="">Seleccionar</option>
            <option value="ana">Dra. Ana Pérez</option>
            <option value="juan">Dr. Juan Gómez</option>
            <option value="luis">Dr. Luis Martínez</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Fecha</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Hora</label>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="Nombre completo" />
        </div>

        <div>
          <label className="block text-sm font-medium">DNI</label>
          <input value={dni} onChange={e=>setDni(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="DNI" />
        </div>

        <div>
          <label className="block text-sm font-medium">Obra social</label>
          <input value={obra} onChange={e=>setObra(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="Obra social (opcional)" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="Teléfono" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="Email" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Motivo</label>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} className="w-full p-2 border rounded mt-1" rows={3} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <button type="submit" className="px-4 py-2 rounded bg-[var(--brand-600)] text-white font-medium">Confirmar turno</button>
          <div className="text-sm text-slate-600">Al confirmar recibirás un código en pantalla.</div>
        </div>
      </form>

      {code && (
        <div className="mt-4 p-4 border rounded bg-green-50">
          <div className="font-medium">Turno generado:</div>
          <div className="text-lg font-semibold">{code}</div>
          <div className="text-sm text-slate-600 mt-2">Guardá este código para consultas y reprogramaciones.</div>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium">Buscar paciente por DNI (demo)</label>
        <input value={searchDni} onChange={e=>setSearchDni(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="Ingrese DNI para buscar (demo)" />
        {dniResult === null ? (
          searchDni.length >= 6 ? <div className="text-sm text-red-600 mt-2">No existe</div> : <div className="text-sm text-slate-500 mt-2">Ingrese al menos 6 dígitos para buscar</div>
        ) : (
          <div className="text-sm text-green-700 mt-2">Resultado: {dniResult}</div>
        )}
      </div>
    </div>
  );
}