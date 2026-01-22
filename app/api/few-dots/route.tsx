import { ImageResponse } from 'next/og';

export async function GET() {
  const dots = Array.from({ length: 10 }, (_, i) => (
    <div
      key={i}
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundColor: i < 5 ? '#ffffff' : '#3a3a3a',
        margin: 5,
      }}
    />
  ));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#1a1a1a',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {dots}
      </div>
    ),
    {
      width: 400,
      height: 200,
    }
  );
}
