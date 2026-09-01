// Cliente REST mínimo para Supabase (PostgREST), sin dependencias externas.
async function fetchTable(table, query = "") {
  const { supabaseUrl, supabaseAnonKey } = window.CLARA_DEMO_CONFIG;
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!res.ok) throw new Error(`Error consultando ${table}: ${res.status}`);
  return res.json();
}

window.claraDemo = { fetchTable };
