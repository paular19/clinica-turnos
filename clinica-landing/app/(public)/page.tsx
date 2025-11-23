import Hero from '../components/public/Hero';
import Services from '../components/public/Services';
import Team from '../components/public/Team';
import Contact from '../components/public/Contact';
import MisionVision from 'app/components/public/MisionVision';
import GaleriaClinica from 'app/components/public/GaleriaClinica';
import WhatsappFloat from 'app/components/ui/WhatsappFloat';

export default function Page() {
  return (
    <div>
      <Hero />
      <main className="container-max py-12 space-y-20">
        <section id="servicios">
          <Services />
        </section>

        <section id="equipo">
          <Team />
        </section>

        <section id="equipo">
          <MisionVision />
        </section>

        <section id="equipo">
          <GaleriaClinica />
        </section>

        <section id="contacto">
          <Contact />
        </section>

         <WhatsappFloat />
      </main>
    </div>
  );
}