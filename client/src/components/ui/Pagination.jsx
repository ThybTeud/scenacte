import { Button } from './Button';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Précédent
      </Button>

      <div className="flex space-x-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 font-ui text-black">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                px-3 py-2 rounded-brutal text-sm font-medium font-ui transition-all border-brutal border-black cursor-pointer
                ${
                  currentPage === page
                    ? 'bg-orange text-white shadow-brutal'
                    : 'bg-white text-black hover:bg-gray-50 shadow-brutal hover:-translate-x-[1px] hover:-translate-y-[1px]'
                }
              `}
            >
              {page}
            </button>
          );
        })}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Suivant
      </Button>
    </div>
  );
}
