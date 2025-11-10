import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';

export function Preferences() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Préférences</h1>

          <Card>
            <div className="p-6">
              <p className="text-gray-600">
                Cette page est en cours de développement. Les préférences seront bientôt disponibles.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
