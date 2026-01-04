import { Card } from '../ui/Card';
import Logo from '../ui/Logo';
import Footer from './Footer';

/**
 * AuthLayout component - Layout pour les pages d'authentification avec design neobrutalist
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu de la page
 * @param {string} props.title - Titre de la page (utilisé comme header de la Card)
 * @param {string} [props.subtitle] - Sous-titre optionnel
 */
export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <div className="flex justify-center">
            <Logo variant="full" />
          </div>
          {subtitle && (
            <p className="mt-4 text-center text-sm text-black font-ui">
              {subtitle}
            </p>
          )}
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card header={title}>
            {children}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
