import { Bars } from 'react-loader-spinner';

export function Loader({ size = 80, color = '#6B6B6B', fullScreen = false }) {
  const loader = (
    <div className="flex items-center justify-center">
      <Bars
        height={size}
        width={size}
        color={color}
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
