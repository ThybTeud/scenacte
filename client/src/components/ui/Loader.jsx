import { Oval } from 'react-loader-spinner';

export function Loader({ size = 80, color = '#FF6B35', fullScreen = false }) {
  const loader = (
    <div className="flex items-center justify-center">
      <Oval
        height={size}
        width={size}
        color={color}
        secondaryColor="#FFD4C7"
        strokeWidth={4}
        strokeWidthSecondary={4}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        {loader}
      </div>
    );
  }

  return loader;
}
