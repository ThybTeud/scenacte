import Logo from '../ui/Logo';
import { Button, ButtonGroup } from '../ui/Button';
import Avatar from '../ui/Avatar';

/**
 * HeaderEditor component - En-tête pour l'éditeur de pièce avec style neobrutalist
 * @param {Object} props
 * @param {string} props.playTitle - Titre de la pièce en cours d'édition
 * @param {Object} props.user - Objet utilisateur
 * @param {Array<Object>} props.menuItems - Items du menu avatar
 * @param {Function} [props.onSettingsClick] - Callback pour le bouton Paramètres
 * @param {Function} [props.onStatsClick] - Callback pour le bouton Stats
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export default function HeaderEditor({
  playTitle,
  user,
  menuItems,
  onSettingsClick,
  onStatsClick,
  className = '',
}) {
  return (
    <header
      className={`
        bg-cream
        border-b-2
        border-black
        sticky
        top-0
        z-50
        ${className}
      `.trim()}
    >
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo à gauche avec titre de la pièce */}
          <div className="flex items-center">
            <Logo variant="short" playTitle={playTitle} />
          </div>

          {/* Groupe de boutons à droite */}
          <div className="flex items-center gap-3">
            {/* <ButtonGroup>
              <Button
                variant="secondary"
                size="md"
                grouped="left"
                onClick={onSettingsClick}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              >
                Paramètres
              </Button>
              <Button
                variant="secondary"
                size="md"
                grouped="right"
                onClick={onStatsClick}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
              >
                Stats
              </Button>
            </ButtonGroup> */}

            <Avatar user={user} menuItems={menuItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
