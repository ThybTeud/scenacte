import { Modal } from './Modal';
import { Button } from './Button';

export function GuestDataMigrationModal({ isOpen, onClose, onMigrate, playsCount }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importer vos pièces"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>
            Non, supprimer mes données locales
          </Button>
          <Button onClick={onMigrate}>
            Oui, importer mes {playsCount} pièce{playsCount > 1 ? 's' : ''}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-black font-ui">
          Vous avez <strong>{playsCount} pièce{playsCount > 1 ? 's' : ''}</strong> enregistrée
          {playsCount > 1 ? 's' : ''} localement en mode invité.
        </p>
        <p className="text-black font-ui">
          Voulez-vous les importer dans votre nouveau compte pour pouvoir y accéder depuis
          tous vos appareils ?
        </p>
        <div className="bg-orange/10 border-2 border-orange rounded p-3">
          <p className="text-sm text-black font-ui">
            Si vous choisissez "Non", vos pièces locales seront supprimées pour éviter
            toute confusion.
          </p>
        </div>
      </div>
    </Modal>
  );
}
