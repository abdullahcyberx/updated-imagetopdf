export const runtime = 'edge';

export async function POST() {
  return new Response(
    JSON.stringify({ error: 'Use client-side conversion instead' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}
