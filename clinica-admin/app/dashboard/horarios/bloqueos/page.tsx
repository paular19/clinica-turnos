import { getProfesionales } from '@/lib/actions/admin';
import { getTodosLosBloqueos } from '@/lib/actions/bloqueos';
import BloqueosForm from './BloqueosForm';
import BloqueosLista from './BloqueosLista';

export const dynamic = 'force-dynamic';

export default async function BloqueosPage() {
    const [profesionales, bloqueos] = await Promise.all([
        getProfesionales(),
        getTodosLosBloqueos(),
    ]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Días Bloqueados
                </h1>
                <p className="text-gray-600">
                    Gestiona los días en que los profes no atienden (feriados, vacaciones, ausencias)
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulario para crear bloqueo */}
                <div>
                    <BloqueosForm profesionales={profesionales} />
                </div>

                {/* Lista de bloqueos */}
                <div>
                    <BloqueosLista bloqueos={bloqueos} />
                </div>
            </div>
        </div>
    );
}
